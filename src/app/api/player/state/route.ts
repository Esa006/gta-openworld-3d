import { NextRequest, NextResponse } from 'next/server';
import { PlayerStateUpdateSchema } from '@/lib/validations';
import { prisma, memoryStore } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parseResult = PlayerStateUpdateSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, errors: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { health, armor, cash, wantedLevel, position, currentVehicleId, eventReason } = parseResult.data;

    // Update in-memory fallback state
    memoryStore.player.health = health;
    memoryStore.player.armor = armor;
    memoryStore.player.cash = cash;
    memoryStore.player.wantedLevel = wantedLevel;
    memoryStore.player.posX = position[0];
    memoryStore.player.posY = position[1];
    memoryStore.player.posZ = position[2];
    memoryStore.player.currentVehicleId = currentVehicleId ?? null;

    // Attempt Prisma update
    try {
      await prisma.player.updateMany({
        data: {
          health,
          armor,
          cash,
          wantedLevel,
          posX: position[0],
          posY: position[1],
          posZ: position[2],
          currentVehicleId: currentVehicleId ?? null,
        },
      });
    } catch {
      // Gracefully silent when DB is pending
    }

    return NextResponse.json({
      success: true,
      message: `State synced (${eventReason || 'CHECKPOINT'})`,
      updated: { health, armor, cash, wantedLevel, position },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to process player state update', error: String(error) },
      { status: 500 }
    );
  }
}
