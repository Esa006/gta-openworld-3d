'use client';

import * as THREE from 'three';
import { soundFx } from '@/lib/soundEffects';

export interface EjectedDriver {
  id: string;
  pos: [number, number, number];
  heading: number;
}

// Global listener for ejected drivers
type DriverEjectCallback = (driver: EjectedDriver) => void;
const ejectListeners: Set<DriverEjectCallback> = new Set();

export function subscribeDriverEjection(cb: DriverEjectCallback) {
  ejectListeners.add(cb);
  return () => {
    ejectListeners.delete(cb);
  };
}

/**
 * Checks whether the player is near the vehicle's driver-side door (left side)
 */
export function isNearDriverDoor(
  playerPos: [number, number, number],
  carPos: { x: number; y: number; z: number },
  carHeading: number,
  maxDoorDist = 2.4
): boolean {
  // Driver door is located on the left side of the vehicle
  const doorOffsetX = -Math.cos(carHeading) * 1.35;
  const doorOffsetZ = Math.sin(carHeading) * 1.35;

  const doorX = carPos.x + doorOffsetX;
  const doorZ = carPos.z + doorOffsetZ;

  const distToDoor = Math.hypot(playerPos[0] - doorX, playerPos[2] - doorZ);
  return distToDoor <= maxDoorDist;
}

/**
 * Executes authentic GTA carjacking sequence:
 * 1. Door latch mechanical click
 * 2. If driver present: eject driver onto pavement outside driver door
 * 3. Seat player in driver seat
 * 4. Heavy door bass slam
 * 5. Engine start / rev
 */
export function executeCarjack(
  vehicleId: string,
  vehicleName: string,
  carPos: { x: number; y: number; z: number },
  carHeading: number,
  hasNpcDriver: boolean,
  onComplete: () => void
) {
  // Step 1: Mechanical door open latch sound
  soundFx.playCarDoor();

  if (hasNpcDriver) {
    // Step 2: Driver ejection outside the left door
    const ejectX = carPos.x - Math.cos(carHeading) * 2.1;
    const ejectZ = carPos.z + Math.sin(carHeading) * 2.1;

    const ejected: EjectedDriver = {
      id: `ejected_${Date.now()}`,
      pos: [ejectX, 0.2, ejectZ],
      heading: carHeading + Math.PI / 2,
    };

    ejectListeners.forEach((cb) => cb(ejected));

    // Brief delay simulating pulling driver out
    setTimeout(() => {
      soundFx.playCarDoor(); // Slam shut
      onComplete();
    }, 280);
  } else {
    // Unoccupied vehicle: directly enter
    setTimeout(() => {
      soundFx.playCarDoor(); // Slam shut
      onComplete();
    }, 120);
  }
}
