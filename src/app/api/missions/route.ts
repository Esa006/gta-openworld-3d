import { NextResponse } from 'next/server';
import { prisma, memoryStore } from '@/lib/prisma';

export async function GET() {
  try {
    const dbMissions = await prisma.mission.findMany({
      include: {
        progress: true,
      },
    });
    if (dbMissions && dbMissions.length > 0) {
      return NextResponse.json({ success: true, missions: dbMissions });
    }
  } catch {
    // fallback
  }

  return NextResponse.json({
    success: true,
    missions: memoryStore.missions,
    isFallback: true,
  });
}
