'use client';

import { soundFx } from '@/lib/soundEffects';
import { useGameStore } from '@/store/useGameStore';

export function usePlayerCombat() {
  const equippedWeapon = useGameStore((s) => s.equippedWeapon);
  const fireWeapon = useGameStore((s) => s.fireWeapon);
  const wantedLevel = useGameStore((s) => s.wantedLevel);
  const setWantedLevel = useGameStore((s) => s.setWantedLevel);

  const triggerAttack = (onMuzzleFlash?: (active: boolean) => void): boolean => {
    const success = fireWeapon();
    if (!success) return false;

    if (equippedWeapon === 'PISTOL' || equippedWeapon === 'MICRO_SMG') {
      soundFx.playGunshot();
      onMuzzleFlash?.(true);
      setTimeout(() => onMuzzleFlash?.(false), 65);

      // Firing weapon in public attracts police attention
      if (wantedLevel === 0 && Math.random() < 0.25) {
        setWantedLevel(1);
      }
    }

    return true;
  };

  return {
    triggerAttack,
    equippedWeapon,
  };
}
