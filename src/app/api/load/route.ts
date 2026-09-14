import { NextRequest, NextResponse } from 'next/server';
import { prisma, memoryStore } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slotParam = searchParams.get('slot');

  try {
    if (slotParam) {
      const slotNumber = parseInt(slotParam, 10);
      const save = memoryStore.saves.find((s) => s.slotNumber === slotNumber);
      if (!save) {
        return NextResponse.json({ success: false, message: 'Slot not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, save });
    }

    // Return all save slots
    return NextResponse.json({
      success: true,
      saves: memoryStore.saves,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
