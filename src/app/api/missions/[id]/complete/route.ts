import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/prisma';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mission = memoryStore.missions.find((m) => m.id === id);

    if (!mission) {
      return NextResponse.json({ success: false, message: 'Mission not found' }, { status: 404 });
    }

    mission.status = 'COMPLETED';
    memoryStore.player.cash += mission.rewardCash;
    memoryStore.player.stats.missionsCompleted += 1;
    // Clearing heat if completing mission
    memoryStore.player.wantedLevel = 0;

    return NextResponse.json({
      success: true,
      message: `MISSION PASSED: ${mission.title}`,
      rewardCash: mission.rewardCash,
      newCashBalance: memoryStore.player.cash,
      mission,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
