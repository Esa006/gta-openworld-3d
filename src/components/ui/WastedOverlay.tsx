'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';

export function WastedOverlay() {
  const isWasted = useGameStore((s) => s.isWasted);
  const isBusted = useGameStore((s) => s.isBusted);
  const respawnPlayer = useGameStore((s) => s.respawnPlayer);

  if (!isWasted && !isBusted) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-red-950/40 backdrop-grayscale select-none animate-in fade-in duration-700">
      <div className="text-center px-4">
        <h1 className="text-7xl md:text-9xl font-black tracking-widest text-red-600 drop-shadow-[0_0_35px_rgba(220,38,38,0.9)] animate-pulse">
          {isWasted ? 'WASTED' : 'BUSTED'}
        </h1>
        <p className="mt-4 text-slate-300 text-sm md:text-base font-semibold tracking-wider">
          {isWasted ? 'You collapsed on the streets of Vice District.' : 'The police took you into custody.'}
        </p>

        <button
          onClick={respawnPlayer}
          className="mt-8 px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-sm tracking-widest uppercase rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.6)] transition cursor-pointer transform hover:scale-105 active:scale-95"
        >
          Respawn at Hospital ($500)
        </button>
      </div>
    </div>
  );
}
