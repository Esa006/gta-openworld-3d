'use client';

import React, { useEffect, useState } from 'react';
import { VehicleData } from '@/types/gta';
import { VehicleController } from '@/game/vehicles/VehicleController';

const DEFAULT_VEHICLES: VehicleData[] = [
  {
    id: 'veh_ferrari_red',
    modelName: 'Infernus GT Supercar',
    vehicleType: 'SPORTS',
    color: '#ef4444', // Ferrari Rosso Corsa Red
    topSpeed: 60.0, // 134 MPH
    acceleration: 46.0,
    handling: 0.98,
    health: 100,
    maxHealth: 100,
    position: [4.0, 0.8, 6.0],
    rotation: Math.PI,
  },
  {
    id: 'veh_sanchez_04',
    modelName: 'Sanchez 500 Sport',
    vehicleType: 'MOTO',
    color: '#f59e0b',
    topSpeed: 46.0, // 103 MPH
    acceleration: 42.0,
    handling: 0.96,
    health: 90,
    maxHealth: 90,
    position: [2.8, 0.8, -9.0],
    rotation: Math.PI / 3,
  },
  {
    id: 'veh_stallion_02',
    modelName: 'Stallion V8 Retro',
    vehicleType: 'MUSCLE',
    color: '#ec4899',
    topSpeed: 50.0, // 112 MPH
    acceleration: 38.0,
    handling: 0.86,
    health: 100,
    maxHealth: 100,
    position: [12.0, 0.8, -24.0],
    rotation: -Math.PI / 2,
  },
  {
    id: 'veh_banshee_01',
    modelName: 'Banshee GT Twin-Turbo',
    vehicleType: 'SPORTS',
    color: '#00e5ff',
    topSpeed: 56.0, // 125 MPH
    acceleration: 42.0,
    handling: 0.94,
    health: 100,
    maxHealth: 100,
    position: [-10.0, 0.8, 14.0],
    rotation: 0,
  },
  {
    id: 'veh_police_03',
    modelName: 'VCPD Interceptor Cruiser',
    vehicleType: 'POLICE',
    color: '#0b1d3a',
    topSpeed: 52.0, // 116 MPH
    acceleration: 36.0,
    handling: 0.9,
    health: 100,
    maxHealth: 100,
    position: [24.0, 0.8, -32.0],
    rotation: -Math.PI / 4,
  },
  // Highway Overlook Vehicle
  {
    id: 'veh_highway_muscle',
    modelName: 'Phoenix 454 V8',
    vehicleType: 'MUSCLE',
    color: '#f97316', // Sunset Orange
    topSpeed: 52.0,
    acceleration: 40.0,
    handling: 0.88,
    health: 100,
    maxHealth: 100,
    position: [14.0, 0.8, -260.0],
    rotation: -Math.PI / 2,
  },
  // City 2 (Vice Bay Financial District) Vehicles
  {
    id: 'veh_city2_supercar',
    modelName: 'Cheetah GTS Carbon',
    vehicleType: 'SPORTS',
    color: '#18181b', // Onyx Black
    topSpeed: 62.0, // 138 MPH
    acceleration: 48.0,
    handling: 0.98,
    health: 100,
    maxHealth: 100,
    position: [6.0, 0.8, -480.0],
    rotation: Math.PI,
  },
  {
    id: 'veh_city2_police',
    modelName: 'VCPD Highway Pursuit',
    vehicleType: 'POLICE',
    color: '#0f172a',
    topSpeed: 55.0,
    acceleration: 40.0,
    handling: 0.92,
    health: 100,
    maxHealth: 100,
    position: [-14.0, 0.8, -540.0],
    rotation: 0,
  },
];

export function VehicleManager() {
  const [vehicles, setVehicles] = useState<VehicleData[]>(DEFAULT_VEHICLES);

  useEffect(() => {
    // Optionally fetch dynamic vehicles from API
    fetch('/api/vehicles')
      .then((res) => res.json())
      .then((data) => {
        if (data?.vehicles && data.vehicles.length > 0) {
          const mapped = data.vehicles.map((v: any) => ({
            id: v.id,
            modelName: v.modelName,
            vehicleType: v.vehicleType,
            color: v.color,
            topSpeed: v.topSpeed,
            acceleration: v.acceleration,
            handling: v.handling,
            health: v.health,
            maxHealth: 100,
            position: [v.posX, v.posY, v.posZ] as [number, number, number],
            rotation: v.rotY ?? 0,
          }));
          setVehicles(mapped);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <group>
      {vehicles.map((v) => (
        <VehicleController key={v.id} vehicle={v} />
      ))}
    </group>
  );
}
