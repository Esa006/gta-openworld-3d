import { NextRequest, NextResponse } from 'next/server';
import { InventoryActionSchema } from '@/lib/validations';
import { memoryStore } from '@/lib/prisma';

export async function GET() {
  return NextResponse.json({
    success: true,
    inventory: memoryStore.inventory,
  });
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parseResult = InventoryActionSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json({ success: false, errors: parseResult.error.format() }, { status: 400 });
    }

    const { weaponId, action, cost } = parseResult.data;

    const item = memoryStore.inventory.find((i) => i.id === weaponId);
    if (!item) {
      return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
    }

    if (action === 'EQUIP') {
      memoryStore.inventory.forEach((i) => {
        i.isEquipped = i.id === weaponId;
      });
    } else if (action === 'BUY_AMMO') {
      const charge = cost ?? 350;
      if (memoryStore.player.cash >= charge) {
        memoryStore.player.cash -= charge;
        item.ammo = Math.min(item.ammo + 50, item.maxAmmo);
      } else {
        return NextResponse.json({ success: false, message: 'Insufficient cash' }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      action,
      item,
      playerCash: memoryStore.player.cash,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
