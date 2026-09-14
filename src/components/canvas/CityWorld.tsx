'use client';

import React, { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

interface BuildingData {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  color: string;
  roofColor: string;
  hasAntenna?: boolean;
}

export function CityWorld() {
  // Generate deterministic modular city skyscrapers
  const buildings = useMemo<BuildingData[]>(() => {
    const list: BuildingData[] = [];
    // Sunny Florida / Vice City pastel art-deco colors
    const colors = ['#f8fafc', '#f1f5f9', '#fef9c3', '#fce7f3', '#e0f2fe', '#fff1f2', '#f3f4f6'];
    const roofColors = ['#06b6d4', '#f43f5e', '#ec4899', '#f59e0b', '#3b82f6'];

    // Blocks in 4 quadrants around intersecting avenues
    const blockOffsets = [
      { bx: -45, bz: -45 },
      { bx: 45, bz: -45 },
      { bx: -45, bz: 45 },
      { bx: 45, bz: 45 },
      { bx: -85, bz: -45 },
      { bx: 85, bz: -45 },
      { bx: -45, bz: 85 },
      { bx: 45, bz: 85 },
    ];

    blockOffsets.forEach((b, bIdx) => {
      for (let rx = -1; rx <= 1; rx++) {
        for (let rz = -1; rz <= 1; rz++) {
          const w = 14 + (Math.abs(rx * 3 + rz * 2) % 4);
          const d = 14 + (Math.abs(rz * 3 + rx * 2) % 4);
          const h = 25 + ((bIdx * 7 + (rx + 2) * 11 + (rz + 2) * 13) % 45);
          list.push({
            x: b.bx + rx * 18,
            z: b.bz + rz * 18,
            width: w,
            depth: d,
            height: h,
            color: colors[(bIdx + rx + rz + 10) % colors.length],
            roofColor: roofColors[(bIdx + rx) % roofColors.length],
            hasAntenna: (rx + rz) % 2 === 0,
          });
        }
      }
    });

    return list;
  }, []);

  return (
    <group>
      {/* Ground Asphalt Plane with Rapier Fixed Collider */}
      <RigidBody type="fixed" friction={0.8} restitution={0.1}>
        <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[300, 300]} />
          <meshStandardMaterial color="#27272a" roughness={0.9} metalness={0.05} />
        </mesh>
      </RigidBody>

      {/* Road Markings & Avenues */}
      <group position={[0, 0.02, 0]}>
        {/* Main North-South Avenue (Width 16m) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[16, 280]} />
          <meshStandardMaterial color="#18181b" roughness={0.92} />
        </mesh>
        {/* Main East-West Avenue (Width 16m) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[280, 16]} />
          <meshStandardMaterial color="#18181b" roughness={0.92} />
        </mesh>

        {/* Outer Ring Roads */}
        {[-72, 72].map((coord, i) => (
          <React.Fragment key={`outer-roads-${i}`}>
            <mesh position={[coord, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[12, 280]} />
              <meshStandardMaterial color="#27272a" roughness={0.95} />
            </mesh>
            <mesh position={[0, 0, coord]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[280, 12]} />
              <meshStandardMaterial color="#27272a" roughness={0.95} />
            </mesh>
          </React.Fragment>
        ))}

        {/* Center Yellow Double Lines */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.35, 260]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <planeGeometry args={[0.35, 260]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>

        {/* Pedestrian Crosswalk Stripes (Like in GTA VI screenshot) */}
        {[-12, 12].map((zPos, idx) => (
          <group key={`crosswalk-${idx}`} position={[0, 0.015, zPos]}>
            {[-6, -4.5, -3, -1.5, 0, 1.5, 3, 4.5, 6].map((xOffset, stripeIdx) => (
              <mesh key={`stripe-${stripeIdx}`} position={[xOffset, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.8, 3.2]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Sidewalk Curbs */}
      <group>
        {[-10, 10, -64, 64, -80, 80].map((xVal, idx) => (
          <RigidBody key={`curb-x-${idx}`} type="fixed" position={[xVal, 0.15, 0]}>
            <mesh receiveShadow>
              <boxGeometry args={[1.5, 0.3, 280]} />
              <meshStandardMaterial color="#475569" roughness={0.8} />
            </mesh>
          </RigidBody>
        ))}
      </group>

      {/* Buildings with Colliders */}
      {buildings.map((b, i) => (
        <RigidBody key={`building-${i}`} type="fixed" position={[b.x, b.height / 2, b.z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[b.width, b.height, b.depth]} />
            <meshStandardMaterial color={b.color} roughness={0.5} metalness={0.2} />
          </mesh>
          {/* Glowing Rooftop Beacon */}
          <mesh position={[0, b.height / 2 + 0.5, 0]}>
            <boxGeometry args={[b.width * 0.9, 1, b.depth * 0.9]} />
            <meshStandardMaterial color={b.roofColor} emissive={b.roofColor} emissiveIntensity={0.6} />
          </mesh>
          {/* Rooftop Antenna */}
          {b.hasAntenna && (
            <mesh position={[0, b.height / 2 + 4, 0]}>
              <cylinderGeometry args={[0.1, 0.2, 8]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
          )}
        </RigidBody>
      ))}

      {/* Street Lamps & Neon Signs */}
      {[-20, 0, 20, -50, 50].map((coord, i) => (
        <React.Fragment key={`lamp-${i}`}>
          <group position={[9, 0, coord]}>
            {/* Pole */}
            <mesh position={[0, 3, 0]}>
              <cylinderGeometry args={[0.1, 0.15, 6]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            {/* Light bulb */}
            <mesh position={[0, 6, 0]}>
              <sphereGeometry args={[0.4, 8, 8]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
            <pointLight position={[0, 5.8, 0]} intensity={18} distance={14} color="#fef08a" />
          </group>
          <group position={[-9, 0, -coord]}>
            <mesh position={[0, 3, 0]}>
              <cylinderGeometry args={[0.1, 0.15, 6]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            <mesh position={[0, 6, 0]}>
              <sphereGeometry args={[0.4, 8, 8]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            <pointLight position={[0, 5.8, 0]} intensity={18} distance={14} color="#38bdf8" />
          </group>
        </React.Fragment>
      ))}

      {/* Palm Trees for Vice City Vibe */}
      {[-30, 30, -60, 60].map((pz, idx) => (
        <group key={`palm-${idx}`} position={[-9, 0, pz]}>
          {/* Trunk */}
          <mesh position={[0, 3, 0]} rotation={[0.05, 0, 0.05]}>
            <cylinderGeometry args={[0.2, 0.4, 6]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>
          {/* Leaves */}
          <mesh position={[0, 6, 0]}>
            <coneGeometry args={[2.5, 1.8, 6]} />
            <meshStandardMaterial color="#15803d" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
