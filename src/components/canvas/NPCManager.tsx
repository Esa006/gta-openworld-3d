'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';

interface SimpleNPC {
  id: string;
  name: string;
  type: 'CIVILIAN' | 'POLICE';
  startX: number;
  startZ: number;
  color: string;
  dir: number;
  speed: number;
}

export function NPCManager() {
  const playerPos = useGameStore((s) => s.position);
  const wantedLevel = useGameStore((s) => s.wantedLevel);
  const takeDamage = useGameStore((s) => s.takeDamage);

  const npcs = useMemo<SimpleNPC[]>(() => [
    { id: 'npc_1', name: 'Citizen Tommy', type: 'CIVILIAN', startX: 10, startZ: 25, color: '#0284c7', dir: 1, speed: 2.2 },
    { id: 'npc_2', name: 'Citizen Maria', type: 'CIVILIAN', startX: -10, startZ: -30, color: '#ec4899', dir: -1, speed: 1.8 },
    { id: 'npc_3', name: 'Citizen Lance', type: 'CIVILIAN', startX: 10, startZ: -50, color: '#eab308', dir: 1, speed: 2.5 },
    { id: 'npc_4', name: 'Officer Tenpenny', type: 'POLICE', startX: 30, startZ: -20, color: '#1e3a8a', dir: 1, speed: 3.5 },
    { id: 'npc_5', name: 'Officer Pulaski', type: 'POLICE', startX: -20, startZ: 40, color: '#1e3a8a', dir: -1, speed: 3.2 },
  ], []);

  const groupRefs = useRef<{ [key: string]: THREE.Group | null }>({});

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    npcs.forEach((npc) => {
      const grp = groupRefs.current[npc.id];
      if (!grp) return;

      if (npc.type === 'POLICE' && wantedLevel > 0) {
        // Police AI: Chase player
        const dx = playerPos[0] - grp.position.x;
        const dz = playerPos[2] - grp.position.z;
        const dist = Math.hypot(dx, dz);

        if (dist > 1.2) {
          const moveSpeed = npc.speed * 1.5;
          grp.position.x += (dx / dist) * moveSpeed * delta;
          grp.position.z += (dz / dist) * moveSpeed * delta;
          grp.rotation.y = Math.atan2(dx, dz);
        } else {
          // Cop damages player on contact
          takeDamage(delta * 12);
        }
      } else {
        // Civilian patrol loop along sidewalks
        const offset = Math.sin(time * 0.5 + npc.startX) * 18;
        grp.position.z = npc.startZ + offset * npc.dir;
        grp.rotation.y = Math.cos(time * 0.5 + npc.startX) * npc.dir > 0 ? 0 : Math.PI;
      }
    });
  });

  return (
    <group>
      {npcs.map((npc) => (
        <group
          key={npc.id}
          ref={(el) => {
            groupRefs.current[npc.id] = el;
          }}
          position={[npc.startX, 0.9, npc.startZ]}
        >
          {/* NPC Body */}
          <mesh castShadow position={[0, 0, 0]}>
            <boxGeometry args={[0.5, 0.8, 0.3]} />
            <meshStandardMaterial color={npc.color} roughness={0.7} />
          </mesh>
          {/* Head */}
          <mesh castShadow position={[0, 0.65, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial color="#fed7aa" roughness={0.5} />
          </mesh>
          {/* Police Badge / Cap */}
          {npc.type === 'POLICE' && (
            <mesh position={[0, 0.82, 0]}>
              <boxGeometry args={[0.25, 0.08, 0.28]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
          )}
          {/* Legs */}
          <mesh position={[-0.12, -0.6, 0]}>
            <boxGeometry args={[0.16, 0.5, 0.2]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0.12, -0.6, 0]}>
            <boxGeometry args={[0.16, 0.5, 0.2]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
