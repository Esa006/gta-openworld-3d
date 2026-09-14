'use client';

import React, { forwardRef } from 'react';
import * as THREE from 'three';
import { WeaponType } from '@/types/gta';

export interface PlayerModelRefs {
  bodyGroup: React.RefObject<THREE.Group | null>;
  headGroup: React.RefObject<THREE.Group | null>;
  leftArm: React.RefObject<THREE.Group | null>;
  rightArm: React.RefObject<THREE.Group | null>;
  leftLeg: React.RefObject<THREE.Group | null>;
  rightLeg: React.RefObject<THREE.Group | null>;
  duffleBag: React.RefObject<THREE.Group | null>;
}

interface PlayerModelProps {
  refs: PlayerModelRefs;
  equippedWeapon: WeaponType;
  muzzleFlash: boolean;
}

export const PlayerModel = forwardRef<THREE.Group, PlayerModelProps>(
  ({ refs, equippedWeapon, muzzleFlash }, groupRef) => {
    const skinColor = '#df9b77';
    const jerseyTeal = '#0284c7';
    const jerseyPink = '#ec4899';
    const jerseyWhite = '#f8fafc';
    const hairColor = '#1c1514';

    return (
      <group ref={groupRef}>
        <group ref={refs.bodyGroup}>
          {/* ================= TORSO: ATHLETIC TEAL JERSEY #69 ================= */}
          {/* Upper Chest (Athletic Cut Jersey) */}
          <mesh castShadow position={[0, 1.08, 0]}>
            <cylinderGeometry args={[0.26, 0.23, 0.44, 16]} scale={[1.25, 1, 0.75]} />
            <meshStandardMaterial color={jerseyTeal} roughness={0.6} />
          </mesh>

          {/* Lower Waist */}
          <mesh position={[0, 0.82, 0]}>
            <cylinderGeometry args={[0.23, 0.22, 0.22, 16]} scale={[1.15, 1, 0.72]} />
            <meshStandardMaterial color={jerseyTeal} roughness={0.6} />
          </mesh>

          {/* Bottom Hem Stripe (Pink) */}
          <mesh position={[0, 0.72, 0]}>
            <cylinderGeometry args={[0.235, 0.235, 0.03, 16]} scale={[1.16, 1, 0.73]} />
            <meshStandardMaterial color={jerseyPink} roughness={0.6} />
          </mesh>

          {/* Collar V-Neck Rib Trim (Pink) */}
          <mesh position={[0, 1.25, -0.17]}>
            <torusGeometry args={[0.1, 0.015, 8, 16]} />
            <meshStandardMaterial color={jerseyPink} roughness={0.5} />
          </mesh>

          {/* ================= BACK OF JERSEY: "MARCUS 69" (MATCHES REFERENCE IMAGE) ================= */}
          {/* Upper Back Name: "MARCUS" */}
          <mesh position={[0, 1.22, 0.175]}>
            <boxGeometry args={[0.22, 0.04, 0.01]} />
            <meshBasicMaterial color={jerseyWhite} />
          </mesh>

          {/* Number 69 - Digit '6' */}
          <group position={[-0.08, 1.02, 0.175]}>
            <mesh>
              <boxGeometry args={[0.1, 0.22, 0.01]} />
              <meshBasicMaterial color={jerseyWhite} />
            </mesh>
            <mesh position={[0, 0.02, 0.005]}>
              <boxGeometry args={[0.04, 0.06, 0.01]} />
              <meshBasicMaterial color={jerseyTeal} />
            </mesh>
            <mesh position={[0, 0, -0.002]}>
              <boxGeometry args={[0.12, 0.24, 0.008]} />
              <meshBasicMaterial color={jerseyPink} />
            </mesh>
          </group>

          {/* Number 69 - Digit '9' */}
          <group position={[0.08, 1.02, 0.175]}>
            <mesh>
              <boxGeometry args={[0.1, 0.22, 0.01]} />
              <meshBasicMaterial color={jerseyWhite} />
            </mesh>
            <mesh position={[0, -0.02, 0.005]}>
              <boxGeometry args={[0.04, 0.06, 0.01]} />
              <meshBasicMaterial color={jerseyTeal} />
            </mesh>
            <mesh position={[0, 0, -0.002]}>
              <boxGeometry args={[0.12, 0.24, 0.008]} />
              <meshBasicMaterial color={jerseyPink} />
            </mesh>
          </group>

          {/* ================= CROSSBODY BLACK DUFFLE / SLING BAG ================= */}
          <group ref={refs.duffleBag} position={[0.08, 0.88, 0.22]} rotation={[0, 0, 0.35]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.12, 0.12, 0.44, 16]} />
              <meshStandardMaterial color="#18181b" roughness={0.85} />
            </mesh>
            <mesh position={[0, 0.22, 0]}>
              <sphereGeometry args={[0.12, 12, 12]} scale={[1, 0.3, 1]} />
              <meshStandardMaterial color="#27272a" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.22, 0]}>
              <sphereGeometry args={[0.12, 12, 12]} scale={[1, 0.3, 1]} />
              <meshStandardMaterial color="#27272a" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0, 0.122]}>
              <boxGeometry args={[0.015, 0.36, 0.01]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>

          {/* Crossbody Straps */}
          <mesh position={[-0.04, 1.05, 0.18]} rotation={[0, 0, 0.5]}>
            <boxGeometry args={[0.05, 0.46, 0.015]} />
            <meshStandardMaterial color="#09090b" roughness={0.9} />
          </mesh>
          <mesh position={[-0.04, 1.05, -0.17]} rotation={[0, 0, -0.5]}>
            <boxGeometry args={[0.05, 0.46, 0.015]} />
            <meshStandardMaterial color="#09090b" roughness={0.9} />
          </mesh>
          <mesh position={[-0.08, 1.15, -0.18]}>
            <boxGeometry args={[0.06, 0.04, 0.02]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* ================= NECK & ORGANIC HEAD ================= */}
          <mesh position={[0, 1.35, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.13, 0.18, 16]} />
            <meshStandardMaterial color={skinColor} roughness={0.5} />
          </mesh>

          <group ref={refs.headGroup} position={[0, 1.58, 0]}>
            <mesh castShadow position={[0, 0, 0]}>
              <sphereGeometry args={[0.22, 24, 24]} scale={[0.92, 1.15, 1.0]} />
              <meshStandardMaterial color={skinColor} roughness={0.5} />
            </mesh>

            <mesh castShadow position={[0, -0.12, -0.04]} rotation={[0.18, 0, 0]}>
              <cylinderGeometry args={[0.17, 0.12, 0.16, 16]} />
              <meshStandardMaterial color={skinColor} roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.19, -0.12]}>
              <sphereGeometry args={[0.075, 12, 12]} />
              <meshStandardMaterial color={skinColor} roughness={0.5} />
            </mesh>

            {/* 5 O'Clock Stubble */}
            <mesh position={[0, -0.14, -0.05]} rotation={[0.18, 0, 0]}>
              <cylinderGeometry args={[0.175, 0.125, 0.16, 16]} />
              <meshStandardMaterial color="#3d231a" roughness={0.9} transparent opacity={0.38} />
            </mesh>

            {/* Lips */}
            <mesh position={[0, -0.14, -0.19]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, 0.015, 8]} />
              <meshStandardMaterial color="#9c4a3b" roughness={0.6} />
            </mesh>

            {/* Nose */}
            <mesh position={[0, -0.03, -0.21]} rotation={[-0.2, 0, 0]}>
              <coneGeometry args={[0.045, 0.14, 8]} />
              <meshStandardMaterial color={skinColor} roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.08, -0.23]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color={skinColor} roughness={0.5} />
            </mesh>

            {/* Eyes */}
            <mesh position={[0.075, 0.03, -0.19]}>
              <sphereGeometry args={[0.026, 10, 10]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0.075, 0.03, -0.208]}>
              <sphereGeometry args={[0.013, 8, 8]} />
              <meshBasicMaterial color="#1a1412" />
            </mesh>
            <mesh position={[-0.075, 0.03, -0.19]}>
              <sphereGeometry args={[0.026, 10, 10]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.075, 0.03, -0.208]}>
              <sphereGeometry args={[0.013, 8, 8]} />
              <meshBasicMaterial color="#1a1412" />
            </mesh>

            {/* Eyebrows */}
            <mesh position={[0.075, 0.065, -0.195]} rotation={[0, 0, -0.15]}>
              <boxGeometry args={[0.065, 0.018, 0.02]} />
              <meshBasicMaterial color={hairColor} />
            </mesh>
            <mesh position={[-0.075, 0.065, -0.195]} rotation={[0, 0, 0.15]}>
              <boxGeometry args={[0.065, 0.018, 0.02]} />
              <meshBasicMaterial color={hairColor} />
            </mesh>

            {/* Ears */}
            <mesh position={[0.2, 0, 0]} rotation={[0, 0, 0.1]}>
              <sphereGeometry args={[0.05, 8, 8]} scale={[0.4, 1.2, 0.7]} />
              <meshStandardMaterial color={skinColor} roughness={0.5} />
            </mesh>
            <mesh position={[-0.2, 0, 0]} rotation={[0, 0, -0.1]}>
              <sphereGeometry args={[0.05, 8, 8]} scale={[0.4, 1.2, 0.7]} />
              <meshStandardMaterial color={skinColor} roughness={0.5} />
            </mesh>

            {/* Hair & Pink Scrunchie at Back */}
            <mesh castShadow position={[0, 0.16, 0.02]}>
              <sphereGeometry args={[0.24, 16, 16]} scale={[0.95, 1.15, 1.15]} />
              <meshStandardMaterial color={hairColor} roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.18, -0.12]} rotation={[-0.3, 0, 0]}>
              <cylinderGeometry args={[0.17, 0.14, 0.12, 12]} />
              <meshStandardMaterial color={hairColor} roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.06, 0.22]}>
              <torusGeometry args={[0.05, 0.022, 8, 16]} />
              <meshStandardMaterial color={jerseyPink} roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.04, 0.25]} rotation={[0.4, 0, 0]}>
              <coneGeometry args={[0.06, 0.16, 8]} />
              <meshStandardMaterial color={hairColor} roughness={0.7} />
            </mesh>

            {/* Aviator Sunglasses */}
            <mesh position={[0, 0.045, -0.21]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[0.13, 0.008, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.2} />
            </mesh>
            <mesh position={[0.07, 0.015, -0.215]} rotation={[0, 0.15, 0]}>
              <sphereGeometry args={[0.045, 12, 12]} scale={[1, 1.15, 0.2]} />
              <meshStandardMaterial color="#09090b" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[-0.07, 0.015, -0.215]} rotation={[0, -0.15, 0]}>
              <sphereGeometry args={[0.045, 12, 12]} scale={[1, 1.15, 0.2]} />
              <meshStandardMaterial color="#09090b" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>

          {/* ================= ARMS & WEAPONS ================= */}
          {/* Left Arm */}
          <group ref={refs.leftArm} position={[-0.38, 1.2, 0]}>
            <mesh castShadow position={[0, -0.08, 0]}>
              <sphereGeometry args={[0.11, 12, 12]} />
              <meshStandardMaterial color={jerseyTeal} roughness={0.6} />
            </mesh>
            <mesh position={[0, -0.14, 0]}>
              <cylinderGeometry args={[0.085, 0.085, 0.03, 12]} />
              <meshStandardMaterial color={jerseyPink} roughness={0.5} />
            </mesh>
            <mesh castShadow position={[0, -0.24, 0]}>
              <cylinderGeometry args={[0.08, 0.07, 0.18, 12]} />
              <meshStandardMaterial color={skinColor} roughness={0.5} />
            </mesh>
            <mesh castShadow position={[0, -0.42, 0]}>
              <cylinderGeometry args={[0.07, 0.06, 0.24, 12]} />
              <meshStandardMaterial color={skinColor} roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.52, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.065, 0.015, 8, 16]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.2} />
            </mesh>
            <mesh position={[0, -0.58, 0]}>
              <sphereGeometry args={[0.065, 10, 10]} scale={[0.8, 1.2, 1]} />
              <meshStandardMaterial color={skinColor} roughness={0.5} />
            </mesh>
          </group>

          {/* Right Arm & Weapon */}
          <group ref={refs.rightArm} position={[0.38, 1.2, 0]}>
            <mesh castShadow position={[0, -0.08, 0]}>
              <sphereGeometry args={[0.11, 12, 12]} />
              <meshStandardMaterial color={jerseyTeal} roughness={0.6} />
            </mesh>
            <mesh position={[0, -0.14, 0]}>
              <cylinderGeometry args={[0.085, 0.085, 0.03, 12]} />
              <meshStandardMaterial color={jerseyPink} roughness={0.5} />
            </mesh>
            <mesh castShadow position={[0, -0.24, 0]}>
              <cylinderGeometry args={[0.08, 0.07, 0.18, 12]} />
              <meshStandardMaterial color={skinColor} roughness={0.5} />
            </mesh>
            <mesh castShadow position={[0, -0.42, 0]}>
              <cylinderGeometry args={[0.07, 0.06, 0.24, 12]} />
              <meshStandardMaterial color={skinColor} roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.58, 0]}>
              <sphereGeometry args={[0.065, 10, 10]} scale={[0.8, 1.2, 1]} />
              <meshStandardMaterial color={skinColor} roughness={0.5} />
            </mesh>

            {/* Equipped Weapon Mesh */}
            {equippedWeapon !== 'FISTS' && (
              <mesh position={[0, -0.58, -0.2]} rotation={[-Math.PI / 4, 0, 0]}>
                <boxGeometry
                  args={
                    equippedWeapon === 'BASEBALL_BAT'
                      ? [0.07, 0.8, 0.07]
                      : equippedWeapon === 'MICRO_SMG'
                      ? [0.1, 0.22, 0.45]
                      : [0.07, 0.16, 0.28]
                  }
                />
                <meshStandardMaterial
                  color={equippedWeapon === 'BASEBALL_BAT' ? '#ca8a04' : '#09090b'}
                  metalness={0.85}
                  roughness={0.25}
                />
              </mesh>
            )}

            {/* Muzzle Flash Effect */}
            {muzzleFlash && (
              <group position={[0, -0.58, -0.55]}>
                <mesh>
                  <sphereGeometry args={[0.16, 8, 8]} />
                  <meshBasicMaterial color="#fbbf24" />
                </mesh>
                <pointLight intensity={20} distance={8} color="#fbbf24" />
              </group>
            )}
          </group>
        </group>

        {/* ================= LEGS & SNEAKERS ================= */}
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[0.23, 0.21, 0.16, 16]} scale={[1.15, 1, 0.75]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>

        {/* Left Leg */}
        <group ref={refs.leftLeg} position={[-0.17, 0.58, 0]}>
          <mesh castShadow position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.11, 0.095, 0.42, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          <mesh castShadow position={[0, -0.58, 0]}>
            <cylinderGeometry args={[0.095, 0.082, 0.42, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          <mesh castShadow position={[0, -0.82, -0.06]}>
            <sphereGeometry args={[0.1, 10, 10]} scale={[0.95, 0.75, 1.45]} />
            <meshStandardMaterial color={jerseyWhite} roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.88, -0.06]}>
            <cylinderGeometry args={[0.095, 0.095, 0.04, 12]} scale={[1, 1, 1.45]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={refs.rightLeg} position={[0.17, 0.58, 0]}>
          <mesh castShadow position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.11, 0.095, 0.42, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          <mesh castShadow position={[0, -0.58, 0]}>
            <cylinderGeometry args={[0.095, 0.082, 0.42, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          <mesh castShadow position={[0, -0.82, -0.06]}>
            <sphereGeometry args={[0.1, 10, 10]} scale={[0.95, 0.75, 1.45]} />
            <meshStandardMaterial color={jerseyWhite} roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.88, -0.06]}>
            <cylinderGeometry args={[0.095, 0.095, 0.04, 12]} scale={[1, 1, 1.45]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        </group>
      </group>
    );
  }
);

PlayerModel.displayName = 'PlayerModel';
