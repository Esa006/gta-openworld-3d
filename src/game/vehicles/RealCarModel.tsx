'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

interface RealCarModelProps {
  color?: string;
  steerAngle?: number;
  speed?: number;
  isPolice?: boolean;
  sirenTick?: number;
  headlightsOn?: boolean;
}

export function RealCarModel({
  color = '#e11d48',
  steerAngle = 0,
  speed = 0,
  isPolice = false,
  sirenTick = 0,
  headlightsOn = true,
}: RealCarModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF('/models/ferrari.glb');

  // Clone scene so multiple cars can exist with unique materials
  const clone = useMemo(() => {
    const cloned = SkeletonUtils.clone(gltf.scene) as THREE.Group;

    // Enable shadows and clone materials so color changes don't affect all cars
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((m) => m.clone());
          } else {
            mesh.material = mesh.material.clone();
          }
        }
      }
    });

    return cloned;
  }, [gltf.scene]);

  // Find wheels and body parts for animation
  const parts = useMemo<{
    wheelFL: THREE.Object3D | null;
    wheelFR: THREE.Object3D | null;
    wheelRL: THREE.Object3D | null;
    wheelRR: THREE.Object3D | null;
    bodyMeshes: THREE.Mesh[];
  }>(() => {
    let wheelFL: THREE.Object3D | null = null;
    let wheelFR: THREE.Object3D | null = null;
    let wheelRL: THREE.Object3D | null = null;
    let wheelRR: THREE.Object3D | null = null;
    const bodyMeshes: THREE.Mesh[] = [];

    clone.traverse((child) => {
      const name = child.name.toLowerCase();
      if (name.includes('wheel_fl')) wheelFL = child;
      if (name.includes('wheel_fr')) wheelFR = child;
      if (name.includes('wheel_rl')) wheelRL = child;
      if (name.includes('wheel_rr')) wheelRR = child;

      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat && mat.name === 'Body_Color') {
          bodyMeshes.push(mesh);
        }
      }
    });

    return { wheelFL, wheelFR, wheelRL, wheelRR, bodyMeshes };
  }, [clone]);

  // Apply car paint color
  useEffect(() => {
    parts.bodyMeshes.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.color = new THREE.Color(color);
        mat.roughness = 0.2;
        mat.metalness = 0.85;
      }
    });
  }, [color, parts.bodyMeshes]);

  // Animate wheel steering and rotation
  const wheelRotationRef = useRef(0);
  useFrame((_, delta) => {
    const { wheelFL, wheelFR, wheelRL, wheelRR } = parts;

    // Steer front wheels
    if (wheelFL) {
      wheelFL.rotation.y = steerAngle;
    }
    if (wheelFR) {
      wheelFR.rotation.y = steerAngle;
    }

    // Rotate all wheels according to forward speed
    if (Math.abs(speed) > 0.1) {
      wheelRotationRef.current += (speed * delta) / 0.35; // tire radius ~0.35m
      if (wheelFL) wheelFL.rotation.x = wheelRotationRef.current;
      if (wheelFR) wheelFR.rotation.x = wheelRotationRef.current;
      if (wheelRL) wheelRL.rotation.x = wheelRotationRef.current;
      if (wheelRR) wheelRR.rotation.x = wheelRotationRef.current;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Real Ferrari Sports Car Model (Positioned grounded at origin) */}
      <primitive object={clone} position={[0, -0.42, 0]} />

      {/* Headlights Spotlight & Glow */}
      {headlightsOn && (
        <group position={[0, 0.45, -2.1]}>
          <spotLight
            position={[-0.6, 0, 0]}
            target-position={[-0.6, -0.5, -25]}
            intensity={35}
            distance={40}
            angle={0.5}
            penumbra={0.7}
            color="#fffbeb"
          />
          <spotLight
            position={[0.6, 0, 0]}
            target-position={[0.6, -0.5, -25]}
            intensity={35}
            distance={40}
            angle={0.5}
            penumbra={0.7}
            color="#fffbeb"
          />
        </group>
      )}

      {/* Police Siren Lightbar for Police Pursuit Variant */}
      {isPolice && (
        <group position={[0, 0.85, -0.15]}>
          {/* Lightbar Bar */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.9, 0.08, 0.22]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Blue Strobe Left */}
          <mesh position={[-0.3, 0.05, 0]}>
            <boxGeometry args={[0.26, 0.09, 0.2]} />
            <meshBasicMaterial color={sirenTick % 2 < 1 ? '#0066ff' : '#001133'} />
          </mesh>
          {/* Red Strobe Right */}
          <mesh position={[0.3, 0.05, 0]}>
            <boxGeometry args={[0.26, 0.09, 0.2]} />
            <meshBasicMaterial color={sirenTick % 2 >= 1 ? '#ff0033' : '#330011'} />
          </mesh>
          {/* Dynamic Light Flash */}
          <pointLight
            position={[0, 0.2, 0]}
            intensity={18}
            distance={15}
            color={sirenTick % 2 < 1 ? '#0066ff' : '#ff0033'}
          />
        </group>
      )}
    </group>
  );
}

useGLTF.preload('/models/ferrari.glb');
