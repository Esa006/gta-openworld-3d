'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { RealCharacterModel } from '@/game/player/RealCharacterModel';
import { subscribeDriverEjection } from '@/game/vehicles/CarjackingSystem';

interface NPCAppearance {
  shirtColor: string;
}

interface Pedestrian {
  id: string;
  name: string;
  appearance: NPCAppearance;
  pos: [number, number, number];
  heading: number;
  speed: number;
  waypointIdx: number;
  waypoints: [number, number][];
  state: 'WALK' | 'PANIC' | 'HIT';
  panicTimer: number;
}

export function NPCController() {
  const playerPos = useGameStore((s) => s.position);
  const wantedLevel = useGameStore((s) => s.wantedLevel);
  const activeVehicleSpeed = useGameStore((s) => s.vehicleSpeed);
  const playerMode = useGameStore((s) => s.playerMode);
  const addCash = useGameStore((s) => s.addCash);

  // Generate 16 diverse Miami pedestrians walking down both Ocean Drive sidewalks and crosswalks
  const initialPeds = useMemo<Pedestrian[]>(() => {
    const list: Pedestrian[] = [
      // ================= EAST SIDEWALK (x = 10.2) =================
      {
        id: 'ped_1',
        name: 'Carlos',
        appearance: { shirtColor: '#f43f5e' }, // Hot pink Miami shirt
        pos: [10.2, 0.24, 4.0],
        heading: 0,
        speed: 1.8,
        waypointIdx: 0,
        waypoints: [[10.2, -65], [10.2, 50]],
        state: 'WALK',
        panicTimer: 0,
      },
      {
        id: 'ped_2',
        name: 'Elena',
        appearance: { shirtColor: '#06b6d4' }, // Cyan tank top
        pos: [10.2, 0.24, -18.0],
        heading: Math.PI,
        speed: 1.6,
        waypointIdx: 0,
        waypoints: [[10.2, 60], [10.2, -50]],
        state: 'WALK',
        panicTimer: 0,
      },
      {
        id: 'ped_3',
        name: 'Darius',
        appearance: { shirtColor: '#10b981' }, // Emerald green jersey
        pos: [10.2, 0.24, -8.0],
        heading: 0,
        speed: 2.8, // Jogger
        waypointIdx: 0,
        waypoints: [[10.2, -80], [10.2, 40]],
        state: 'WALK',
        panicTimer: 0,
      },
      {
        id: 'ped_4',
        name: 'Sophia',
        appearance: { shirtColor: '#f59e0b' }, // Sunset yellow
        pos: [10.2, 0.24, 25.0],
        heading: 0,
        speed: 1.7,
        waypointIdx: 0,
        waypoints: [[10.2, -50], [10.2, 70]],
        state: 'WALK',
        panicTimer: 0,
      },
      {
        id: 'ped_5',
        name: 'Marco',
        appearance: { shirtColor: '#f8fafc' }, // White linen
        pos: [10.2, 0.24, -38.0],
        heading: Math.PI,
        speed: 1.8,
        waypointIdx: 0,
        waypoints: [[10.2, 50], [10.2, -70]],
        state: 'WALK',
        panicTimer: 0,
      },
      {
        id: 'ped_6',
        name: 'Jasmine',
        appearance: { shirtColor: '#ec4899' }, // Magenta streetwear
        pos: [10.2, 0.24, 45.0],
        heading: 0,
        speed: 1.9,
        waypointIdx: 0,
        waypoints: [[10.2, -60], [10.2, 80]],
        state: 'WALK',
        panicTimer: 0,
      },

      // ================= WEST SIDEWALK (x = -10.2) =================
      {
        id: 'ped_7',
        name: 'Tyler',
        appearance: { shirtColor: '#eab308' }, // Amber polo
        pos: [-10.2, 0.24, -5.0],
        heading: Math.PI,
        speed: 1.8,
        waypointIdx: 0,
        waypoints: [[-10.2, 55], [-10.2, -65]],
        state: 'WALK',
        panicTimer: 0,
      },
      {
        id: 'ped_8',
        name: 'Chloe',
        appearance: { shirtColor: '#3b82f6' }, // Ocean blue dress
        pos: [-10.2, 0.24, 15.0],
        heading: 0,
        speed: 1.7,
        waypointIdx: 0,
        waypoints: [[-10.2, -70], [-10.2, 50]],
        state: 'WALK',
        panicTimer: 0,
      },
      {
        id: 'ped_9',
        name: 'Vic',
        appearance: { shirtColor: '#6366f1' }, // Indigo casual
        pos: [-10.2, 0.24, -28.0],
        heading: Math.PI,
        speed: 1.9,
        waypointIdx: 0,
        waypoints: [[-10.2, 60], [-10.2, -50]],
        state: 'WALK',
        panicTimer: 0,
      },
      {
        id: 'ped_10',
        name: 'Isabella',
        appearance: { shirtColor: '#14b8a6' }, // Teal Miami top
        pos: [-10.2, 0.24, 35.0],
        heading: 0,
        speed: 1.6,
        waypointIdx: 0,
        waypoints: [[-10.2, -60], [-10.2, 70]],
        state: 'WALK',
        panicTimer: 0,
      },
      {
        id: 'ped_11',
        name: 'Devon',
        appearance: { shirtColor: '#ef4444' }, // Crimson runner
        pos: [-10.2, 0.24, -45.0],
        heading: Math.PI,
        speed: 2.9, // Jogger
        waypointIdx: 0,
        waypoints: [[-10.2, 65], [-10.2, -75]],
        state: 'WALK',
        panicTimer: 0,
      },
      {
        id: 'ped_12',
        name: 'Mia',
        appearance: { shirtColor: '#a855f7' }, // Purple fashion top
        pos: [-10.2, 0.24, -12.0],
        heading: 0,
        speed: 1.7,
        waypointIdx: 0,
        waypoints: [[-10.2, -75], [-10.2, 45]],
        state: 'WALK',
        panicTimer: 0,
      },

      // ================= CROSSWALKS (Crossing the Avenue) =================
      {
        id: 'ped_13',
        name: 'Leo',
        appearance: { shirtColor: '#f97316' }, // Orange tee
        pos: [-9.5, 0.24, -12.0],
        heading: Math.PI / 2, // Crossing East
        speed: 1.6,
        waypointIdx: 0,
        waypoints: [[9.5, -12.0], [-9.5, -12.0]],
        state: 'WALK',
        panicTimer: 0,
      },
      {
        id: 'ped_14',
        name: 'Maya',
        appearance: { shirtColor: '#84cc16' }, // Lime green top
        pos: [9.5, 0.24, -12.0],
        heading: -Math.PI / 2, // Crossing West
        speed: 1.5,
        waypointIdx: 0,
        waypoints: [[-9.5, -12.0], [9.5, -12.0]],
        state: 'WALK',
        panicTimer: 0,
      },
      {
        id: 'ped_15',
        name: 'Lucas',
        appearance: { shirtColor: '#0ea5e9' }, // Sky blue shirt
        pos: [-9.5, 0.24, 12.0],
        heading: Math.PI / 2, // Crossing East
        speed: 1.6,
        waypointIdx: 0,
        waypoints: [[9.5, 12.0], [-9.5, 12.0]],
        state: 'WALK',
        panicTimer: 0,
      },
      {
        id: 'ped_16',
        name: 'Zoe',
        appearance: { shirtColor: '#fb7185' }, // Coral pink top
        pos: [9.5, 0.24, 12.0],
        heading: -Math.PI / 2, // Crossing West
        speed: 1.5,
        waypointIdx: 0,
        waypoints: [[-9.5, 12.0], [9.5, 12.0]],
        state: 'WALK',
        panicTimer: 0,
      },

      // ================= CITY 2 (VICE BAY FINANCIAL DISTRICT) PLAZAS =================
      {
        id: 'ped_17',
        name: 'Alexander',
        appearance: { shirtColor: '#1e293b' }, // Executive Navy
        pos: [11.5, 0.24, -480.0],
        heading: 0,
        speed: 1.7,
        waypointIdx: 0,
        waypoints: [[11.5, -590.0], [11.5, -460.0]],
        state: 'WALK',
        panicTimer: 0,
      },
      {
        id: 'ped_18',
        name: 'Natasha',
        appearance: { shirtColor: '#f1f5f9' }, // White luxury suit
        pos: [11.5, 0.24, -550.0],
        heading: Math.PI,
        speed: 1.6,
        waypointIdx: 0,
        waypoints: [[11.5, -460.0], [11.5, -610.0]],
        state: 'WALK',
        panicTimer: 0,
      },
      {
        id: 'ped_19',
        name: 'Kendrick',
        appearance: { shirtColor: '#0284c7' }, // Financial analyst blue
        pos: [-11.5, 0.24, -510.0],
        heading: 0,
        speed: 1.8,
        waypointIdx: 0,
        waypoints: [[-11.5, -620.0], [-11.5, -470.0]],
        state: 'WALK',
        panicTimer: 0,
      },
      {
        id: 'ped_20',
        name: 'Camila',
        appearance: { shirtColor: '#e11d48' }, // Crimson dress
        pos: [-11.5, 0.24, -580.0],
        heading: Math.PI,
        speed: 1.6,
        waypointIdx: 0,
        waypoints: [[-11.5, -480.0], [-11.5, -630.0]],
        state: 'WALK',
        panicTimer: 0,
      },
      {
        id: 'ped_21',
        name: 'Marcus',
        appearance: { shirtColor: '#10b981' }, // Corporate emerald
        pos: [0, 0.24, -550.0],
        heading: Math.PI / 2,
        speed: 1.5,
        waypointIdx: 0,
        waypoints: [[10.0, -550.0], [-10.0, -550.0]],
        state: 'WALK',
        panicTimer: 0,
      },
      {
        id: 'ped_22',
        name: 'Valeria',
        appearance: { shirtColor: '#a855f7' }, // Purple velvet
        pos: [-6.0, 0.24, -550.0],
        heading: -Math.PI / 2,
        speed: 1.5,
        waypointIdx: 0,
        waypoints: [[-10.0, -550.0], [10.0, -550.0]],
        state: 'WALK',
        panicTimer: 0,
      },
    ];
    return list;
  }, []);

  const [peds, setPeds] = useState<Pedestrian[]>(initialPeds);
  const pedsStateRef = useRef<Pedestrian[]>(initialPeds);
  const pedRefs = useRef<{ [id: string]: THREE.Group | null }>({});

  // Listen for carjacked drivers falling onto the pavement
  useEffect(() => {
    const unsub = subscribeDriverEjection((ejected) => {
      const newPed: Pedestrian = {
        id: ejected.id,
        name: 'Ejected Driver',
        appearance: { shirtColor: '#f59e0b' },
        pos: [ejected.pos[0], 0.24, ejected.pos[2]],
        heading: ejected.heading,
        speed: 6.5,
        waypointIdx: 0,
        waypoints: [[ejected.pos[0] + 40, ejected.pos[2] + 40]],
        state: 'PANIC',
        panicTimer: 10.0,
      };
      pedsStateRef.current = [...pedsStateRef.current, newPed];
      setPeds((prev) => [...prev, newPed]);
    });
    return unsub;
  }, []);

  useFrame((_, delta) => {
    const [px, py, pz] = playerPos;

    const updated = pedsStateRef.current.map((ped) => {
      let { pos, heading, speed, waypointIdx, waypoints, state: pedState, panicTimer } = ped;

      // Distance to player
      const dxPlayer = px - pos[0];
      const dzPlayer = pz - pos[2];
      const distToPlayer = Math.hypot(dxPlayer, dzPlayer);

      // Trigger panic if player is shooting (wantedLevel > 0), or driving fast towards pedestrian
      const isCarThreat = playerMode === 'DRIVING' && activeVehicleSpeed > 15 && distToPlayer < 14;
      const isShootingThreat = wantedLevel > 0 && distToPlayer < 35;

      if ((isCarThreat || isShootingThreat) && pedState !== 'PANIC') {
        pedState = 'PANIC';
        panicTimer = 6.0;
      }

      if (pedState === 'PANIC') {
        panicTimer -= delta;
        if (panicTimer <= 0) {
          pedState = 'WALK';
        }

        // Run AWAY from player: forward is -Z in model coordinates
        const fleeHeading = Math.atan2(-dxPlayer, dzPlayer);
        heading = THREE.MathUtils.lerp(heading, fleeHeading, delta * 8);
        const fleeSpeed = 5.8;

        pos = [
          pos[0] + Math.sin(heading) * fleeSpeed * delta,
          pos[1],
          pos[2] - Math.cos(heading) * fleeSpeed * delta,
        ];
      } else if (pedState === 'WALK') {
        // Leisurely sidewalk patrol
        const targetWp = waypoints[waypointIdx];
        const toWpX = targetWp[0] - pos[0];
        const toWpZ = targetWp[1] - pos[2];
        const distToWp = Math.hypot(toWpX, toWpZ);

        if (distToWp < 1.5) {
          waypointIdx = (waypointIdx + 1) % waypoints.length;
        }

        // Align heading so character faces where they walk (forward = -Z)
        const targetHeading = Math.atan2(toWpX, -toWpZ);
        heading = THREE.MathUtils.lerp(heading, targetHeading, delta * 4);

        pos = [
          pos[0] + Math.sin(heading) * speed * delta,
          0.24, // Sidewalk elevation
          pos[2] - Math.cos(heading) * speed * delta,
        ];
      }

      // Vehicle knockdown
      if (playerMode === 'DRIVING' && distToPlayer < 1.8 && activeVehicleSpeed > 10 && pedState !== 'HIT') {
        pedState = 'HIT';
        addCash(25);
        setTimeout(() => {
          const p = pedsStateRef.current.find((x) => x.id === ped.id);
          if (p) p.state = 'WALK';
        }, 3000);
      }

      // Direct high-performance 60 FPS update of 3D scene mesh
      const grp = pedRefs.current[ped.id];
      if (grp) {
        grp.position.set(pos[0], pos[1], pos[2]);
        grp.rotation.y = heading;
      }

      return {
        ...ped,
        pos,
        heading,
        waypointIdx,
        state: pedState,
        panicTimer,
      };
    });

    pedsStateRef.current = updated;
  });

  return (
    <group>
      {peds.map((ped) => (
        <group
          key={ped.id}
          ref={(el) => {
            pedRefs.current[ped.id] = el;
          }}
          position={ped.pos}
          rotation={[0, ped.heading, 0]}
        >
          <RealCharacterModel
            speed={ped.state === 'PANIC' ? 9.2 : 2.0}
            isSprinting={ped.state === 'PANIC'}
            modelType="CIVILIAN"
            tintColor={ped.appearance.shirtColor}
            hasDuffleBag={false}
          />

          {/* Panic alert indicator */}
          {ped.state === 'PANIC' && (
            <mesh position={[0, 2.1, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}
