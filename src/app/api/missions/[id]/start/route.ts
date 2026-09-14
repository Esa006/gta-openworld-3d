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

    mission.status = 'ACTIVE';

    return NextResponse.json({
      success: true,
      message: `Mission "${mission.title}" started!`,
      mission,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
