import { NextRequest, NextResponse } from 'next/server';
import { VehicleActionSchema } from '@/lib/validations';
import { prisma, memoryStore } from '@/lib/prisma';

export async function GET() {
  try {
    const dbVehicles = await prisma.vehicle.findMany();
    if (dbVehicles && dbVehicles.length > 0) {
      return NextResponse.json({ success: true, vehicles: dbVehicles });
    }
  } catch {
    // fallback
  }

  return NextResponse.json({
    success: true,
    vehicles: memoryStore.vehicles,
    isFallback: true,
  });
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parseResult = VehicleActionSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json({ success: false, errors: parseResult.error.format() }, { status: 400 });
    }

    const { vehicleId, action, health, position } = parseResult.data;

    // Update in-memory state
    const vehicle = memoryStore.vehicles.find((v) => v.id === vehicleId);
    if (vehicle) {
      if (health !== undefined) vehicle.health = health;
      if (position) {
        vehicle.posX = position[0];
        vehicle.posY = position[1];
        vehicle.posZ = position[2];
      }
      if (action === 'HIJACK') {
        memoryStore.player.stats.vehiclesHijacked += 1;
        // Hijacking can trigger a 1-star wanted level if cops nearby
        if (memoryStore.player.wantedLevel === 0) {
          memoryStore.player.wantedLevel = 1;
        }
      }
    }

    return NextResponse.json({
      success: true,
      action,
      vehicleId,
      wantedLevel: memoryStore.player.wantedLevel,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
