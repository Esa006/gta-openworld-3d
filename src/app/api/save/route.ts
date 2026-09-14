import { NextRequest, NextResponse } from 'next/server';
import { SaveGameSchema } from '@/lib/validations';
import { prisma, memoryStore } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parseResult = SaveGameSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json({ success: false, errors: parseResult.error.format() }, { status: 400 });
    }

    const { slotNumber, saveName, worldData } = parseResult.data;

    // Check existing slot in memory
    const existingIndex = memoryStore.saves.findIndex((s) => s.slotNumber === slotNumber);
    const newSave = {
      id: `save_slot_${slotNumber}_${Date.now()}`,
      slotNumber,
      saveName,
      savedAt: new Date().toISOString(),
      playerData: {
        health: memoryStore.player.health,
        armor: memoryStore.player.armor,
        cash: memoryStore.player.cash,
        wantedLevel: memoryStore.player.wantedLevel,
        position: [memoryStore.player.posX, memoryStore.player.posY, memoryStore.player.posZ] as [number, number, number],
        weapon: 'PISTOL' as const,
      },
      missionsCompleted: memoryStore.missions.filter((m) => m.status === 'COMPLETED').map((m) => m.id),
    };

    if (existingIndex >= 0) {
      memoryStore.saves[existingIndex] = newSave;
    } else {
      memoryStore.saves.push(newSave);
    }

    // Attempt Prisma insert
    try {
      await prisma.gameSave.create({
        data: {
          playerId: memoryStore.player.id,
          slotNumber,
          saveName,
          worldData: JSON.stringify(worldData),
        },
      });
    } catch {
      // Prisma fallback
    }

    return NextResponse.json({
      success: true,
      message: `Game saved successfully to Slot ${slotNumber}`,
      save: newSave,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
