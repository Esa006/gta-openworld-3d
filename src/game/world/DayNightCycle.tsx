'use client';

import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useWorldStore } from '@/stores/useWorldStore';

export function DayNightCycle() {
  const { scene } = useThree();
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const moonLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);

  const timeOfDay = useWorldStore((s) => s.timeOfDay);
  const advanceTime = useWorldStore((s) => s.advanceTime);

  useFrame((_, delta) => {
    // Progress celestial clock
    advanceTime(delta);

    // Calculate celestial angle (6:00 = sunrise, 12:00 = zenith, 18:00 = sunset, 24:00 = midnight)
    const cycleRad = ((timeOfDay - 6) / 24) * Math.PI * 2;
    const sunHeight = Math.sin(cycleRad);
    const sunDist = 140;

    const sunX = Math.cos(cycleRad) * sunDist;
    const sunY = Math.max(-20, sunHeight * sunDist);
    const sunZ = -260; // Centered between City 1 and City 2

    const isDay = sunHeight > 0.05;
    const isSunset = Math.abs(sunHeight) <= 0.28 && timeOfDay > 16.0;
    const isMorning = Math.abs(sunHeight) <= 0.28 && timeOfDay <= 10.0;

    // Update Sun Light
    if (dirLightRef.current) {
      dirLightRef.current.position.set(sunX, Math.max(10, sunY), sunZ);

      if (isDay) {
        dirLightRef.current.intensity = THREE.MathUtils.lerp(
          dirLightRef.current.intensity,
          isSunset ? 1.4 : isMorning ? 1.5 : 1.95,
          delta * 2
        );
        dirLightRef.current.color.set(isSunset ? '#fb923c' : isMorning ? '#fed7aa' : '#fffbeb');
      } else {
        dirLightRef.current.intensity = THREE.MathUtils.lerp(dirLightRef.current.intensity, 0, delta * 4);
      }
    }

    // Update Moon Light
    if (moonLightRef.current) {
      moonLightRef.current.position.set(-sunX, Math.max(10, -sunY), sunZ);
      moonLightRef.current.intensity = isDay ? 0 : 0.45;
    }

    // Ambient Lighting
    if (ambientLightRef.current) {
      if (isDay) {
        ambientLightRef.current.intensity = isSunset ? 0.55 : isMorning ? 0.6 : 0.8;
        ambientLightRef.current.color.set(isSunset ? '#fed7aa' : isMorning ? '#ffedd5' : '#e0f2fe');
      } else {
        ambientLightRef.current.intensity = 0.28;
        ambientLightRef.current.color.set('#1e1b4b');
      }
    }

    // Dynamic Background Sky Color
    if (scene.background instanceof THREE.Color) {
      if (isDay) {
        const targetColor = isSunset
          ? new THREE.Color('#fdba74')
          : isMorning
          ? new THREE.Color('#fbcfe8')
          : new THREE.Color('#38bdf8');
        scene.background.lerp(targetColor, delta * 2);
      } else {
        scene.background.lerp(new THREE.Color('#030712'), delta * 2);
      }
    }
  });

  return (
    <group>
      {/* Sun Directional Light with High Quality Realtime Shadows for Dual Cities */}
      <directionalLight
        ref={dirLightRef}
        position={[80, 160, -260]}
        intensity={1.95}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-220}
        shadow-camera-right={220}
        shadow-camera-top={350}
        shadow-camera-bottom={-350}
        shadow-camera-near={10}
        shadow-camera-far={480}
        shadow-bias={-0.0004}
        color="#fffbeb"
      />

      {/* Moon Directional Light for Atmospheric Night */}
      <directionalLight
        ref={moonLightRef}
        position={[-80, 140, -260]}
        intensity={0}
        color="#93c5fd"
      />

      {/* Ambient Bounce */}
      <ambientLight ref={ambientLightRef} intensity={0.7} color="#e0f2fe" />
    </group>
  );
}
