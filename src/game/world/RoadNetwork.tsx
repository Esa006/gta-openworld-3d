'use client';

import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

export function RoadNetwork() {
  return (
    <group>
      {/* ================= 1. CITY 1 (VICE BEACH DISTRICT) GROUND ================= */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[160, 1, 140]} position={[0, -1, 0]} friction={0.8} restitution={0.05} />
        <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[320, 280]} />
          <meshStandardMaterial color="#27272a" roughness={0.92} metalness={0.05} />
        </mesh>
      </RigidBody>

      {/* ================= 2. TURQUOISE OCEAN BAY WATER ================= */}
      <mesh position={[0, -0.35, -270]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1200, 280]} />
        <meshStandardMaterial
          color="#0891b2"
          roughness={0.12}
          metalness={0.85}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* ================= 3. 4-LANE OCEAN CAUSEWAY HIGHWAY (CONNECTS CITY 1 & CITY 2) ================= */}
      <RigidBody type="fixed" colliders={false}>
        {/* Solid Highway & Bridge Physics Deck */}
        <CuboidCollider args={[11.5, 1.0, 135]} position={[0, -0.5, -270]} friction={0.85} restitution={0.02} />

        {/* Highway Asphalt Deck */}
        <mesh receiveShadow position={[0, 0.05, -270]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[22, 270]} />
          <meshStandardMaterial color="#18181b" roughness={0.9} />
        </mesh>

        {/* Concrete Bridge Deck Underside Structure */}
        <mesh position={[0, -0.7, -270]}>
          <boxGeometry args={[23, 1.4, 270]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.8} />
        </mesh>

        {/* Massive Concrete Ocean Bridge Pillars */}
        {[-380, -320, -270, -220, -170].map((zPos, idx) => (
          <group key={`bridge-pylon-${idx}`} position={[0, -12, zPos]}>
            {/* Left Pylon */}
            <mesh position={[-8, 0, 0]}>
              <cylinderGeometry args={[2.2, 2.8, 24, 16]} />
              <meshStandardMaterial color="#64748b" roughness={0.9} />
            </mesh>
            {/* Right Pylon */}
            <mesh position={[8, 0, 0]}>
              <cylinderGeometry args={[2.2, 2.8, 24, 16]} />
              <meshStandardMaterial color="#64748b" roughness={0.9} />
            </mesh>
            {/* Horizontal Crossbeam */}
            <mesh position={[0, 10, 0]}>
              <boxGeometry args={[22, 3.2, 4]} />
              <meshStandardMaterial color="#475569" roughness={0.85} />
            </mesh>
          </group>
        ))}

        {/* Concrete New Jersey Highway Safety Barriers (Left & Right) */}
        {[-10.8, 10.8].map((xSide, i) => (
          <mesh key={`barrier-${i}`} position={[xSide, 0.55, -270]}>
            <boxGeometry args={[0.55, 0.9, 270]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
          </mesh>
        ))}
      </RigidBody>

      {/* Highway Road Markings */}
      <group position={[0, 0.065, -270]}>
        {/* Center Double Yellow Lines */}
        <mesh position={[-0.15, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.22, 268]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        <mesh position={[0.15, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.22, 268]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>

        {/* White Dashed Lane Dividers (2 lanes northbound, 2 lanes southbound) */}
        {[-5.2, 5.2].map((xOffset) => (
          <group key={`hwy-dash-${xOffset}`} position={[xOffset, 0, 0]}>
            {Array.from({ length: 26 }).map((_, idx) => (
              <mesh
                key={`hwy-dash-seg-${idx}`}
                position={[0, 0, -125 + idx * 10]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[0.26, 5.5]} />
                <meshBasicMaterial color="#f8fafc" />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Overhead Highway Gantry Truss Signs */}
      {/* 1. Gantry at Northbound Entry to Highway */}
      <group position={[0, 0, -155]}>
        {/* Steel Support Posts */}
        <mesh position={[-11.2, 4.2, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 8.4, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh position={[11.2, 4.2, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 8.4, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        {/* Overhead Truss Beam */}
        <mesh position={[0, 8.2, 0]}>
          <boxGeometry args={[23, 0.6, 0.8]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        {/* Highway Green Exit Sign */}
        <group position={[0, 6.8, 0]}>
          <mesh>
            <boxGeometry args={[16, 2.2, 0.15]} />
            <meshStandardMaterial color="#15803d" roughness={0.4} />
          </mesh>
          {/* Sign Border & Lettering simulation */}
          <mesh position={[0, 0, 0.09]}>
            <planeGeometry args={[15.6, 1.9]} />
            <meshBasicMaterial color="#166534" />
          </mesh>
          {/* White Header Stripe: "VICE PORT EXPRESSWAY - NORTH" */}
          <mesh position={[0, 0.55, 0.1]}>
            <planeGeometry args={[14.2, 0.45]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* White Destination: "BAY FINANCIAL DISTRICT - 2 MILES" */}
          <mesh position={[0, -0.3, 0.1]}>
            <planeGeometry args={[12.5, 0.55]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        </group>
      </group>

      {/* 2. Gantry at Southbound Entry to City 1 */}
      <group position={[0, 0, -385]}>
        <mesh position={[-11.2, 4.2, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 8.4, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh position={[11.2, 4.2, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 8.4, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh position={[0, 8.2, 0]}>
          <boxGeometry args={[23, 0.6, 0.8]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        <group position={[0, 6.8, 0]}>
          <mesh>
            <boxGeometry args={[16, 2.2, 0.15]} />
            <meshStandardMaterial color="#15803d" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, -0.09]}>
            <planeGeometry args={[15.6, 1.9]} />
            <meshBasicMaterial color="#166534" />
          </mesh>
          <mesh position={[0, 0.55, -0.1]}>
            <planeGeometry args={[14.2, 0.45]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, -0.3, -0.1]}>
            <planeGeometry args={[13.2, 0.55]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        </group>
      </group>

      {/* ================= 4. CITY 2 (VICE BAY FINANCIAL DISTRICT) GROUND ================= */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[160, 1, 150]} position={[0, -1, -550]} friction={0.82} restitution={0.05} />
        <mesh receiveShadow position={[0, 0, -550]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[320, 300]} />
          <meshStandardMaterial color="#1e293b" roughness={0.94} metalness={0.08} />
        </mesh>
      </RigidBody>

      {/* City 2 Multi-Lane Financial Avenues */}
      <group position={[0, 0.02, -550]}>
        {/* Main Central Financial Boulevard (Connects directly to Highway) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 300]} />
          <meshStandardMaterial color="#0f172a" roughness={0.92} />
        </mesh>
        {/* East-West High-Rise Avenues */}
        {[-80, 0, 80].map((zOffset, i) => (
          <mesh key={`c2-cross-ave-${i}`} position={[0, 0, zOffset]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[280, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.92} />
          </mesh>
        ))}

        {/* Center Double Yellow Lines for Boulevard */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.35, 290]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        {/* White Lane Dashes */}
        {[-5, 5].map((xOffset) => (
          <group key={`c2-lane-dash-${xOffset}`} position={[xOffset, 0.01, 0]}>
            {Array.from({ length: 28 }).map((_, idx) => (
              <mesh
                key={`c2-dash-${idx}`}
                position={[0, 0, -135 + idx * 10]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[0.24, 4.5]} />
                <meshBasicMaterial color="#f8fafc" />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* City 2 Sidewalk Curbs */}
      <group>
        {[-11.5, 11.5, -75, 75].map((xVal, idx) => (
          <RigidBody key={`c2-curb-x-${idx}`} type="fixed" position={[xVal, 0.12, -550]} friction={0.6}>
            <mesh receiveShadow>
              <boxGeometry args={[2.2, 0.24, 300]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.8} />
            </mesh>
          </RigidBody>
        ))}
      </group>

      {/* ================= 5. CITY 1 ROADS (OCEAN DRIVE & WASHINGTON AVE) ================= */}
      <group position={[0, 0.02, 0]}>
        {/* Main North-South Ocean Avenue (Connects North to Highway) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[16, 280]} />
          <meshStandardMaterial color="#18181b" roughness={0.92} />
        </mesh>
        {/* Main East-West Washington Avenue */}
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

        {/* Center Double Yellow Lines */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.35, 260]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <planeGeometry args={[0.35, 260]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>

        {/* Dashed White Lane Dividers */}
        {[-4, 4].map((xOffset) => (
          <group key={`lane-dash-${xOffset}`} position={[xOffset, 0.01, 0]}>
            {Array.from({ length: 24 }).map((_, idx) => (
              <mesh
                key={`dash-${idx}`}
                position={[0, 0, -120 + idx * 10]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[0.22, 4]} />
                <meshBasicMaterial color="#f8fafc" />
              </mesh>
            ))}
          </group>
        ))}

        {/* Pedestrian Crosswalk Stripes */}
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

      {/* City 1 Sidewalk Curbs */}
      <group>
        {[-9.5, 9.5, -64, 64, -80, 80].map((xVal, idx) => (
          <RigidBody key={`curb-x-${idx}`} type="fixed" position={[xVal, 0.12, 0]} friction={0.6}>
            <mesh receiveShadow>
              <boxGeometry args={[1.8, 0.24, 280]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.85} />
            </mesh>
          </RigidBody>
        ))}
      </group>
    </group>
  );
}
