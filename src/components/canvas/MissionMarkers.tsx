'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';

export function MissionMarkers() {
  const activeMission = useGameStore((s) => s.activeMission);
  const position = useGameStore((s) => s.position);
  const completeActiveMission = useGameStore((s) => s.completeActiveMission);

  const markerRef = useRef<THREE.Group>(null);
  const diamondRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!activeMission) return;

    if (diamondRef.current) {
      diamondRef.current.rotation.y += delta * 2;
      diamondRef.current.position.y = 3.5 + Math.sin(state.clock.getElapsedTime() * 3) * 0.4;
    }

    // Distance to active objective
    const tx = activeMission.targetPosition ? activeMission.targetPosition[0] : (activeMission.targetX ?? -65);
    const tz = activeMission.targetPosition ? activeMission.targetPosition[2] : (activeMission.targetZ ?? -65);
    const dist = Math.hypot(position[0] - tx, position[2] - tz);

    if (dist < 5.0) {
      completeActiveMission();
    }
  });

  if (!activeMission) return null;

  const targetX = activeMission.targetPosition ? activeMission.targetPosition[0] : (activeMission.targetX ?? -65);
  const targetZ = activeMission.targetPosition ? activeMission.targetPosition[2] : (activeMission.targetZ ?? -65);

  return (
    <group ref={markerRef} position={[targetX, 0.2, targetZ]}>
      {/* Ground Glowing Rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 3.2, 32]} />
        <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 1.2, 32]} />
        <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>

      {/* Vertical Translucent Light Column */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[1.5, 2.5, 8, 16, 1, true]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>

      {/* Floating Animated Objective Marker */}
      <mesh ref={diamondRef} position={[0, 3.5, 0]}>
        <octahedronGeometry args={[0.9]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.8} />
      </mesh>

      <pointLight position={[0, 2, 0]} intensity={25} distance={12} color="#f59e0b" />
    </group>
  );
}
