'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { findNearestVehicle } from '@/lib/vehicleRegistry';
import { executeCarjack } from '@/game/vehicles/CarjackingSystem';
import { RealCharacterModel } from '@/game/player/RealCharacterModel';

export function PlayerCharacter() {
  const rbRef = useRef<RapierRigidBody>(null);

  const playerMode = useGameStore((s) => s.playerMode);
  const position = useGameStore((s) => s.position);
  const cameraAngle = useGameStore((s) => s.cameraAngle);
  const setPlayerPosition = useGameStore((s) => s.setPlayerPosition);
  const setPlayerMode = useGameStore((s) => s.setPlayerMode);
  const nearbyVehicleId = useGameStore((s) => s.nearbyVehicleId);
  const nearbyVehicleName = useGameStore((s) => s.nearbyVehicleName);
  const setNearbyVehicle = useGameStore((s) => s.setNearbyVehicle);
  const equippedWeapon = useGameStore((s) => s.equippedWeapon);
  const fireWeapon = useGameStore((s) => s.fireWeapon);
  const isPhoneOpen = useGameStore((s) => s.isPhoneOpen);
  const playerSkin = useGameStore((s) => s.playerSkin);

  const [muzzleFlash, setMuzzleFlash] = useState(false);
  const [locomotionState, setLocomotionState] = useState<'IDLE' | 'WALK' | 'RUN'>('IDLE');
  const playerHeadingRef = useRef(0);
  const charGroupRef = useRef<THREE.Group>(null);

  const keys = useRef<{
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    sprint: boolean;
    jump: boolean;
  }>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPhoneOpen) return;

      const k = e.key ? e.key.toLowerCase() : '';
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || k === 'w' || k === 'arrowup') keys.current.forward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown' || k === 's' || k === 'arrowdown') keys.current.backward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft' || k === 'a' || k === 'arrowleft') keys.current.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight' || k === 'd' || k === 'arrowright') keys.current.right = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || k === 'shift' || e.shiftKey) keys.current.sprint = true;
      if (e.code === 'Space' || k === ' ') keys.current.jump = true;

      // Enter / Hijack vehicle with [F], [E], or [Enter]
      if (
        (e.code === 'KeyF' || e.code === 'KeyE' || k === 'f' || k === 'e' || e.code === 'Enter' || e.code === 'NumpadEnter') &&
        playerMode === 'FOOT'
      ) {
        const curPos = rbRef.current ? rbRef.current.translation() : { x: position[0], y: position[1], z: position[2] };
        const nearest = findNearestVehicle(curPos.x, curPos.z, 5.5);
        const targetId = nearbyVehicleId || nearest?.vehicle.id;
        const targetName = nearbyVehicleName || nearest?.vehicle.name;

        if (targetId && nearest) {
          const hasDriver = targetId.startsWith('traffic_') || Boolean(nearest.vehicle.name?.includes('Sedan'));
          executeCarjack(
            targetId,
            targetName || 'Vehicle',
            nearest.vehicle.pos,
            nearest.vehicle.heading,
            hasDriver,
            () => {
              setPlayerMode('DRIVING', targetId, targetName);
            }
          );
          return;
        }
      }

      // Attack / Shoot with [J] or [Left Ctrl]
      if ((e.code === 'KeyJ' || e.code === 'ControlLeft' || k === 'j') && playerMode === 'FOOT') {
        triggerAttack();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key ? e.key.toLowerCase() : '';
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || k === 'w' || k === 'arrowup') keys.current.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown' || k === 's' || k === 'arrowdown') keys.current.backward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft' || k === 'a' || k === 'arrowleft') keys.current.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight' || k === 'd' || k === 'arrowright') keys.current.right = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || k === 'shift') keys.current.sprint = false;
      if (e.code === 'Space' || k === ' ') keys.current.jump = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (playerMode === 'FOOT' && !isPhoneOpen && e.button === 0) {
        triggerAttack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [playerMode, nearbyVehicleId, nearbyVehicleName, isPhoneOpen, position, setPlayerMode]);

  const triggerAttack = () => {
    const success = fireWeapon();
    if (success && (equippedWeapon === 'PISTOL' || equippedWeapon === 'MICRO_SMG')) {
      setMuzzleFlash(true);
      setTimeout(() => setMuzzleFlash(false), 70);
    }
  };

  useFrame((state, delta) => {
    if (!rbRef.current || playerMode === 'DRIVING') return;

    const currentPos = rbRef.current.translation();
    const linvel = rbRef.current.linvel();

    // Check proximity to all drivable vehicles
    const nearest = findNearestVehicle(currentPos.x, currentPos.z, 5.0);
    if (nearest) {
      if (nearbyVehicleId !== nearest.vehicle.id) {
        setNearbyVehicle(nearest.vehicle.id, nearest.vehicle.name);
      }
    } else if (nearbyVehicleId !== null) {
      setNearbyVehicle(null, null);
    }

    // Input axes
    let inputX = 0;
    let inputZ = 0;
    if (keys.current.forward) inputZ -= 1;
    if (keys.current.backward) inputZ += 1;
    if (keys.current.left) inputX -= 1;
    if (keys.current.right) inputX += 1;

    const isMoving = inputX !== 0 || inputZ !== 0;

    if (isMoving) {
      const len = Math.hypot(inputX, inputZ);
      const normX = inputX / len;
      const normZ = inputZ / len;

      // Rotate inputs relative to the third-person camera angle
      const fwdX = -Math.sin(cameraAngle);
      const fwdZ = -Math.cos(cameraAngle);
      const rightX = Math.cos(cameraAngle);
      const rightZ = -Math.sin(cameraAngle);

      const moveX = fwdX * (-normZ) + rightX * normX;
      const moveZ = fwdZ * (-normZ) + rightZ * normX;

      const isSprinting = keys.current.sprint;
      const targetSpeed = isSprinting ? 12.5 : 5.8;
      const targetVelX = moveX * targetSpeed;
      const targetVelZ = moveZ * targetSpeed;

      // Ensure rigid body is awake and snappy
      rbRef.current.wakeUp();

      // Responsive, snappy acceleration
      rbRef.current.setLinvel(
        {
          x: THREE.MathUtils.lerp(linvel.x, targetVelX, delta * 18),
          y: linvel.y,
          z: THREE.MathUtils.lerp(linvel.z, targetVelZ, delta * 18),
        },
        true
      );

      // Character faces world movement direction (front is -Z)
      const targetHeading = Math.atan2(moveX, -moveZ);
      playerHeadingRef.current = targetHeading;
      if (charGroupRef.current) {
        charGroupRef.current.rotation.y = targetHeading;
      }

      const nextLocomotion = isSprinting ? 'RUN' : 'WALK';
      if (locomotionState !== nextLocomotion) {
        setLocomotionState(nextLocomotion);
      }
    } else {
      // Smooth deceleration to stop
      rbRef.current.setLinvel(
        {
          x: THREE.MathUtils.lerp(linvel.x, 0, delta * 16),
          y: linvel.y,
          z: THREE.MathUtils.lerp(linvel.z, 0, delta * 16),
        },
        true
      );

      if (locomotionState !== 'IDLE') {
        setLocomotionState('IDLE');
      }
    }

    // Jump impulse
    if (keys.current.jump && Math.abs(linvel.y) < 0.15) {
      rbRef.current.wakeUp();
      rbRef.current.applyImpulse({ x: 0, y: 7.8, z: 0 }, true);
    }

    // Update store position with camera
    setPlayerPosition([currentPos.x, currentPos.y, currentPos.z], playerHeadingRef.current);
  });

  // Hide on-foot model while driving
  if (playerMode === 'DRIVING') {
    return null;
  }

  const animSpeed = locomotionState === 'RUN' ? 10.0 : locomotionState === 'WALK' ? 3.5 : 0;

  return (
    <RigidBody
      ref={rbRef}
      position={[position[0], position[1] || 1.2, position[2]]}
      colliders={false}
      lockRotations
      canSleep={false}
      mass={75}
      linearDamping={0.15}
    >
      {/* Low-friction capsule collider: prevents snagging, runs ultra-smoothly */}
      <CapsuleCollider args={[0.55, 0.35]} position={[0, 0.9, 0]} friction={0} restitution={0} />

      {/* Real 3D Animated Human Protagonist */}
      <group ref={charGroupRef} rotation={[0, playerHeadingRef.current, 0]}>
        <RealCharacterModel
          speed={animSpeed}
          isSprinting={locomotionState === 'RUN'}
          modelType={playerSkin || 'CIVILIAN'}
          hasDuffleBag={true}
        />

        {/* Muzzle Flash Light when firing weapon */}
        {muzzleFlash && (
          <group position={[0.2, 1.2, -0.6]}>
            <pointLight color="#f59e0b" intensity={25} distance={12} decay={2} />
            <mesh>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        )}
      </group>
    </RigidBody>
  );
}
