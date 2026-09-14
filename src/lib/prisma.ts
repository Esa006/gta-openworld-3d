import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let clientInstance: PrismaClient | null = null;

function getPrismaClient(): PrismaClient | null {
  if (clientInstance) return clientInstance;
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = client;
    }
    clientInstance = client;
    return client;
  } catch (err) {
    console.warn('[Prisma] Database client unavailable, using memoryStore fallback:', err);
    return null;
  }
}

// Resilient Proxy that prevents crashes during Next.js build-time route collection
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    if (!client) {
      return new Proxy({}, {
        get() {
          return () => Promise.reject(new Error('Prisma database unavailable (in-memory store fallback active)'));
        },
      });
    }
    const val = (client as unknown as Record<string, unknown>)[prop as string];
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  },
});

/**
 * In-memory fallback mock state store
 * Ensures that if PostgreSQL is offline during local sandbox testing,
 * the APIs continue to return live, interactive game data without 500 crashes.
 */
export const memoryStore = {
  player: {
    id: 'player_viper_01',
    username: 'Viper',
    health: 100,
    armor: 50,
    cash: 5000,
    wantedLevel: 0,
    posX: 0,
    posY: 1.0,
    posZ: 0,
    rotY: 0,
    currentVehicleId: null as string | null,
    stats: {
      distanceTraveled: 142.5,
      missionsCompleted: 0,
      vehiclesHijacked: 0,
      copsEvaded: 0,
      shotsFired: 0,
      timePlayedSeconds: 180,
    },
  },
  vehicles: [
    {
      id: 'veh_banshee_01',
      modelName: 'Banshee GT',
      vehicleType: 'SPORTS',
      color: '#00e5ff',
      topSpeed: 46.0,
      acceleration: 30.0,
      handling: 0.88,
      health: 100,
      posX: 12.0,
      posY: 1.0,
      posZ: 14.0,
      rotY: 0,
      isPlayerOwned: false,
    },
    {
      id: 'veh_stallion_02',
      modelName: 'Stallion V8',
      vehicleType: 'MUSCLE',
      color: '#ff2a5f',
      topSpeed: 40.0,
      acceleration: 34.0,
      handling: 0.75,
      health: 100,
      posX: -24.0,
      posY: 1.0,
      posZ: 18.0,
      rotY: Math.PI / 2,
      isPlayerOwned: false,
    },
    {
      id: 'veh_police_03',
      modelName: 'VCPD Interceptor',
      vehicleType: 'POLICE',
      color: '#0b1d3a',
      topSpeed: 44.0,
      acceleration: 28.0,
      handling: 0.82,
      health: 100,
      posX: 32.0,
      posY: 1.0,
      posZ: -28.0,
      rotY: -Math.PI / 4,
      isPlayerOwned: false,
    },
    {
      id: 'veh_sanchez_04',
      modelName: 'Sanchez 500 Dirt Bike',
      vehicleType: 'MOTO',
      color: '#ffaa00',
      topSpeed: 38.0,
      acceleration: 36.0,
      handling: 0.95,
      health: 90,
      posX: -15.0,
      posY: 1.0,
      posZ: -35.0,
      rotY: Math.PI,
      isPlayerOwned: true,
    },
  ],
  missions: [
    {
      id: 'mis_01',
      code: 'THE_GETAWAY',
      title: 'The Getaway',
      client: 'Don Salvatore',
      description: 'The heat is coming down! Grab a fast vehicle and reach the Downtown Safehouse garage before the timer runs out.',
      rewardCash: 4500,
      rewardXp: 250,
      targetX: -65.0,
      targetY: 1.0,
      targetZ: -65.0,
      targetName: 'Downtown Safehouse',
      status: 'AVAILABLE' as 'AVAILABLE' | 'ACTIVE' | 'COMPLETED',
    },
    {
      id: 'mis_02',
      code: 'HOT_WHEELS',
      title: 'Hot Wheels Express',
      client: 'Ken The Fixer',
      description: 'Locate the neon cyan Banshee GT, commandeer it, and bring it to the Docks Chop Shop in mint condition.',
      rewardCash: 8000,
      rewardXp: 400,
      targetX: 70.0,
      targetY: 1.0,
      targetZ: 50.0,
      targetName: 'East Docks Chop Shop',
      status: 'AVAILABLE' as 'AVAILABLE' | 'ACTIVE' | 'COMPLETED',
    },
    {
      id: 'mis_03',
      code: 'HEAT_EVASION',
      title: 'Outrun The Law',
      client: 'Viper',
      description: 'Evade police pursuit units by maintaining high speed and losing line of sight across the city blocks.',
      rewardCash: 6000,
      rewardXp: 350,
      targetX: 0.0,
      targetY: 1.0,
      targetZ: 80.0,
      targetName: 'Industrial Pay & Spray',
      status: 'AVAILABLE' as 'AVAILABLE' | 'ACTIVE' | 'COMPLETED',
    },
  ],
  inventory: [
    { id: 'inv_01', name: 'Baseball Bat', category: 'MELEE', ammo: 1, maxAmmo: 1, isEquipped: false },
    { id: 'inv_02', name: 'Pistol .45', category: 'PISTOL', ammo: 48, maxAmmo: 150, isEquipped: true },
    { id: 'inv_03', name: 'Micro SMG', category: 'SMG', ammo: 90, maxAmmo: 300, isEquipped: false },
  ],
  locations: [
    { id: 'loc_safehouse', name: 'Downtown Penthouse Safehouse', type: 'SAFEHOUSE', posX: -65, posY: 1, posZ: -65, description: 'Player residence and recovery station' },
    { id: 'loc_chopshop', name: 'East Docks Chop Shop', type: 'GARAGE', posX: 70, posY: 1, posZ: 50, description: 'Vehicle respray and fencing hub' },
    { id: 'loc_hospital', name: 'Central Vice Hospital', type: 'HOSPITAL', posX: -40, posY: 1, posZ: 30, description: 'Emergency medical care respawn' },
    { id: 'loc_police', name: 'VCPD Central Precinct', type: 'MISSION_HUB', posX: 40, posY: 1, posZ: -40, description: 'Law enforcement headquarters' },
  ],
  saves: [
    {
      id: 'save_slot_1',
      slotNumber: 1,
      saveName: 'Story Start - Downtown Vice',
      savedAt: new Date().toISOString(),
      playerData: {
        health: 100,
        armor: 50,
        cash: 5000,
        wantedLevel: 0,
        position: [0, 1.5, 0] as [number, number, number],
        weapon: 'PISTOL' as const,
      },
      missionsCompleted: [] as string[],
    },
  ],
};
