'use client';

import React, { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useWorldStore } from '@/stores/useWorldStore';

interface HighRiseData {
  id: string;
  name: string;
  pos: [number, number, number];
  size: [number, number, number]; // width, height, depth
  color: string;
  accentColor: string;
  hasHelipad?: boolean;
  hasBeacon?: boolean;
  shape?: 'BOX' | 'CYLINDER';
}

export function CityTwoMap() {
  const timeOfDay = useWorldStore((s) => s.timeOfDay);
  const isNight = timeOfDay < 6.0 || timeOfDay > 18.5;

  const towers = useMemo<HighRiseData[]>(() => [
    // 1. Maze Bank Tower (Central Financial Landmark)
    {
      id: 'maze_bank_tower',
      name: 'MAZE BANK TOWER',
      pos: [-42, 55, -550],
      size: [32, 110, 32],
      color: '#0f172a', // Obsidian reflective glass
      accentColor: '#ef4444', // Red corporate logo
      hasHelipad: true,
      hasBeacon: true,
      shape: 'CYLINDER',
    },
    // 2. Vice Metro Corporate Center
    {
      id: 'vice_metro_tower',
      name: 'VICE METRO CENTER',
      pos: [45, 46, -550],
      size: [30, 92, 28],
      color: '#0369a1', // Deep ocean blue glass
      accentColor: '#38bdf8', // Cyan neon crown
      hasBeacon: true,
      shape: 'BOX',
    },
    // 3. Lombank Financial Plaza
    {
      id: 'lombank_plaza',
      name: 'LOMBANK HEADQUARTERS',
      pos: [-45, 42, -470],
      size: [28, 84, 26],
      color: '#1e293b',
      accentColor: '#f59e0b', // Amber executive glow
      hasHelipad: true,
      hasBeacon: true,
      shape: 'BOX',
    },
    // 4. Kaufman Tower
    {
      id: 'kaufman_tower',
      name: 'KAUFMAN TOWER',
      pos: [42, 38, -470],
      size: [26, 76, 26],
      color: '#0f766e', // Teal modern corporate
      accentColor: '#2dd4bf',
      hasBeacon: true,
      shape: 'BOX',
    },
    // 5. Apex Luxury Suites
    {
      id: 'apex_luxury',
      name: 'APEX BAY SUITES',
      pos: [-45, 40, -630],
      size: [28, 80, 28],
      color: '#f8fafc', // Modern white concrete & glass
      accentColor: '#ec4899', // Hot magenta penthouse
      hasHelipad: true,
      hasBeacon: true,
      shape: 'BOX',
    },
    // 6. VCPD Metro Headquarters
    {
      id: 'vcpd_hq',
      name: 'VCPD METRO HEADQUARTERS',
      pos: [45, 34, -630],
      size: [32, 68, 30],
      color: '#1e1b4b', // Deep tactical navy
      accentColor: '#3b82f6', // Police blue beacon
      hasBeacon: true,
      shape: 'BOX',
    },
    // 7. Bayview Skyline High-Rise A
    {
      id: 'bayview_a',
      name: 'BAYVIEW COMMERCE',
      pos: [-95, 36, -510],
      size: [24, 72, 24],
      color: '#334155',
      accentColor: '#10b981',
      shape: 'BOX',
    },
    // 8. Bayview Skyline High-Rise B
    {
      id: 'bayview_b',
      name: 'PACIFIC HORIZON',
      pos: [95, 35, -510],
      size: [24, 70, 24],
      color: '#18181b',
      accentColor: '#a855f7',
      shape: 'BOX',
    },
    // 9. Waterfront Logistics Hub A
    {
      id: 'waterfront_hub_a',
      name: 'VICE DOCKS CORP',
      pos: [-95, 26, -590],
      size: [28, 52, 32],
      color: '#475569',
      accentColor: '#f97316',
      shape: 'BOX',
    },
    // 10. Waterfront Logistics Hub B
    {
      id: 'waterfront_hub_b',
      name: 'INTERSTATE FREIGHT',
      pos: [95, 28, -590],
      size: [28, 56, 32],
      color: '#1e293b',
      accentColor: '#eab308',
      shape: 'BOX',
    },
  ], []);

  return (
    <group>
      {towers.map((tower) => {
        const [w, h, d] = tower.size;
        const [x, y, z] = tower.pos;

        return (
          <RigidBody key={tower.id} type="fixed" position={[x, y, z]}>
            {/* Main Skyscraper Geometry */}
            {tower.shape === 'CYLINDER' ? (
              <mesh receiveShadow castShadow>
                <cylinderGeometry args={[w / 2, (w / 2) * 1.05, h, 24]} />
                <meshStandardMaterial
                  color={tower.color}
                  metalness={0.88}
                  roughness={0.18}
                />
              </mesh>
            ) : (
              <mesh receiveShadow castShadow>
                <boxGeometry args={[w, h, d]} />
                <meshStandardMaterial
                  color={tower.color}
                  metalness={0.85}
                  roughness={0.22}
                />
              </mesh>
            )}

            {/* Horizontal Glass Floor Ribs */}
            {Array.from({ length: Math.floor(h / 7) }).map((_, floorIdx) => (
              <mesh key={`rib-${floorIdx}`} position={[0, -h / 2 + (floorIdx + 1) * 7, 0]}>
                <boxGeometry args={[w + 0.3, 0.45, d + 0.3]} />
                <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.3} />
              </mesh>
            ))}

            {/* Illuminated Rooftop Corporate Crown */}
            <mesh position={[0, h / 2 + 1.2, 0]}>
              <boxGeometry args={[w * 0.85, 2.4, d * 0.85]} />
              <meshStandardMaterial
                color={tower.accentColor}
                emissive={tower.accentColor}
                emissiveIntensity={isNight ? 2.5 : 0.8}
              />
            </mesh>

            {/* Rooftop Helipad with "H" Target */}
            {tower.hasHelipad && (
              <group position={[0, h / 2 + 2.5, 0]}>
                {/* Pad Surface */}
                <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[w * 0.36, 24]} />
                  <meshStandardMaterial color="#1e293b" roughness={0.8} />
                </mesh>
                {/* Yellow Ring */}
                <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[w * 0.32, w * 0.35, 24]} />
                  <meshBasicMaterial color="#eab308" />
                </mesh>
                {/* Letter 'H' */}
                <mesh position={[-w * 0.12, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[1.2, 7.5]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
                <mesh position={[w * 0.12, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[1.2, 7.5]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
                <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[w * 0.24, 1.4]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              </group>
            )}

            {/* Rooftop Aviation Warning Beacon Antenna */}
            {tower.hasBeacon && (
              <group position={[0, h / 2 + 4, 0]}>
                {/* Spire Mast */}
                <mesh position={[0, 6, 0]}>
                  <cylinderGeometry args={[0.15, 0.45, 12, 8]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.9} />
                </mesh>
                {/* Red/White Blinking Flashing Light */}
                <mesh position={[0, 12.2, 0]}>
                  <sphereGeometry args={[0.4, 8, 8]} />
                  <meshBasicMaterial color={isNight ? '#ef4444' : '#ffffff'} />
                </mesh>
                {isNight && (
                  <pointLight
                    position={[0, 12.2, 0]}
                    color="#ef4444"
                    intensity={15}
                    distance={80}
                  />
                )}
              </group>
            )}

            {/* Commercial Storefront / Financial Bank Plaza Neon Logo */}
            <mesh position={[0, -h / 2 + 3.8, d / 2 + 0.2]}>
              <boxGeometry args={[w * 0.75, 1.8, 0.25]} />
              <meshStandardMaterial
                color={tower.accentColor}
                emissive={tower.accentColor}
                emissiveIntensity={isNight ? 3.0 : 1.2}
              />
            </mesh>
          </RigidBody>
        );
      })}

      {/* Modern Financial Plaza Pavement & Water Fountains */}
      <group position={[0, 0.05, -550]}>
        {/* Plaza Marble Tiles Left */}
        <mesh position={[-25, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[18, 120]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Plaza Marble Tiles Right */}
        <mesh position={[25, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[18, 120]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Central Plaza Circular Water Fountain */}
        <group position={[0, 0.4, 0]}>
          {/* Stone Basin */}
          <mesh receiveShadow>
            <cylinderGeometry args={[8.5, 9.2, 0.8, 24]} />
            <meshStandardMaterial color="#64748b" roughness={0.7} />
          </mesh>
          {/* Water pool */}
          <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[8.0, 24]} />
            <meshStandardMaterial
              color="#06b6d4"
              roughness={0.1}
              metalness={0.8}
              transparent
              opacity={0.85}
            />
          </mesh>
          {/* Water Spout Light */}
          <pointLight position={[0, 1.5, 0]} color="#06b6d4" intensity={isNight ? 12 : 2} distance={16} />
        </group>
      </group>
    </group>
  );
}
