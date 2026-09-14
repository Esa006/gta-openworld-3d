'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export function ControlsGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const playerMode = useGameStore((s) => s.playerMode);

  return (
    <div className="pointer-events-auto absolute bottom-6 left-44 z-30 font-mono text-xs select-none">
      {isOpen ? (
        <div className="bg-black/85 backdrop-blur-md border border-slate-700/80 p-3.5 rounded-xl shadow-xl text-slate-300 w-72 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
            <span className="font-bold text-amber-400 uppercase tracking-wider">
              {playerMode === 'DRIVING' ? 'Vehicle Controls' : 'On-Foot Controls'}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {playerMode === 'DRIVING' ? (
            <div className="grid grid-cols-2 gap-y-1 text-[11px]">
              <span className="text-slate-400">[W / ↑]</span>
              <span className="text-white font-semibold">Smooth Gas (135+ MPH)</span>
              <span className="text-slate-400">[S / ↓]</span>
              <span className="text-white font-semibold">Brake (Hold: Rev)</span>
              <span className="text-slate-400">[A / D]</span>
              <span className="text-white font-semibold">Steer Wheels</span>
              <span className="text-slate-400">[SPACE]</span>
              <span className="text-cyan-400 font-semibold">Handbrake Drift</span>
              <span className="text-slate-400">[F / E / ↵]</span>
              <span className="text-amber-400 font-semibold">Exit Vehicle</span>
              <span className="text-slate-400">[T]</span>
              <span className="text-amber-300 font-semibold">Day / Night Cycle</span>
              <span className="text-slate-400">[H]</span>
              <span className="text-white font-semibold">Honk Horn</span>
              <span className="text-slate-400">[R]</span>
              <span className="text-pink-400 font-semibold">Change Radio</span>
              <span className="text-slate-400">[P]</span>
              <span className="text-indigo-400 font-semibold">Open Phone</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-y-1 text-[11px]">
              <span className="text-slate-400">[W, A, S, D]</span>
              <span className="text-white font-semibold">Move / Run</span>
              <span className="text-slate-400">[SHIFT]</span>
              <span className="text-cyan-400 font-semibold">Sprint</span>
              <span className="text-slate-400">[SPACE]</span>
              <span className="text-white font-semibold">Jump</span>
              <span className="text-slate-400">[F / E / ↵]</span>
              <span className="text-amber-400 font-semibold">Jack / Drive Car</span>
              <span className="text-slate-400">[T]</span>
              <span className="text-amber-300 font-semibold">Day / Night Cycle</span>
              <span className="text-slate-400">[CLICK / J]</span>
              <span className="text-rose-400 font-semibold">Attack / Shoot</span>
              <span className="text-slate-400">[P]</span>
              <span className="text-indigo-400 font-semibold">Open Phone</span>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 bg-black/70 hover:bg-black/90 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 transition shadow-md cursor-pointer text-[11px] font-bold"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Controls</span>
          <ChevronUp className="w-3 h-3 text-slate-400" />
        </button>
      )}
    </div>
  );
}
