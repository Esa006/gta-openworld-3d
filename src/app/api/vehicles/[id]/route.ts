import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const vehicle = memoryStore.vehicles.find((v) => v.id === id);
    if (!vehicle) {
      return NextResponse.json({ success: false, message: 'Vehicle not found' }, { status: 404 });
    }

    if (body.health !== undefined) vehicle.health = body.health;
    if (body.posX !== undefined) vehicle.posX = body.posX;
    if (body.posY !== undefined) vehicle.posY = body.posY;
    if (body.posZ !== undefined) vehicle.posZ = body.posZ;
    if (body.rotY !== undefined) vehicle.rotY = body.rotY;

    return NextResponse.json({ success: true, vehicle });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
