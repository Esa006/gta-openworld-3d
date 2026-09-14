export interface RegisteredVehicle {
  id: string;
  name: string;
  type: string;
  pos: { x: number; y: number; z: number };
  heading: number;
}

export const activeVehiclesMap = new Map<string, RegisteredVehicle>();

export function registerVehicle(vehicle: RegisteredVehicle) {
  activeVehiclesMap.set(vehicle.id, vehicle);
}

export function unregisterVehicle(id: string) {
  activeVehiclesMap.delete(id);
}

export function findNearestVehicle(
  px: number,
  pz: number,
  maxDist = 5.0
): { vehicle: RegisteredVehicle; distance: number } | null {
  let nearest: RegisteredVehicle | null = null;
  let minDist = maxDist;

  for (const v of activeVehiclesMap.values()) {
    const dist = Math.hypot(v.pos.x - px, v.pos.z - pz);
    if (dist < minDist) {
      minDist = dist;
      nearest = v;
    }
  }

  if (!nearest) return null;
  return { vehicle: nearest, distance: minDist };
}
