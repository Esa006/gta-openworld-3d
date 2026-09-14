'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { soundFx } from '@/lib/soundEffects';
import { PoliceCruiser } from './PoliceCruiser';

interface CopUnit {
  id: string;
  pos: [number, number, number];
  heading: number;
  speed: number;
  maxSpeed: number;
}

export function PoliceSystem() {
  const wantedLevel = useGameStore((s) => s.wantedLevel);
  const playerPos = useGameStore((s) => s.position);
  const playerMode = useGameStore((s) => s.playerMode);
  const takeDamage = useGameStore((s) => s.takeDamage);
  const setWantedLevel = useGameStore((s) => s.setWantedLevel);

  const [copUnits, setCopUnits] = useState<CopUnit[]>([]);
  const unitsRef = useRef<CopUnit[]>([]);
  unitsRef.current = copUnits;

  const evasionTimerRef = useRef(0);

  // Manage police siren sound when wanted
  useEffect(() => {
    if (wantedLevel > 0) {
      soundFx.startSiren();
    } else {
      soundFx.stopSiren();
    }
    return () => {
      soundFx.stopSiren();
    };
  }, [wantedLevel]);

  // Adjust number of pursuit cruisers according to wanted level (1-5 stars)
  useEffect(() => {
    if (wantedLevel === 0) {
      setCopUnits([]);
      return;
    }

    const targetCount = wantedLevel === 1 ? 1 : wantedLevel === 2 ? 2 : wantedLevel === 3 ? 3 : 4;
    const currentUnits = [...unitsRef.current];

    if (currentUnits.length < targetCount) {
      // Spawn new units around player perimeter on roads
      const newUnits: CopUnit[] = [...currentUnits];
      for (let i = currentUnits.length; i < targetCount; i++) {
        const spawnAngle = (i * Math.PI * 2) / targetCount + Math.random() * 0.5;
        const spawnDist = 45 + Math.random() * 25;
        newUnits.push({
          id: `cop_cruiser_${Date.now()}_${i}`,
          pos: [
            playerPos[0] + Math.cos(spawnAngle) * spawnDist,
            0.65,
            playerPos[2] + Math.sin(spawnAngle) * spawnDist,
          ],
          heading: spawnAngle + Math.PI,
          speed: 0,
          maxSpeed: 24 + wantedLevel * 4,
        });
      }
      setCopUnits(newUnits);
    } else if (currentUnits.length > targetCount) {
      setCopUnits(currentUnits.slice(0, targetCount));
    }
  }, [wantedLevel, playerPos]);

  useFrame((_, delta) => {
    if (wantedLevel === 0 || unitsRef.current.length === 0) return;

    const [px, py, pz] = playerPos;
    let closestDist = Infinity;

    const updated = unitsRef.current.map((unit) => {
      let { pos, heading, speed, maxSpeed } = unit;

      const dx = px - pos[0];
      const dz = pz - pos[2];
      const dist = Math.hypot(dx, dz);
      if (dist < closestDist) closestDist = dist;

      // Pursuit steering towards player
      const targetAngle = Math.atan2(dx, dz);
      let angleDiff = targetAngle - heading;
      // Normalize angle difference to [-PI, PI]
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      heading += THREE.MathUtils.clamp(angleDiff, -delta * 3.5, delta * 3.5);

      // Accelerate or brake depending on proximity
      if (dist > 5.0) {
        speed = THREE.MathUtils.lerp(speed, maxSpeed, delta * 2.5);
      } else {
        // Ram / block player
        speed = THREE.MathUtils.lerp(speed, 6.0, delta * 4.0);

        // Inflict damage if player is on foot
        if (playerMode === 'FOOT' && dist < 2.2) {
          takeDamage(delta * 18);
        }
      }

      pos = [
        pos[0] + Math.sin(heading) * speed * delta,
        pos[1],
        pos[2] + Math.cos(heading) * speed * delta,
      ];

      return {
        ...unit,
        pos,
        heading,
        speed,
      };
    });

    unitsRef.current = updated;

    // Evade detection mechanic: if player is > 70m away for 12 seconds
    if (closestDist > 65) {
      evasionTimerRef.current += delta;
      if (evasionTimerRef.current >= 12.0) {
        setWantedLevel(0);
        evasionTimerRef.current = 0;
      }
    } else {
      evasionTimerRef.current = 0;
    }
  });

  if (wantedLevel === 0) return null;

  return (
    <group>
      {copUnits.map((cop) => (
        <PoliceCruiser
          key={cop.id}
          position={cop.pos}
          rotation={cop.heading}
          sirenActive={wantedLevel > 0}
          speed={cop.speed}
        />
      ))}
    </group>
  );
}
