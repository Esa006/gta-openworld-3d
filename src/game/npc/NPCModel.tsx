'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';

export interface NPCAppearance {
  skinTone: string;
  shirtColor: string;
  pantsColor: string;
  hairColor: string;
  hairStyle: 'SHORT' | 'AFRO' | 'PONYTAIL' | 'CAP';
  heightScale: number;
}

export interface NPCModelRefs {
  group: React.RefObject<THREE.Group | null>;
  body: React.RefObject<THREE.Group | null>;
  head: React.RefObject<THREE.Group | null>;
  leftArm: React.RefObject<THREE.Group | null>;
  rightArm: React.RefObject<THREE.Group | null>;
  leftLeg: React.RefObject<THREE.Group | null>;
  rightLeg: React.RefObject<THREE.Group | null>;
}

interface NPCModelProps {
  appearance: NPCAppearance;
  isPanicking?: boolean;
}

export const NPCModel = React.forwardRef<NPCModelRefs, NPCModelProps>(
  ({ appearance, isPanicking = false }, ref) => {
    const groupRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);
    const leftArmRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    const leftLegRef = useRef<THREE.Group>(null);
    const rightLegRef = useRef<THREE.Group>(null);

    React.useImperativeHandle(ref, () => ({
      group: groupRef,
      body: bodyRef,
      head: headRef,
      leftArm: leftArmRef,
      rightArm: rightArmRef,
      leftLeg: leftLegRef,
      rightLeg: rightLegRef,
    }));

    const scale = appearance.heightScale || 1.0;

    return (
      <group ref={groupRef} scale={[scale, scale, scale]}>
        {/* Main Torso & Body */}
        <group ref={bodyRef} position={[0, 0.95, 0]}>
          {/* Torso / Shirt */}
          <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
            <boxGeometry args={[0.44, 0.48, 0.24]} />
            <meshStandardMaterial color={appearance.shirtColor} roughness={0.7} />
          </mesh>

          {/* Neck */}
          <mesh position={[0, 0.48, 0]}>
            <cylinderGeometry args={[0.07, 0.08, 0.08, 10]} />
            <meshStandardMaterial color={appearance.skinTone} roughness={0.5} />
          </mesh>

          {/* Head & Face */}
          <group ref={headRef} position={[0, 0.60, 0]}>
            <mesh castShadow position={[0, 0, 0]}>
              <boxGeometry args={[0.22, 0.24, 0.22]} />
              <meshStandardMaterial color={appearance.skinTone} roughness={0.5} />
            </mesh>

            {/* Hair */}
            {appearance.hairStyle === 'SHORT' && (
              <mesh position={[0, 0.11, -0.02]}>
                <boxGeometry args={[0.24, 0.09, 0.24]} />
                <meshStandardMaterial color={appearance.hairColor} roughness={0.8} />
              </mesh>
            )}
            {appearance.hairStyle === 'AFRO' && (
              <mesh position={[0, 0.14, 0]}>
                <sphereGeometry args={[0.18, 12, 12]} />
                <meshStandardMaterial color={appearance.hairColor} roughness={0.9} />
              </mesh>
            )}
            {appearance.hairStyle === 'CAP' && (
              <group position={[0, 0.12, 0]}>
                <mesh>
                  <boxGeometry args={[0.24, 0.08, 0.24]} />
                  <meshStandardMaterial color="#0284c7" roughness={0.6} />
                </mesh>
                <mesh position={[0, -0.02, 0.15]}>
                  <boxGeometry args={[0.22, 0.02, 0.12]} />
                  <meshStandardMaterial color="#0284c7" roughness={0.6} />
                </mesh>
              </group>
            )}
            {appearance.hairStyle === 'PONYTAIL' && (
              <group>
                <mesh position={[0, 0.11, 0]}>
                  <boxGeometry args={[0.24, 0.08, 0.24]} />
                  <meshStandardMaterial color={appearance.hairColor} roughness={0.8} />
                </mesh>
                <mesh position={[0, 0.04, -0.15]}>
                  <cylinderGeometry args={[0.04, 0.02, 0.18, 8]} />
                  <meshStandardMaterial color={appearance.hairColor} roughness={0.8} />
                </mesh>
              </group>
            )}

            {/* Sunglasses / Shades */}
            <mesh position={[0, 0.02, 0.12]}>
              <boxGeometry args={[0.18, 0.05, 0.02]} />
              <meshStandardMaterial color="#111827" roughness={0.1} metalness={0.8} />
            </mesh>
          </group>

          {/* Left Arm */}
          <group ref={leftArmRef} position={[-0.27, 0.40, 0]}>
            {/* Shoulder sleeve */}
            <mesh position={[0, -0.08, 0]}>
              <boxGeometry args={[0.12, 0.16, 0.14]} />
              <meshStandardMaterial color={appearance.shirtColor} roughness={0.7} />
            </mesh>
            {/* Forearm & Hand */}
            <mesh castShadow position={[0, -0.28, 0]}>
              <boxGeometry args={[0.10, 0.28, 0.11]} />
              <meshStandardMaterial color={appearance.skinTone} roughness={0.5} />
            </mesh>
          </group>

          {/* Right Arm */}
          <group ref={rightArmRef} position={[0.27, 0.40, 0]}>
            <mesh position={[0, -0.08, 0]}>
              <boxGeometry args={[0.12, 0.16, 0.14]} />
              <meshStandardMaterial color={appearance.shirtColor} roughness={0.7} />
            </mesh>
            <mesh castShadow position={[0, -0.28, 0]}>
              <boxGeometry args={[0.10, 0.28, 0.11]} />
              <meshStandardMaterial color={appearance.skinTone} roughness={0.5} />
            </mesh>
          </group>
        </group>

        {/* Pelvis / Hips */}
        <mesh position={[0, 0.88, 0]}>
          <boxGeometry args={[0.38, 0.16, 0.22]} />
          <meshStandardMaterial color={appearance.pantsColor} roughness={0.8} />
        </mesh>

        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.12, 0.82, 0]}>
          {/* Pants leg */}
          <mesh castShadow position={[0, -0.36, 0]}>
            <boxGeometry args={[0.16, 0.68, 0.18]} />
            <meshStandardMaterial color={appearance.pantsColor} roughness={0.8} />
          </mesh>
          {/* Shoe */}
          <mesh position={[0, -0.76, 0.04]}>
            <boxGeometry args={[0.17, 0.10, 0.24]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.12, 0.82, 0]}>
          <mesh castShadow position={[0, -0.36, 0]}>
            <boxGeometry args={[0.16, 0.68, 0.18]} />
            <meshStandardMaterial color={appearance.pantsColor} roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.76, 0.04]}>
            <boxGeometry args={[0.17, 0.10, 0.24]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
        </group>
      </group>
    );
  }
);

NPCModel.displayName = 'NPCModel';
