import { NextResponse } from 'next/server';
import { prisma, memoryStore } from '@/lib/prisma';

export async function GET() {
  try {
    // Attempt database query first
    const player = await prisma.player.findFirst({
      include: {
        stats: true,
        inventory: true,
        ownedVehicles: true,
      },
    });

    if (player) {
      return NextResponse.json({ success: true, player });
    }
  } catch {
    // PostgreSQL connection not active, use memory store fallback
  }

  return NextResponse.json({
    success: true,
    player: memoryStore.player,
    inventory: memoryStore.inventory,
    isFallback: true,
  });
}
