'use client';

import React from 'react';
import * as THREE from 'three';
import { VehicleData } from '@/types/gta';
import { RealCarModel } from './RealCarModel';

interface VehicleModelProps {
  vehicle: VehicleData;
  steerAngle: number;
  doorOpenAngle?: number;
  sirenTick?: number;
  headlightsOn?: boolean;
  frontLeftWheelRef?: React.RefObject<THREE.Group | null>;
  frontRightWheelRef?: React.RefObject<THREE.Group | null>;
}

export function VehicleModel({
  vehicle,
  steerAngle,
  doorOpenAngle = 0,
  sirenTick = 0,
  headlightsOn = true,
  frontLeftWheelRef,
  frontRightWheelRef,
}: VehicleModelProps) {
  // --- 1. MOTORCYCLE MODEL (Sanchez 500 Sport) ---
  if (vehicle.vehicleType === 'MOTO') {
    return (
      <group>
        {/* Moto Frame & Fuel Tank */}
        <mesh castShadow position={[0, 0.55, 0]}>
          <boxGeometry args={[0.38, 0.45, 1.4]} />
          <meshStandardMaterial color={vehicle.color} metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Seat (Black Leather) */}
        <mesh position={[0, 0.72, 0.15]}>
          <boxGeometry args={[0.3, 0.12, 0.65]} />
          <meshStandardMaterial color="#18181b" roughness={0.8} />
        </mesh>

        {/* Front Fork & Handlebars */}
        <group position={[0, 0.75, -0.6]} rotation={[0, steerAngle * 0.8, 0]}>
          {/* Handlebar Bar */}
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[0.85, 0.05, 0.05]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
          {/* Headlight */}
          <mesh position={[0, 0.08, -0.15]}>
            <boxGeometry args={[0.22, 0.18, 0.12]} />
            <meshStandardMaterial color="#ffffff" emissive="#fef08a" emissiveIntensity={headlightsOn ? 0.9 : 0} />
          </mesh>
          {headlightsOn && <spotLight position={[0, 0.1, -0.3]} angle={0.6} intensity={25} distance={30} color="#fffbeb" />}
        </group>

        {/* Dual Chrome Exhaust Pipes */}
        <mesh position={[0.22, 0.35, 0.3]} rotation={[0.1, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.8, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Front Wheel */}
        <group ref={frontLeftWheelRef} position={[0, 0.35, -0.9]} rotation={[0, steerAngle, 0]}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.35, 0.35, 0.16, 16]} />
            <meshStandardMaterial color="#18181b" roughness={0.9} />
          </mesh>
        </group>

        {/* Rear Wheel */}
        <group position={[0, 0.35, 0.85]}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.36, 0.36, 0.2, 16]} />
            <meshStandardMaterial color="#18181b" roughness={0.9} />
          </mesh>
        </group>
      </group>
    );
  }

  // --- 2. REAL CAR MODEL (Sports, Muscle, Police) ---
  return (
    <RealCarModel
      color={vehicle.color}
      steerAngle={steerAngle}
      isPolice={vehicle.vehicleType === 'POLICE'}
      sirenTick={sirenTick}
      headlightsOn={headlightsOn}
    />
  );
}
