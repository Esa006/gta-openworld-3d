'use client';

import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { registerVehicle } from '@/lib/vehicleRegistry';
import { RealCarModel } from './RealCarModel';
import { VehicleController } from './VehicleController';
import { VehicleData } from '@/types/gta';

interface TrafficCar {
  id: string;
  name: string;
  laneX: number;
  startZ: number;
  dirZ: number;
  speed: number;
  minZ: number;
  maxZ: number;
  color: string;
}

export function TrafficAI() {
  const playerPos = useGameStore((s) => s.position);
  const activeVehicleId = useGameStore((s) => s.activeVehicleId);

  const trafficCars = useMemo<TrafficCar[]>(() => [
    // ================= 1. CITY 1 (OCEAN DRIVE) TRAFFIC =================
    { id: 'traffic_01', name: 'Cheetah Turbo', laneX: -4.0, startZ: 80, dirZ: -1, speed: 11.0, minZ: -130, maxZ: 130, color: '#f59e0b' },
    { id: 'traffic_02', name: 'Infernus Classic', laneX: 4.0, startZ: -90, dirZ: 1, speed: 10.5, minZ: -130, maxZ: 130, color: '#ef4444' },
    { id: 'traffic_03', name: 'Esperanto Sedan', laneX: -4.0, startZ: -40, dirZ: -1, speed: 9.5, minZ: -130, maxZ: 130, color: '#10b981' },
    { id: 'traffic_04', name: 'Idaho Coupe', laneX: 4.0, startZ: 30, dirZ: 1, speed: 10.0, minZ: -130, maxZ: 130, color: '#6366f1' },

    // ================= 2. HIGH-SPEED HIGHWAY CAUSEWAY EXPRESSWAY =================
    // Northbound Fast Lane (x = -5.2) -> Heading to City 2
    { id: 'hwy_traffic_01', name: 'Banshee Twin-Turbo', laneX: -5.2, startZ: -180, dirZ: -1, speed: 22.0, minZ: -660, maxZ: 60, color: '#00e5ff' },
    { id: 'hwy_traffic_02', name: 'Comet GT', laneX: -5.2, startZ: -380, dirZ: -1, speed: 24.0, minZ: -660, maxZ: 60, color: '#ec4899' },
    // Northbound Cruising Lane (x = -2.2)
    { id: 'hwy_traffic_03', name: 'Washington Luxury', laneX: -2.2, startZ: -280, dirZ: -1, speed: 18.0, minZ: -660, maxZ: 60, color: '#e2e8f0' },
    
    // Southbound Fast Lane (x = 5.2) -> Heading to City 1
    { id: 'hwy_traffic_04', name: 'Phoenix 454', laneX: 5.2, startZ: -420, dirZ: 1, speed: 23.0, minZ: -660, maxZ: 60, color: '#f97316' },
    { id: 'hwy_traffic_05', name: 'Stinger V8', laneX: 5.2, startZ: -220, dirZ: 1, speed: 21.0, minZ: -660, maxZ: 60, color: '#eab308' },
    // Southbound Cruising Lane (x = 2.2)
    { id: 'hwy_traffic_06', name: 'Kuruma Sport', laneX: 2.2, startZ: -320, dirZ: 1, speed: 18.5, minZ: -660, maxZ: 60, color: '#3b82f6' },

    // ================= 3. CITY 2 (VICE BAY FINANCIAL DISTRICT) =================
    { id: 'c2_traffic_01', name: 'Admiral Executive', laneX: -5.0, startZ: -480, dirZ: -1, speed: 12.0, minZ: -680, maxZ: -420, color: '#09090b' },
    { id: 'c2_traffic_02', name: 'Sentinal XS', laneX: 5.0, startZ: -620, dirZ: 1, speed: 11.5, minZ: -680, maxZ: -420, color: '#a855f7' },
  ], []);

  const carRefs = useRef<{ [key: string]: THREE.Group | null }>({});
  const [hijackedCars, setHijackedCars] = useState<Record<string, VehicleData>>({});

  useFrame((_, delta) => {
    // Promote carjacked traffic vehicle into physical drivable vehicle
    if (activeVehicleId && (activeVehicleId.startsWith('traffic_') || activeVehicleId.startsWith('hwy_') || activeVehicleId.startsWith('c2_')) && !hijackedCars[activeVehicleId]) {
      const targetCar = trafficCars.find((c) => c.id === activeVehicleId);
      const grp = carRefs.current[activeVehicleId];
      if (targetCar && grp) {
        setHijackedCars((prev) => ({
          ...prev,
          [activeVehicleId]: {
            id: targetCar.id,
            modelName: targetCar.name,
            vehicleType: 'SPORTS',
            color: targetCar.color,
            topSpeed: 58.0,
            acceleration: 42.0,
            handling: 0.94,
            health: 100,
            maxHealth: 100,
            position: [grp.position.x, 0.8, grp.position.z],
            rotation: grp.rotation.y,
          },
        }));
      }
    }

    trafficCars.forEach((car) => {
      if (hijackedCars[car.id]) return;

      const grp = carRefs.current[car.id];
      if (!grp) return;

      // Distance to player
      const dx = playerPos[0] - grp.position.x;
      const dz = playerPos[2] - grp.position.z;
      const distToPlayer = Math.hypot(dx, dz);

      // Yield/stop if player is directly ahead in same lane
      const isPlayerAhead = (car.dirZ < 0 && dz < 0 && dz > -12) || (car.dirZ > 0 && dz > 0 && dz < 12);
      const shouldBrake = Math.abs(dx) < 2.8 && isPlayerAhead && distToPlayer < 9;

      if (!shouldBrake) {
        grp.position.z += car.dirZ * car.speed * delta;

        // Loop within assigned district boundary
        if (grp.position.z < car.minZ) grp.position.z = car.maxZ;
        if (grp.position.z > car.maxZ) grp.position.z = car.minZ;
      }

      // Register vehicle coordinates for carjacking detection
      registerVehicle({
        id: car.id,
        name: car.name,
        type: 'SPORTS',
        pos: { x: grp.position.x, y: grp.position.y, z: grp.position.z },
        heading: car.dirZ < 0 ? 0 : Math.PI,
      });
    });
  });

  return (
    <group>
      {/* Hijacked traffic vehicles become fully drivable physical vehicles */}
      {Object.values(hijackedCars).map((v) => (
        <VehicleController key={v.id} vehicle={v} />
      ))}

      {/* Ambient AI traffic vehicles */}
      {trafficCars
        .filter((car) => !hijackedCars[car.id])
        .map((car) => (
          <group
            key={car.id}
            ref={(el) => {
              carRefs.current[car.id] = el;
            }}
            position={[car.laneX, 0.45, car.startZ]}
            rotation={[0, car.dirZ < 0 ? 0 : Math.PI, 0]}
          >
            <RealCarModel color={car.color} speed={car.speed} />
          </group>
        ))}
    </group>
  );
}
