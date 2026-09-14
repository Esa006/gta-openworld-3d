'use client';

import React, { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useWorldStore } from '@/stores/useWorldStore';

interface BuildingData {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  color: string;
  roofColor: string;
  hasAntenna?: boolean;
  storeName?: string;
  storeColor?: string;
  facingStreet?: 'N' | 'S' | 'E' | 'W';
}

const STORE_BRANDS = [
  { name: 'OCEAN VIEW DINER', color: '#f59e0b' },
  { name: 'HOTEL DELANO', color: '#06b6d4' },
  { name: 'CLUB MALIBU', color: '#ec4899' },
  { name: 'VICE MOTORS', color: '#ef4444' },
  { name: 'SUNSET CAFE', color: '#10b981' },
  { name: 'MIAMI LIQUORS', color: '#a855f7' },
  { name: 'PALM APARTMENTS', color: '#3b82f6' },
];

export function CityMap() {
  const timeOfDay = useWorldStore((s) => s.timeOfDay);
  const isNight = timeOfDay < 6.0 || timeOfDay > 18.5;

  const buildings = useMemo<BuildingData[]>(() => {
    const list: BuildingData[] = [];
    const colors = ['#f8fafc', '#f1f5f9', '#fef9c3', '#fce7f3', '#e0f2fe', '#fff1f2', '#f3f4f6'];
    const roofColors = ['#06b6d4', '#f43f5e', '#ec4899', '#f59e0b', '#3b82f6'];

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

    let storeIdx = 0;
    blockOffsets.forEach((b, bIdx) => {
      for (let rx = -1; rx <= 1; rx++) {
        for (let rz = -1; rz <= 1; rz++) {
          const w = 15 + (Math.abs(rx * 3 + rz * 2) % 4);
          const d = 15 + (Math.abs(rz * 3 + rx * 2) % 4);
          const h = 28 + ((bIdx * 7 + (rx + 2) * 11 + (rz + 2) * 13) % 46);

          const posX = b.bx + rx * 18;
          const posZ = b.bz + rz * 18;

          // Determine if building faces main avenues
          let facing: 'N' | 'S' | 'E' | 'W' | undefined;
          if (Math.abs(posX) < 32 && Math.abs(posZ) < 32) {
            facing = Math.abs(posX) < Math.abs(posZ) ? (posZ > 0 ? 'N' : 'S') : posX > 0 ? 'W' : 'E';
          }

          const brand = STORE_BRANDS[storeIdx % STORE_BRANDS.length];
          storeIdx++;

          list.push({
            x: posX,
            z: posZ,
            width: w,
            depth: d,
            height: h,
            color: colors[(bIdx + rx + rz + 10) % colors.length],
            roofColor: roofColors[(bIdx + rx) % roofColors.length],
            hasAntenna: (rx + rz) % 2 === 0,
            storeName: facing ? brand.name : undefined,
            storeColor: facing ? brand.color : undefined,
            facingStreet: facing,
          });
        }
      }
    });

    return list;
  }, []);

  return (
    <group>
      {buildings.map((b, idx) => (
        <RigidBody key={`building-${idx}`} type="fixed" position={[b.x, b.height / 2, b.z]}>
          {/* Main Skyscraper Tower */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[b.width, b.height, b.depth]} />
            <meshStandardMaterial
              color={b.color}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>

          {/* Roof Terrace / Art Deco Parapet */}
          <mesh position={[0, b.height / 2 + 0.4, 0]}>
            <boxGeometry args={[b.width * 0.94, 0.8, b.depth * 0.94]} />
            <meshStandardMaterial
              color={b.roofColor}
              emissive={isNight ? b.roofColor : '#000000'}
              emissiveIntensity={isNight ? 0.6 : 0}
            />
          </mesh>

          {/* Rooftop HVAC Units */}
          <mesh position={[-b.width * 0.2, b.height / 2 + 0.8, -b.depth * 0.2]}>
            <boxGeometry args={[2.5, 1.2, 2.5]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[b.width * 0.2, b.height / 2 + 0.8, b.depth * 0.2]}>
            <boxGeometry args={[2.0, 1.0, 3.2]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Communication Antenna with Flashing Beacon Light */}
          {b.hasAntenna && (
            <group position={[0, b.height / 2 + 3, 0]}>
              <mesh>
                <cylinderGeometry args={[0.08, 0.15, 6, 8]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.9} />
              </mesh>
              <mesh position={[0, 3, 0]}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshBasicMaterial color="#ef4444" />
              </mesh>
            </group>
          )}

          {/* Ground-Floor Storefront (Facing Avenue) */}
          {b.storeName && (
            <group position={[0, -b.height / 2 + 2.1, b.depth / 2 + 0.05]}>
              {/* Illuminated Storefront Display Window */}
              <mesh position={[0, 0, 0]}>
                <planeGeometry args={[b.width * 0.85, 3.8]} />
                <meshStandardMaterial
                  color={isNight ? '#fef08a' : '#cbd5e1'}
                  emissive={isNight ? '#fef08a' : '#000000'}
                  emissiveIntensity={isNight ? 0.45 : 0}
                  roughness={0.1}
                  metalness={0.8}
                />
              </mesh>

              {/* Entrance Double Doors */}
              <mesh position={[0, -0.6, 0.02]}>
                <planeGeometry args={[2.4, 2.6]} />
                <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
              </mesh>

              {/* Fabric Awning */}
              <mesh position={[0, 1.95, 0.7]} rotation={[0.35, 0, 0]}>
                <boxGeometry args={[b.width * 0.88, 0.1, 1.6]} />
                <meshStandardMaterial color={b.storeColor || '#f43f5e'} roughness={0.8} />
              </mesh>

              {/* Neon Storefront Signboard */}
              <group position={[0, 2.5, 0.15]}>
                <mesh>
                  <boxGeometry args={[b.width * 0.7, 0.7, 0.12]} />
                  <meshStandardMaterial color="#09090b" roughness={0.8} />
                </mesh>
                <mesh position={[0, 0, 0.07]}>
                  <boxGeometry args={[b.width * 0.65, 0.45, 0.02]} />
                  <meshBasicMaterial color={b.storeColor || '#06b6d4'} />
                </mesh>
              </group>
            </group>
          )}
        </RigidBody>
      ))}
    </group>
  );
}
