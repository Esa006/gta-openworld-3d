import { NextResponse } from 'next/server';
import { memoryStore } from '@/lib/prisma';

export async function GET() {
  return NextResponse.json({
    success: true,
    locations: memoryStore.locations,
  });
}
