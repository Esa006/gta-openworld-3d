'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

interface RealCharacterModelProps {
  speed?: number;
  isSprinting?: boolean;
  isDriving?: boolean;
  modelType?: 'CIVILIAN' | 'SOLDIER';
  tintColor?: string;
  hasDuffleBag?: boolean;
}

// Module-level cache for properly retargeted Mixamo humanoid clips
let cachedCivilianClips: Record<string, THREE.AnimationClip> | null = null;

function getCivilianClips(
  targetScene: THREE.Group,
  sourceScene: THREE.Group,
  sourceAnimations: THREE.AnimationClip[]
): Record<string, THREE.AnimationClip> {
  if (cachedCivilianClips) return cachedCivilianClips;

  let sourceMesh: THREE.SkinnedMesh | undefined;
  let targetMesh: THREE.SkinnedMesh | undefined;

  sourceScene.traverse((c) => {
    if ((c as THREE.SkinnedMesh).isSkinnedMesh && !sourceMesh) {
      sourceMesh = c as THREE.SkinnedMesh;
    }
  });

  targetScene.traverse((c) => {
    if ((c as THREE.SkinnedMesh).isSkinnedMesh && !targetMesh) {
      targetMesh = c as THREE.SkinnedMesh;
    }
  });

  if (!sourceMesh || !targetMesh) return {};

  const names: Record<string, string> = {};
  targetMesh.skeleton.bones.forEach((b) => {
    names[b.name] = 'mixamorig' + b.name;
  });

  const clips: Record<string, THREE.AnimationClip> = {};

  ['Idle', 'Walk', 'Run'].forEach((animName) => {
    const rawClip = sourceAnimations.find((a) => a.name === animName);
    if (rawClip) {
      try {
        const retargeted = SkeletonUtils.retargetClip(targetMesh!, sourceMesh!, rawClip, {
          names,
          fps: 24,
        });
        // Filter to valid target bone tracks (.bones[...])
        retargeted.tracks = retargeted.tracks.filter((t) => t.name.startsWith('.bones['));
        retargeted.name = animName;
        clips[animName] = retargeted;
      } catch (err) {
        console.warn('Failed to retarget clip:', animName, err);
      }
    }
  });

  cachedCivilianClips = clips;
  return cachedCivilianClips;
}

export function RealCharacterModel({
  speed = 0,
  isSprinting = false,
  isDriving = false,
  modelType = 'CIVILIAN',
  tintColor,
  hasDuffleBag = true,
}: RealCharacterModelProps) {
  const civilianGltf = useGLTF('/models/civilian.glb');
  const soldierGltf = useGLTF('/models/man.glb');

  // Clone character scene and skeleton with unique materials
  const clone = useMemo(() => {
    const baseScene = modelType === 'SOLDIER' ? soldierGltf.scene : civilianGltf.scene;
    const cloned = SkeletonUtils.clone(baseScene) as THREE.Group;

    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;

        // Clone material so instances don't share identical material instances
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((m) => m.clone());
          } else {
            mesh.material = mesh.material.clone();
          }

          if (tintColor) {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((m) => {
              if (
                m.name === 'Wolf3D_Outfit_Top' ||
                m.name.includes('Top') ||
                m.name.includes('vanguard')
              ) {
                (m as THREE.MeshStandardMaterial).color = new THREE.Color(tintColor);
              }
            });
          }
        }
      }
    });

    return cloned;
  }, [civilianGltf.scene, soldierGltf.scene, modelType, tintColor]);

  // Find the primary SkinnedMesh within the clone to bind the mixer
  const targetSkinnedMesh = useMemo(() => {
    let mesh: THREE.SkinnedMesh | undefined;
    clone.traverse((c) => {
      if ((c as THREE.SkinnedMesh).isSkinnedMesh && !mesh) {
        mesh = c as THREE.SkinnedMesh;
      }
    });
    return mesh || clone;
  }, [clone]);

  // AnimationMixer bound to the skinned mesh
  const mixer = useMemo(() => new THREE.AnimationMixer(targetSkinnedMesh), [targetSkinnedMesh]);

  // Actions map
  const actions = useMemo(() => {
    const map: Record<string, THREE.AnimationAction> = {};

    if (modelType === 'SOLDIER') {
      soldierGltf.animations.forEach((clip) => {
        map[clip.name] = mixer.clipAction(clip);
      });
    } else {
      const civClips = getCivilianClips(
        civilianGltf.scene as THREE.Group,
        soldierGltf.scene as THREE.Group,
        soldierGltf.animations
      );
      Object.entries(civClips).forEach(([name, clip]) => {
        map[name] = mixer.clipAction(clip);
      });
    }
    return map;
  }, [mixer, modelType, soldierGltf.scene, soldierGltf.animations, civilianGltf.scene]);

  // Active animation state tracking
  const currentActionName = useRef<string>('Idle');

  // Unified animation controller: blends smoothly between Idle, Walk, and Run
  useEffect(() => {
    let targetAction = 'Idle';
    if (speed > 7.0 || isSprinting) {
      targetAction = 'Run';
    } else if (speed > 0.15) {
      targetAction = 'Walk';
    }

    const currentName = currentActionName.current;
    const next = actions[targetAction];

    if (next && (currentName !== targetAction || !next.isRunning())) {
      const prev = actions[currentName];

      next.reset();
      next.enabled = true;
      next.setEffectiveTimeScale(targetAction === 'Run' && isSprinting ? 1.25 : 1.0);
      next.setEffectiveWeight(1);
      if (prev && prev !== next && prev.isRunning()) {
        next.crossFadeFrom(prev, 0.25, true);
      }
      next.play();

      currentActionName.current = targetAction;
    }
  }, [speed, isSprinting, actions]);

  // Clean shutdown on component unmount
  useEffect(() => {
    return () => {
      mixer.stopAllAction();
    };
  }, [mixer]);

  // Single source of truth for mixer update per frame
  useFrame((_, delta) => {
    mixer.update(delta);
  });

  // If driving inside a car, hide or minimize model
  if (isDriving) return null;

  return (
    <group>
      {/* Real 3D Animated Human Protagonist - Naturally upright and facing forward (-Z) */}
      <primitive object={clone} position={[0, 0, 0]} rotation={[0, 0, 0]} />

      {/* Crossbody Duffle Bag Slung Across Back */}
      {hasDuffleBag && (
        <group position={[0.06, 1.16, 0.16]} rotation={[0, 0, 0.35]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.11, 0.11, 0.42, 16]} />
            <meshStandardMaterial color="#18181b" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.21, 0]}>
            <sphereGeometry args={[0.11, 10, 10]} scale={[1, 0.3, 1]} />
            <meshStandardMaterial color="#27272a" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.21, 0]}>
            <sphereGeometry args={[0.11, 10, 10]} scale={[1, 0.3, 1]} />
            <meshStandardMaterial color="#27272a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, -0.112]}>
            <boxGeometry args={[0.015, 0.34, 0.01]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Strap */}
          <mesh position={[-0.04, 0.14, -0.12]} rotation={[0, 0, 0.5]}>
            <boxGeometry args={[0.045, 0.44, 0.015]} />
            <meshStandardMaterial color="#09090b" roughness={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
}

useGLTF.preload('/models/civilian.glb');
useGLTF.preload('/models/man.glb');
