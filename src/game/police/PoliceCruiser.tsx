'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VehicleModel } from '../vehicles/VehicleModel';

interface PoliceCruiserProps {
  position: [number, number, number];
  rotation: number;
  sirenActive: boolean;
  speed: number;
}

export function PoliceCruiser({ position, rotation, sirenActive, speed }: PoliceCruiserProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [sirenTick, setSirenTick] = React.useState(0);

  useFrame((state) => {
    if (sirenActive) {
      setSirenTick(state.clock.getElapsedTime());
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
      {/* Detailed VCPD Cruiser Model */}
      <VehicleModel
        vehicle={{
          id: 'vcpd_pursuit',
          modelName: 'VCPD Interceptor',
          vehicleType: 'POLICE',
          color: '#0b1d3a',
          topSpeed: 45.0,
          acceleration: 30.0,
          handling: 0.85,
          health: 100,
          maxHealth: 100,
          position: [0, 0, 0],
          rotation: 0,
        }}
        steerAngle={0}
        sirenTick={sirenTick}
        headlightsOn={true}
      />

      {/* Dynamic Strobe Light Flashes when siren active */}
      {sirenActive && (
        <group position={[0, 1.4, -0.2]}>
          <pointLight
            color={Math.floor(sirenTick * 10) % 2 === 0 ? '#ef4444' : '#3b82f6'}
            intensity={4.5}
            distance={18}
            decay={2}
          />
        </group>
      )}
    </group>
  );
}
