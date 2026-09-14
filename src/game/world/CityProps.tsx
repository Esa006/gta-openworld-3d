'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useWorldStore } from '@/stores/useWorldStore';

export function CityProps() {
  const timeOfDay = useWorldStore((s) => s.timeOfDay);
  const isNight = timeOfDay < 6.0 || timeOfDay > 18.5;

  // Streetlight coordinates along main North-South and East-West avenues
  const streetlightPositions = useMemo<[number, number][]>(() => {
    const list: [number, number][] = [];
    // North-South Avenue Sidewalks (x = -9.2 and x = 9.2)
    for (let z = -120; z <= 120; z += 24) {
      if (Math.abs(z) > 14) {
        list.push([-9.2, z]);
        list.push([9.2, z]);
      }
    }
    // East-West Avenue Sidewalks (z = -9.2 and z = 9.2)
    for (let x = -120; x <= 120; x += 24) {
      if (Math.abs(x) > 14) {
        list.push([x, -9.2]);
        list.push([x, 9.2]);
      }
    }
    return list;
  }, []);

  // Palm tree positions (alternating between streetlights)
  const palmTreePositions = useMemo<[number, number][]>(() => {
    const list: [number, number][] = [];
    for (let z = -108; z <= 108; z += 24) {
      if (Math.abs(z) > 16) {
        list.push([-9.5, z]);
        list.push([9.5, z]);
      }
    }
    for (let x = -108; x <= 108; x += 24) {
      if (Math.abs(x) > 16) {
        list.push([x, -9.5]);
        list.push([x, 9.5]);
      }
    }
    return list;
  }, []);

  // Sidewalk furniture props (benches, hydrants, trash cans, newspaper boxes)
  const sidewalkProps = useMemo(() => {
    const benches: [number, number, number][] = [];
    const hydrants: [number, number][] = [];
    const trashCans: [number, number][] = [];
    const newsBoxes: [number, number][] = [];

    // Benches near intersections and storefronts
    benches.push([-10.4, 0.12, 28]);
    benches.push([-10.4, 0.12, -32]);
    benches.push([10.4, 0.12, 40]);
    benches.push([10.4, 0.12, -48]);
    benches.push([32, 0.12, 10.4]);
    benches.push([-36, 0.12, -10.4]);

    // Red fire hydrants at avenue corners
    hydrants.push([-8.8, 14]);
    hydrants.push([8.8, 14]);
    hydrants.push([-8.8, -14]);
    hydrants.push([8.8, -14]);
    hydrants.push([14, 8.8]);
    hydrants.push([-14, -8.8]);

    // Trash cans along curbs
    for (let z = -96; z <= 96; z += 36) {
      if (Math.abs(z) > 18) {
        trashCans.push([-9.6, z]);
        trashCans.push([9.6, z + 6]);
      }
    }

    // Newspaper vending boxes
    newsBoxes.push([-10.2, 18]);
    newsBoxes.push([10.2, -18]);
    newsBoxes.push([22, 10.2]);
    newsBoxes.push([-22, -10.2]);

    return { benches, hydrants, trashCans, newsBoxes };
  }, []);

  return (
    <group>
      {/* ================= 1. REALISTIC STREETLIGHTS WITH DOWNWARD SPOTLIGHTS ================= */}
      {streetlightPositions.map(([sx, sz], idx) => (
        <group key={`streetlight-${idx}`} position={[sx, 0.12, sz]}>
          {/* Base & Pole */}
          <mesh castShadow position={[0, 2.6, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 5.2, 12]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Base Collar */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.18, 0.22, 0.3, 12]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Horizontal Arm */}
          <mesh
            position={[sx > 0 ? -0.6 : 0.6, 5.2, 0]}
            rotation={[0, 0, sx > 0 ? 0.2 : -0.2]}
          >
            <cylinderGeometry args={[0.06, 0.06, 1.4, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          {/* Lamp Lantern Head */}
          <mesh position={[sx > 0 ? -1.2 : 1.2, 5.1, 0]}>
            <boxGeometry args={[0.35, 0.14, 0.24]} />
            <meshStandardMaterial
              color="#f8fafc"
              emissive="#fef08a"
              emissiveIntensity={isNight ? 1.5 : 0.2}
            />
          </mesh>

          {/* Nighttime Downward Road Spotlights */}
          {isNight && (
            <spotLight
              position={[sx > 0 ? -1.2 : 1.2, 5.0, 0]}
              target-position={[sx > 0 ? -3.0 : 3.0, 0, sz]}
              intensity={28}
              distance={25}
              angle={0.65}
              penumbra={0.6}
              color="#fef3c7"
            />
          )}
        </group>
      ))}

      {/* ================= 2. TROPICAL PALM TREES (VICE CITY BOULEVARD) ================= */}
      {palmTreePositions.map(([px, pz], idx) => {
        const height = 7.0 + (idx % 3) * 0.8;
        return (
          <group key={`palmtree-${idx}`} position={[px, 0.12, pz]}>
            {/* Trunk with Organic Curve */}
            <mesh castShadow position={[0, height / 2, 0]} rotation={[0.04, 0, (idx % 2 === 0 ? 0.06 : -0.06)]}>
              <cylinderGeometry args={[0.16, 0.28, height, 10]} />
              <meshStandardMaterial color="#78350f" roughness={0.9} />
            </mesh>

            {/* Palm Leaf Fronds Crown */}
            <group position={[0, height, 0]}>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, fIdx) => (
                <group
                  key={`frond-${fIdx}`}
                  rotation={[0, (deg * Math.PI) / 180, 0.45 + (fIdx % 2) * 0.1]}
                >
                  <mesh castShadow position={[1.4, 0, 0]} rotation={[0, 0, -0.3]}>
                    <planeGeometry args={[2.8, 0.65]} />
                    <meshStandardMaterial
                      color={fIdx % 2 === 0 ? '#15803d' : '#16a34a'}
                      roughness={0.6}
                      side={THREE.DoubleSide}
                    />
                  </mesh>
                </group>
              ))}
            </group>
          </group>
        );
      })}

      {/* ================= 3. PARK & SIDEWALK BENCHES ================= */}
      {sidewalkProps.benches.map(([bx, by, bz], idx) => (
        <group key={`bench-${idx}`} position={[bx, by, bz]} rotation={[0, bx > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
          {/* Iron Legs */}
          <mesh castShadow position={[-0.7, 0.22, 0]}>
            <boxGeometry args={[0.08, 0.44, 0.45]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} />
          </mesh>
          <mesh castShadow position={[0.7, 0.22, 0]}>
            <boxGeometry args={[0.08, 0.44, 0.45]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} />
          </mesh>
          {/* Wooden Slats (Seat) */}
          <mesh castShadow position={[0, 0.38, 0.05]}>
            <boxGeometry args={[1.6, 0.05, 0.45]} />
            <meshStandardMaterial color="#78350f" roughness={0.7} />
          </mesh>
          {/* Wooden Backrest */}
          <mesh castShadow position={[0, 0.65, -0.16]}>
            <boxGeometry args={[1.6, 0.35, 0.04]} />
            <meshStandardMaterial color="#78350f" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* ================= 4. RED FIRE HYDRANTS ================= */}
      {sidewalkProps.hydrants.map(([hx, hz], idx) => (
        <group key={`hydrant-${idx}`} position={[hx, 0.12, hz]}>
          <mesh castShadow position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.14, 0.16, 0.64, 12]} />
            <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.65, 0]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color="#dc2626" roughness={0.4} />
          </mesh>
          {/* Silver Caps */}
          <mesh position={[0, 0.4, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.1, 8]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* ================= 5. GREEN MUNICIPAL TRASH CANS ================= */}
      {sidewalkProps.trashCans.map(([tx, tz], idx) => (
        <group key={`trashcan-${idx}`} position={[tx, 0.12, tz]}>
          <mesh castShadow position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.26, 0.22, 0.84, 14]} />
            <meshStandardMaterial color="#14532d" roughness={0.6} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.86, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.08, 14]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* ================= 6. NEWSPAPER VENDING BOXES ================= */}
      {sidewalkProps.newsBoxes.map(([nx, nz], idx) => (
        <group key={`newsbox-${idx}`} position={[nx, 0.12, nz]}>
          <mesh castShadow position={[0, 0.48, 0]}>
            <boxGeometry args={[0.42, 0.96, 0.42]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#0284c7' : '#e11d48'} roughness={0.5} />
          </mesh>
          {/* Glass display window */}
          <mesh position={[0, 0.58, 0.215]}>
            <planeGeometry args={[0.34, 0.32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
