'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { findNearestVehicle } from '@/lib/vehicleRegistry';
import { PlayerModel, PlayerModelRefs } from './PlayerModel';
import { computeLimbPose, AnimationState } from './PlayerAnimations';
import { usePlayerCombat } from './PlayerCombat';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';

export function PlayerController() {
  const rbRef = useRef<RapierRigidBody>(null);
  const modelRefs: PlayerModelRefs = {
    bodyGroup: useRef<THREE.Group>(null),
    headGroup: useRef<THREE.Group>(null),
    leftArm: useRef<THREE.Group>(null),
    rightArm: useRef<THREE.Group>(null),
    leftLeg: useRef<THREE.Group>(null),
    rightLeg: useRef<THREE.Group>(null),
    duffleBag: useRef<THREE.Group>(null),
  };

  const playerMode = useGameStore((s) => s.playerMode);
  const position = useGameStore((s) => s.position);
  const cameraAngle = useGameStore((s) => s.cameraAngle);
  const setPlayerPosition = useGameStore((s) => s.setPlayerPosition);
  const setPlayerMode = useGameStore((s) => s.setPlayerMode);
  const nearbyVehicleId = useGameStore((s) => s.nearbyVehicleId);
  const nearbyVehicleName = useGameStore((s) => s.nearbyVehicleName);
  const setNearbyVehicle = useGameStore((s) => s.setNearbyVehicle);
  const isPhoneOpen = useGameStore((s) => s.isPhoneOpen);

  const [muzzleFlash, setMuzzleFlash] = useState(false);
  const [playerHeading, setPlayerHeading] = useState(0);
  const animState = useRef<AnimationState>('IDLE');

  const keys = useKeyboardControls(isPhoneOpen);
  const { triggerAttack, equippedWeapon } = usePlayerCombat();

  // Attack listener for mouse click
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (playerMode === 'FOOT' && !isPhoneOpen && e.button === 0) {
        triggerAttack((active) => setMuzzleFlash(active));
      }
    };
    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [playerMode, isPhoneOpen, triggerAttack]);

  // Carjack trigger on F / E / Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPhoneOpen) return;
      if (
        (e.code === 'KeyF' || e.code === 'KeyE' || e.code === 'Enter' || e.code === 'NumpadEnter') &&
        playerMode === 'FOOT'
      ) {
        const curPos = rbRef.current ? rbRef.current.translation() : { x: position[0], y: position[1], z: position[2] };
        const nearest = findNearestVehicle(curPos.x, curPos.z, 5.0);
        const targetId = nearbyVehicleId || nearest?.vehicle.id;
        const targetName = nearbyVehicleName || nearest?.vehicle.name;

        if (targetId) {
          // Play carjacking reach animation
          animState.current = 'CARJACK';
          setTimeout(() => {
            setPlayerMode('DRIVING', targetId, targetName);
          }, 150);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPhoneOpen, playerMode, nearbyVehicleId, nearbyVehicleName, position, setPlayerMode]);

  useFrame((state, delta) => {
    if (!rbRef.current || playerMode === 'DRIVING') return;

    const currentPos = rbRef.current.translation();
    const linvel = rbRef.current.linvel();

    // Check proximity to all drivable vehicles for carjacking
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

      // Transform movement relative to the third-person camera angle
      const fwdX = -Math.sin(cameraAngle);
      const fwdZ = -Math.cos(cameraAngle);
      const rightX = Math.cos(cameraAngle);
      const rightZ = -Math.sin(cameraAngle);

      const moveX = fwdX * (-normZ) + rightX * normX;
      const moveZ = fwdZ * (-normZ) + rightZ * normX;

      const isSprinting = keys.current.sprint;
      const targetSpeed = isSprinting ? 14.5 : 7.2;
      const targetVelX = moveX * targetSpeed;
      const targetVelZ = moveZ * targetSpeed;

      animState.current = isSprinting ? 'SPRINT' : 'RUN';

      rbRef.current.setLinvel(
        {
          x: THREE.MathUtils.lerp(linvel.x, targetVelX, delta * 18),
          y: linvel.y,
          z: THREE.MathUtils.lerp(linvel.z, targetVelZ, delta * 18),
        },
        true
      );

      // Rotate character to face movement direction
      const targetHeading = Math.atan2(moveX, -moveZ);
      setPlayerHeading((prev) => {
        let diff = (targetHeading - prev) % (Math.PI * 2);
        if (diff > Math.PI) diff -= Math.PI * 2;
        if (diff < -Math.PI) diff += Math.PI * 2;
        return prev + diff * Math.min(delta * 20, 1);
      });
    } else {
      animState.current = 'IDLE';

      rbRef.current.setLinvel(
        {
          x: THREE.MathUtils.lerp(linvel.x, 0, delta * 16),
          y: linvel.y,
          z: THREE.MathUtils.lerp(linvel.z, 0, delta * 16),
        },
        true
      );
    }

    // Jump impulse
    if (keys.current.jump && Math.abs(linvel.y) < 0.15) {
      animState.current = 'JUMP';
      rbRef.current.applyImpulse({ x: 0, y: 7.8, z: 0 }, true);
    }

    // Apply procedural kinematics poses to model limbs
    const time = state.clock.getElapsedTime();
    const pose = computeLimbPose(animState.current, time, equippedWeapon !== 'FISTS');

    if (modelRefs.leftLeg.current) modelRefs.leftLeg.current.rotation.x = pose.leftLegRotX;
    if (modelRefs.rightLeg.current) modelRefs.rightLeg.current.rotation.x = pose.rightLegRotX;
    if (modelRefs.leftArm.current) {
      modelRefs.leftArm.current.rotation.x = pose.leftArmRotX;
      modelRefs.leftArm.current.rotation.z = pose.leftArmRotZ;
    }
    if (modelRefs.rightArm.current) {
      modelRefs.rightArm.current.rotation.x = pose.rightArmRotX;
      modelRefs.rightArm.current.rotation.z = pose.rightArmRotZ;
    }
    if (modelRefs.bodyGroup.current) modelRefs.bodyGroup.current.rotation.x = pose.torsoLeanX;
    if (modelRefs.headGroup.current) modelRefs.headGroup.current.rotation.y = pose.headYaw;
    if (modelRefs.duffleBag.current) modelRefs.duffleBag.current.rotation.z = pose.bagBounceZ;

    // Update position in central game store
    setPlayerPosition([currentPos.x, currentPos.y, currentPos.z], playerHeading);
  });

  if (playerMode === 'DRIVING') {
    return null;
  }

  return (
    <RigidBody
      ref={rbRef}
      position={[position[0], position[1] || 1.2, position[2]]}
      colliders={false}
      lockRotations
      mass={75}
      linearDamping={0.15}
    >
      <CapsuleCollider args={[0.55, 0.35]} position={[0, 0.9, 0]} friction={0} restitution={0} />
      <PlayerModel
        refs={modelRefs}
        equippedWeapon={equippedWeapon}
        muzzleFlash={muzzleFlash}
      />
    </RigidBody>
  );
}
