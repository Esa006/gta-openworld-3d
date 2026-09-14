'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import confetti from 'canvas-confetti';

export function MissionBanner() {
  const bannerMessage = useGameStore((s) => s.bannerMessage);
  const clearBanner = useGameStore((s) => s.clearBanner);

  useEffect(() => {
    if (bannerMessage?.type === 'PASSED') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#06b6d4'],
      });
    }

    if (bannerMessage) {
      const timer = setTimeout(() => {
        clearBanner();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [bannerMessage, clearBanner]);

  if (!bannerMessage) return null;

  const isPassed = bannerMessage.type === 'PASSED';
  const isFailed = bannerMessage.type === 'FAILED';

  return (
    <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 z-40 max-w-xl w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div
        className={`px-6 py-4 rounded-xl backdrop-blur-md border text-center shadow-2xl ${
          isPassed
            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
            : isFailed
            ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.4)]'
            : 'bg-black/85 border-amber-500/60 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
        }`}
      >
        <h2 className="text-2xl font-black tracking-widest uppercase mb-1 drop-shadow-md">
          {bannerMessage.title}
        </h2>
        <p className="text-xs md:text-sm font-semibold tracking-wide text-slate-200">
          {bannerMessage.subtitle}
        </p>
      </div>
    </div>
  );
}
