'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { VehicleData } from '@/types/gta';
import { useGameStore } from '@/store/useGameStore';
import { soundFx } from '@/lib/soundEffects';
import { registerVehicle, unregisterVehicle } from '@/lib/vehicleRegistry';

interface DrivableVehicleProps {
  vehicle: VehicleData;
}

export function DrivableVehicle({ vehicle }: DrivableVehicleProps) {
  const rbRef = useRef<RapierRigidBody>(null);
  const frontLeftWheelRef = useRef<THREE.Group>(null);
  const frontRightWheelRef = useRef<THREE.Group>(null);

  const playerMode = useGameStore((s) => s.playerMode);
  const activeVehicleId = useGameStore((s) => s.activeVehicleId);
  const nearbyVehicleId = useGameStore((s) => s.nearbyVehicleId);
  const setPlayerMode = useGameStore((s) => s.setPlayerMode);
  const updateVehicleTelemetry = useGameStore((s) => s.updateVehicleTelemetry);
  const setPlayerPosition = useGameStore((s) => s.setPlayerPosition);
  const headlightsOn = useGameStore((s) => s.headlightsOn);

  const isDrivingThis = playerMode === 'DRIVING' && activeVehicleId === vehicle.id;
  const isNearby = playerMode === 'FOOT' && nearbyVehicleId === vehicle.id;

  // Key tracking
  const keys = useRef<{
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    handbrake: boolean;
  }>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    handbrake: false,
  });

  const [steerAngle, setSteerAngle] = useState(0);
  const [isBraking, setIsBraking] = useState(false);
  const [sirenTick, setSirenTick] = useState(0);

  useEffect(() => {
    return () => {
      unregisterVehicle(vehicle.id);
    };
  }, [vehicle.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDrivingThis) return;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.current.forward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        keys.current.backward = true;
        setIsBraking(true);
      }
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.current.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.current.right = true;
      if (e.code === 'Space') {
        keys.current.handbrake = true;
        soundFx.playTireDrift();
      }
      if (e.code === 'KeyH') {
        soundFx.playHorn();
      }
      // Exit vehicle with F, E, or Enter
      if (e.code === 'KeyF' || e.code === 'KeyE' || e.code === 'Enter' || e.code === 'NumpadEnter') {
        const pos = rbRef.current?.translation();
        const rot = rbRef.current?.rotation();
        if (pos && rot) {
          const euler = new THREE.Euler().setFromQuaternion(
            new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w),
            'YXZ'
          );
          const heading = euler.y;
          // Step out to the left (driver's side) relative to car orientation
          const sideX = -Math.cos(heading) * 2.3;
          const sideZ = Math.sin(heading) * 2.3;
          setPlayerMode('FOOT', null);
          setPlayerPosition([pos.x + sideX, Math.max(pos.y, 0.9), pos.z + sideZ]);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.current.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        keys.current.backward = false;
        setIsBraking(false);
      }
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.current.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.current.right = false;
      if (e.code === 'Space') keys.current.handbrake = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isDrivingThis, setPlayerMode, setPlayerPosition]);

  useFrame((_, delta) => {
    if (!rbRef.current) return;

    const pos = rbRef.current.translation();
    const rot = rbRef.current.rotation();
    const linvel = rbRef.current.linvel();

    // Vehicle heading angle from quaternion
    const euler = new THREE.Euler().setFromQuaternion(
      new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w),
      'YXZ'
    );
    const heading = euler.y;

    // Register active vehicle position for accurate proximity & hijacking
    registerVehicle({
      id: vehicle.id,
      name: vehicle.modelName,
      type: vehicle.vehicleType,
      pos: { x: pos.x, y: pos.y, z: pos.z },
      heading,
    });

    // Flashing police siren effect
    if (vehicle.vehicleType === 'POLICE') {
      setSirenTick((prev) => (prev + delta * 8) % 2);
    }

    if (!isDrivingThis) return;

    // Synchronize player position with car
    setPlayerPosition([pos.x, pos.y, pos.z]);

    // Calculate current speed
    const currentSpeed = Math.hypot(linvel.x, linvel.z);
    const speedMph = Math.round(currentSpeed * 2.237);
    updateVehicleTelemetry(speedMph, vehicle.health);

    // Forward unit vector
    const fwdX = -Math.sin(heading);
    const fwdZ = -Math.cos(heading);

    // Steering logic
    let targetSteer = 0;
    if (keys.current.left) targetSteer = 0.55;
    if (keys.current.right) targetSteer = -0.55;
    const smoothSteer = THREE.MathUtils.lerp(steerAngle, targetSteer, delta * 8);
    setSteerAngle(smoothSteer);

    // Turn impulse depends on forward speed
    if (Math.abs(smoothSteer) > 0.05 && currentSpeed > 0.5) {
      const turnFactor = (keys.current.backward ? -1 : 1) * smoothSteer * vehicle.handling * 8.0;
      rbRef.current.applyTorqueImpulse({ x: 0, y: turnFactor, z: 0 }, true);
    }

    // Drive forward / reverse throttle
    if (keys.current.forward) {
      const forceMag = vehicle.acceleration * 18;
      rbRef.current.applyImpulse(
        { x: fwdX * forceMag * delta, y: 0, z: fwdZ * forceMag * delta },
        true
      );
    } else if (keys.current.backward) {
      const reverseMag = vehicle.acceleration * 10;
      rbRef.current.applyImpulse(
        { x: -fwdX * reverseMag * delta, y: 0, z: -fwdZ * reverseMag * delta },
        true
      );
    }

    // Drift / lateral friction damping
    const sideX = Math.cos(heading);
    const sideZ = -Math.sin(heading);
    const lateralVel = linvel.x * sideX + linvel.z * sideZ;
    const grip = keys.current.handbrake ? 0.92 : 0.75;
    rbRef.current.setLinvel(
      {
        x: linvel.x - lateralVel * sideX * (1 - grip),
        y: linvel.y,
        z: linvel.z - lateralVel * sideZ * (1 - grip),
      },
      true
    );

    // Keep vehicle right-side-up
    if (Math.abs(euler.x) > 0.6 || Math.abs(euler.z) > 0.6) {
      rbRef.current.setRotation({ x: 0, y: rot.y, z: 0, w: rot.w }, true);
    }
  });

  return (
    <RigidBody
      ref={rbRef}
      position={vehicle.position}
      rotation={[0, vehicle.rotation, 0]}
      colliders="cuboid"
      mass={vehicle.vehicleType === 'MOTO' ? 250 : 1200}
      friction={0.8}
      restitution={0.1}
      linearDamping={0.4}
      angularDamping={1.5}
    >
      <group>
        {/* Car Body / Chassis */}
        <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
          <boxGeometry
            args={
              vehicle.vehicleType === 'MOTO'
                ? [0.8, 0.9, 2.2]
                : [2.1, 0.7, 4.4]
            }
          />
          <meshStandardMaterial
            color={vehicle.color}
            metalness={0.7}
            roughness={0.25}
          />
        </mesh>

        {/* Cabin / Windshield (for 4-wheel cars) */}
        {vehicle.vehicleType !== 'MOTO' && (
          <mesh castShadow position={[0, 1.0, -0.2]}>
            <boxGeometry args={[1.7, 0.65, 2.4]} />
            <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} />
          </mesh>
        )}

        {/* Headlights & Forward Spotlights */}
        <group position={[0, 0.5, -2.25]}>
          <mesh position={[-0.7, 0, 0]}>
            <boxGeometry args={[0.3, 0.2, 0.1]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          <mesh position={[0.7, 0, 0]}>
            <boxGeometry args={[0.3, 0.2, 0.1]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          {headlightsOn && isDrivingThis && (
            <>
              <spotLight
                position={[-0.7, 0, 0]}
                target-position={[-0.7, 0, -20]}
                intensity={45}
                distance={35}
                angle={0.45}
                penumbra={0.6}
                color="#fef08a"
              />
              <spotLight
                position={[0.7, 0, 0]}
                target-position={[0.7, 0, -20]}
                intensity={45}
                distance={35}
                angle={0.45}
                penumbra={0.6}
                color="#fef08a"
              />
            </>
          )}
        </group>

        {/* Taillights */}
        <group position={[0, 0.5, 2.25]}>
          <mesh position={[-0.7, 0, 0]}>
            <boxGeometry args={[0.35, 0.18, 0.1]} />
            <meshBasicMaterial color={isBraking ? '#ff0000' : '#880000'} />
          </mesh>
          <mesh position={[0.7, 0, 0]}>
            <boxGeometry args={[0.35, 0.18, 0.1]} />
            <meshBasicMaterial color={isBraking ? '#ff0000' : '#880000'} />
          </mesh>
        </group>

        {/* Police Siren Lightbar */}
        {vehicle.vehicleType === 'POLICE' && (
          <group position={[0, 1.4, -0.2]}>
            <mesh position={[-0.4, 0, 0]}>
              <boxGeometry args={[0.4, 0.15, 0.3]} />
              <meshBasicMaterial color={sirenTick > 1 ? '#0066ff' : '#001133'} />
            </mesh>
            <mesh position={[0.4, 0, 0]}>
              <boxGeometry args={[0.4, 0.15, 0.3]} />
              <meshBasicMaterial color={sirenTick <= 1 ? '#ff0033' : '#330011'} />
            </mesh>
            {isDrivingThis && (
              <pointLight
                position={[0, 0.2, 0]}
                intensity={20}
                distance={15}
                color={sirenTick > 1 ? '#0066ff' : '#ff0033'}
              />
            )}
          </group>
        )}

        {/* Wheels */}
        {/* Front Left */}
        <group ref={frontLeftWheelRef} position={[-1.1, 0.1, -1.3]} rotation={[0, steerAngle, 0]}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
            <meshStandardMaterial color="#111827" roughness={0.9} />
          </mesh>
        </group>
        {/* Front Right */}
        <group ref={frontRightWheelRef} position={[1.1, 0.1, -1.3]} rotation={[0, steerAngle, 0]}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
            <meshStandardMaterial color="#111827" roughness={0.9} />
          </mesh>
        </group>
        {/* Rear Left */}
        <group position={[-1.1, 0.1, 1.3]}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
            <meshStandardMaterial color="#111827" roughness={0.9} />
          </mesh>
        </group>
        {/* Rear Right */}
        <group position={[1.1, 0.1, 1.3]}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
            <meshStandardMaterial color="#111827" roughness={0.9} />
          </mesh>
        </group>

        {/* 3D Take Car Floating Marker */}
        {isNearby && (
          <group position={[0, 2.3, 0]}>
            <mesh rotation={[0, sirenTick * 3, 0]}>
              <octahedronGeometry args={[0.32, 0]} />
              <meshStandardMaterial
                color="#f59e0b"
                emissive="#fbbf24"
                emissiveIntensity={0.9}
                roughness={0.2}
              />
            </mesh>
            <pointLight intensity={8} distance={3.5} color="#f59e0b" />
          </group>
        )}
      </group>
    </RigidBody>
  );
}
