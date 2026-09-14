'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { VehicleData } from '@/types/gta';
import { useGameStore } from '@/store/useGameStore';
import { soundFx } from '@/lib/soundEffects';
import { registerVehicle, unregisterVehicle } from '@/lib/vehicleRegistry';
import { VehicleModel } from './VehicleModel';

interface VehicleControllerProps {
  vehicle: VehicleData;
}

export function VehicleController({ vehicle }: VehicleControllerProps) {
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
  const cycleRadio = useGameStore((s) => s.cycleRadio);

  const isDrivingThis = playerMode === 'DRIVING' && activeVehicleId === vehicle.id;
  const isNearby = playerMode === 'FOOT' && nearbyVehicleId === vehicle.id;

  const [steerAngle, setSteerAngle] = useState(0);
  const [sirenTick, setSirenTick] = useState(0);
  const [isBraking, setIsBraking] = useState(false);

  const speedRef = useRef(0);
  const reverseHoldTimer = useRef(0);
  const lastMphRef = useRef(-1);
  const lastGearRef = useRef('');

  const driveKeys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    handbrake: false,
  });

  useEffect(() => {
    return () => unregisterVehicle(vehicle.id);
  }, [vehicle.id]);

  // Handle driving inputs, vehicle exit, horn, and radio
  useEffect(() => {
    if (!isDrivingThis) {
      driveKeys.current = { forward: false, backward: false, left: false, right: false, handbrake: false };
      return;
    }

    rbRef.current?.wakeUp();

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key ? e.key.toLowerCase() : '';
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || k === 'w' || e.key === 'ArrowUp') driveKeys.current.forward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown' || k === 's' || e.key === 'ArrowDown') driveKeys.current.backward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft' || k === 'a' || e.key === 'ArrowLeft') driveKeys.current.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight' || k === 'd' || e.key === 'ArrowRight') driveKeys.current.right = true;
      if (e.code === 'Space' || e.key === ' ') driveKeys.current.handbrake = true;

      if (e.code === 'KeyH' || k === 'h') {
        soundFx.playHorn();
      }

      if (e.code === 'KeyR' || k === 'r') {
        cycleRadio();
      }

      // Exit Vehicle
      if (
        e.code === 'KeyF' ||
        e.code === 'KeyE' ||
        e.code === 'Enter' ||
        e.code === 'NumpadEnter' ||
        k === 'f' ||
        k === 'e'
      ) {
        const pos = rbRef.current?.translation();
        const rot = rbRef.current?.rotation();
        if (pos && rot) {
          const euler = new THREE.Euler().setFromQuaternion(
            new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w),
            'YXZ'
          );
          const heading = euler.y;
          // Step out to driver's side (left)
          const sideX = -Math.cos(heading) * 2.3;
          const sideZ = Math.sin(heading) * 2.3;
          setPlayerMode('FOOT', null);
          setPlayerPosition([pos.x + sideX, Math.max(pos.y, 0.9), pos.z + sideZ]);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key ? e.key.toLowerCase() : '';
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || k === 'w' || e.key === 'ArrowUp') driveKeys.current.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown' || k === 's' || e.key === 'ArrowDown') {
        driveKeys.current.backward = false;
        reverseHoldTimer.current = 0;
      }
      if (e.code === 'KeyA' || e.code === 'ArrowLeft' || k === 'a' || e.key === 'ArrowLeft') driveKeys.current.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight' || k === 'd' || e.key === 'ArrowRight') driveKeys.current.right = false;
      if (e.code === 'Space' || e.key === ' ') driveKeys.current.handbrake = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      driveKeys.current = { forward: false, backward: false, left: false, right: false, handbrake: false };
      reverseHoldTimer.current = 0;
    };
  }, [isDrivingThis, setPlayerMode, setPlayerPosition, cycleRadio]);

  useFrame((_, delta) => {
    if (!rbRef.current) return;

    const pos = rbRef.current.translation();
    const rot = rbRef.current.rotation();
    const linvel = rbRef.current.linvel();

    const euler = new THREE.Euler().setFromQuaternion(
      new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w),
      'YXZ'
    );
    const heading = euler.y;

    // Live coordinates for carjacking and camera tracking
    registerVehicle({
      id: vehicle.id,
      name: vehicle.modelName,
      type: vehicle.vehicleType,
      pos: { x: pos.x, y: pos.y, z: pos.z },
      heading,
    });

    if (vehicle.vehicleType === 'POLICE') {
      setSirenTick((prev) => (prev + delta * 8) % 2);
    }

    if (!isDrivingThis) return;

    // Synchronize player position with vehicle
    setPlayerPosition([pos.x, pos.y, pos.z], heading);

    // Forward & Right vectors
    const fwdX = -Math.sin(heading);
    const fwdZ = -Math.cos(heading);
    const rightX = Math.cos(heading);
    const rightZ = -Math.sin(heading);

    // Decompose current velocity into vehicle-relative axes
    const lateralSpeed = linvel.x * rightX + linvel.z * rightZ;

    // Supercar top speed can reach 60 m/s (~135 MPH)
    const maxSpeed = vehicle.topSpeed || 55.0;
    const maxReverse = -13.0; // Reverse up to ~29 MPH
    const accelRate = vehicle.acceleration || 38.0;

    let gear = 'D';
    let brakingActive = false;

    if (driveKeys.current.handbrake) {
      // Handbrake drift & brake
      gear = 'P';
      brakingActive = true;
      speedRef.current = THREE.MathUtils.lerp(speedRef.current, 0, delta * 4.8);
      if (Math.abs(speedRef.current) > 1.2) {
        soundFx.playTireDrift();
      }
    } else if (driveKeys.current.forward) {
      reverseHoldTimer.current = 0;
      if (speedRef.current < -0.4) {
        // [W] smoothly brakes when vehicle is rolling backward
        brakingActive = true;
        speedRef.current = Math.min(0, speedRef.current + 24.0 * delta);
        gear = 'R';
      } else {
        // Smooth non-linear torque curve: explosive low-end, smooth top-end pull
        const speedRatio = Math.min(1.0, Math.max(0, speedRef.current / maxSpeed));
        const torqueCurve = Math.max(0.2, 1.0 - Math.pow(speedRatio, 1.5));
        speedRef.current = Math.min(maxSpeed, speedRef.current + accelRate * torqueCurve * delta);

        const mph = speedRef.current * 2.237;
        gear = mph < 22 ? 'D1' : mph < 44 ? 'D2' : mph < 70 ? 'D3' : mph < 98 ? 'D4' : 'D5';
      }
    } else if (driveKeys.current.backward) {
      if (speedRef.current > 0.4) {
        // [S] Phase 1: Progressive hydraulic braking to a complete halt
        brakingActive = true;
        const progressiveBrake = Math.min(36.0, Math.max(18.0, speedRef.current * 0.95));
        speedRef.current = Math.max(0, speedRef.current - progressiveBrake * delta);
        const mph = speedRef.current * 2.237;
        gear = mph < 18 ? 'D1' : mph < 45 ? 'D2' : 'D3';
        reverseHoldTimer.current = 0;
      } else {
        // [S] Phase 2: Full stop held, smoothly engage reverse gear
        speedRef.current = 0;
        reverseHoldTimer.current += delta;
        if (reverseHoldTimer.current > 0.18) {
          brakingActive = true;
          speedRef.current = Math.max(maxReverse, speedRef.current - 14.0 * delta);
          gear = 'R';
        } else {
          gear = 'P';
        }
      }
    } else {
      // Natural rolling resistance and aerodynamic coasting
      reverseHoldTimer.current = 0;
      if (Math.abs(speedRef.current) < 0.2) {
        speedRef.current = 0;
      } else {
        const aeroDrag = (3.5 + Math.abs(speedRef.current) * 0.08) * delta;
        speedRef.current = speedRef.current > 0 ? Math.max(0, speedRef.current - aeroDrag) : Math.min(0, speedRef.current + aeroDrag);
      }
      const mph = Math.abs(speedRef.current) * 2.237;
      gear = mph === 0 ? 'D' : mph < 22 ? 'D1' : mph < 44 ? 'D2' : mph < 70 ? 'D3' : mph < 98 ? 'D4' : 'D5';
    }

    if (isBraking !== brakingActive) {
      setIsBraking(brakingActive);
    }

    // Speed-sensitive steering calculations (prevents spin-outs at 120+ MPH)
    let steerInput = 0;
    if (driveKeys.current.left) steerInput += 1;
    if (driveKeys.current.right) steerInput -= 1;

    const currentAbsSpeed = Math.abs(speedRef.current);
    const speedRatio = Math.min(1.0, currentAbsSpeed / maxSpeed);
    // At high speed, steering sensitivity gently tightens for rock-solid stability
    const highSpeedDamp = THREE.MathUtils.lerp(1.0, 0.46, speedRatio);
    const targetSteerAngle = steerInput * 0.52 * highSpeedDamp;
    const smoothSteer = THREE.MathUtils.lerp(steerAngle, targetSteerAngle, delta * 14);
    setSteerAngle(smoothSteer);

    // Apply turning angular velocity (smoothly scaled with forward velocity)
    if (Math.abs(smoothSteer) > 0.01 && currentAbsSpeed > 0.2) {
      const isReverse = speedRef.current < 0;
      const baseHandling = vehicle.handling || 0.9;
      // Handbrake gives snappy drift turn authority
      const driftTurnBonus = driveKeys.current.handbrake ? 1.6 : 1.0;
      const turnSpeed = smoothSteer * baseHandling * 3.2 * driftTurnBonus * (isReverse ? -1 : 1);
      rbRef.current.setAngvel({ x: 0, y: turnSpeed, z: 0 }, true);
    } else {
      rbRef.current.setAngvel({ x: 0, y: THREE.MathUtils.lerp(rbRef.current.angvel().y, 0, delta * 12), z: 0 }, true);
    }

    // Lateral grip vs drift physics
    const driftGrip = driveKeys.current.handbrake ? 0.65 : 0.95;
    const newLateralSpeed = THREE.MathUtils.lerp(lateralSpeed, 0, delta * 20.0 * driftGrip);

    // Compose final velocity vector
    const newLinvelX = fwdX * speedRef.current + rightX * newLateralSpeed;
    const newLinvelZ = fwdZ * speedRef.current + rightZ * newLateralSpeed;

    rbRef.current.setLinvel(
      {
        x: newLinvelX,
        y: linvel.y,
        z: newLinvelZ,
      },
      true
    );

    // Update telemetry for HUD speedometer
    const currentSpeedMph = Math.round(currentAbsSpeed * 2.237);
    if (currentSpeedMph !== lastMphRef.current || gear !== lastGearRef.current) {
      lastMphRef.current = currentSpeedMph;
      lastGearRef.current = gear;
      updateVehicleTelemetry(currentSpeedMph, vehicle.health, gear);
    }
  });

  return (
    <RigidBody
      ref={rbRef}
      position={vehicle.position}
      rotation={[0, vehicle.rotation, 0]}
      colliders={false}
      canSleep={false}
      mass={vehicle.vehicleType === 'MOTO' ? 240 : 1350}
      linearDamping={0.12}
      angularDamping={1.8}
      enabledRotations={[false, true, false]}
    >
      <CuboidCollider
        args={vehicle.vehicleType === 'MOTO' ? [0.35, 0.45, 1.0] : [1.05, 0.5, 2.2]}
        position={[0, vehicle.vehicleType === 'MOTO' ? 0.55 : 0.65, 0]}
        friction={0.02}
        restitution={0.02}
      />

      <group>
        <VehicleModel
          vehicle={vehicle}
          steerAngle={steerAngle}
          sirenTick={sirenTick}
          headlightsOn={headlightsOn}
          frontLeftWheelRef={frontLeftWheelRef}
          frontRightWheelRef={frontRightWheelRef}
        />

        {/* Dynamic Glowing Brake Lights when Braking / Reversing */}
        {isBraking && (
          <group position={[0, 0.72, 2.35]}>
            <mesh position={[-0.75, 0, 0]}>
              <boxGeometry args={[0.28, 0.1, 0.04]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3.5} />
            </mesh>
            <mesh position={[0.75, 0, 0]}>
              <boxGeometry args={[0.28, 0.1, 0.04]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3.5} />
            </mesh>
            <pointLight position={[0, 0, 0.2]} intensity={18} distance={6} color="#ef4444" />
          </group>
        )}

        {/* 3D Contextual Carjacking Marker when on foot and nearby */}
        {isNearby && (
          <group position={[0, vehicle.vehicleType === 'MOTO' ? 1.6 : 2.3, 0]}>
            <mesh rotation={[0, sirenTick * 3, 0]}>
              <octahedronGeometry args={[0.3, 0]} />
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
