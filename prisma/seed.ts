import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Vice District 3D database...');

  // Create starting player
  const player = await prisma.player.upsert({
    where: { username: 'Viper' },
    update: {},
    create: {
      username: 'Viper',
      health: 100,
      armor: 50,
      cash: 5000,
      wantedLevel: 0,
      posX: 0,
      posY: 1.5,
      posZ: 0,
      stats: {
        create: {
          distanceTraveled: 0,
          missionsCompleted: 0,
          vehiclesHijacked: 0,
          copsEvaded: 0,
          shotsFired: 0,
          timePlayedSeconds: 0,
        },
      },
      inventory: {
        create: [
          { name: 'Baseball Bat', category: 'MELEE', ammo: 1, maxAmmo: 1, isEquipped: false },
          { name: 'Pistol .45', category: 'PISTOL', ammo: 48, maxAmmo: 150, isEquipped: true },
          { name: 'Micro SMG', category: 'SMG', ammo: 90, maxAmmo: 300, isEquipped: false },
        ],
      },
    },
  });

  // Seed vehicles
  const vehicles = [
    {
      modelName: 'Banshee GT',
      vehicleType: 'SPORTS',
      color: '#00e5ff',
      topSpeed: 46.0,
      acceleration: 30.0,
      handling: 0.88,
      health: 100,
      posX: 14.0,
      posY: 0.8,
      posZ: 16.0,
      rotY: 0,
    },
    {
      modelName: 'Stallion V8',
      vehicleType: 'MUSCLE',
      color: '#ff2a5f',
      topSpeed: 40.0,
      acceleration: 34.0,
      handling: 0.75,
      health: 100,
      posX: -24.0,
      posY: 0.8,
      posZ: 20.0,
      rotY: Math.PI / 2,
    },
    {
      modelName: 'VCPD Interceptor',
      vehicleType: 'POLICE',
      color: '#0b1d3a',
      topSpeed: 44.0,
      acceleration: 28.0,
      handling: 0.82,
      health: 100,
      posX: 32.0,
      posY: 0.8,
      posZ: -28.0,
      rotY: -Math.PI / 4,
    },
  ];

  for (const v of vehicles) {
    await prisma.vehicle.create({ data: v });
  }

  // Seed Missions
  const missions = [
    {
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
    },
    {
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
    },
    {
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
    },
  ];

  for (const m of missions) {
    await prisma.mission.upsert({
      where: { code: m.code },
      update: {},
      create: m,
    });
  }

  console.log(`Database seeded successfully for player ${player.username}!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
