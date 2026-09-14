'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Radio, Lightbulb, Wrench } from 'lucide-react';

export function Speedometer() {
  const playerMode = useGameStore((s) => s.playerMode);
  const vehicleSpeed = useGameStore((s) => s.vehicleSpeed);
  const vehicleHealth = useGameStore((s) => s.vehicleHealth);
  const vehicleGear = useGameStore((s) => s.vehicleGear);
  const radioStation = useGameStore((s) => s.radioStation);
  const cycleRadio = useGameStore((s) => s.cycleRadio);
  const headlightsOn = useGameStore((s) => s.headlightsOn);
  const toggleHeadlights = useGameStore((s) => s.toggleHeadlights);

  if (playerMode !== 'DRIVING') return null;

  const currentGear = vehicleGear || (vehicleSpeed === 0 ? 'D' : 'D1');

  return (
    <div className="pointer-events-auto absolute bottom-6 right-6 flex flex-col items-end gap-2 font-mono select-none">
      {/* Radio & Headlights Quick Bar */}
      <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs shadow-lg">
        {/* Automatic transmission badge */}
        <span className="text-[10px] bg-cyan-950 text-cyan-400 font-black px-1.5 py-0.5 rounded border border-cyan-700/50">
          AUTO
        </span>

        {/* Radio Station */}
        <button
          onClick={cycleRadio}
          className="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 font-bold transition cursor-pointer"
          title="Click or press [R] to cycle radio station"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>{radioStation === 'OFF' ? 'RADIO: OFF' : radioStation.replace('_', ' ')}</span>
          <span className="text-[10px] text-slate-500">[R]</span>
        </button>

        <div className="w-px h-3 bg-slate-700 mx-1" />

        {/* Headlights Toggle */}
        <button
          onClick={toggleHeadlights}
          className={`flex items-center gap-1 transition cursor-pointer ${
            headlightsOn ? 'text-amber-400' : 'text-slate-500'
          }`}
          title="Toggle Headlights"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">{headlightsOn ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Main Speedometer Gauge */}
      <div className="flex items-center gap-4 bg-black/80 backdrop-blur-md px-5 py-3 rounded-xl border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.2)]">
        {/* Vehicle Health Bar */}
        <div className="flex flex-col items-center gap-1">
          <Wrench className="w-3.5 h-3.5 text-slate-400" />
          <div className="w-2.5 h-16 bg-slate-800 rounded-full overflow-hidden flex flex-col justify-end p-0.5 border border-slate-700">
            <div
              className={`w-full rounded-full transition-all duration-300 ${
                vehicleHealth > 50 ? 'bg-emerald-500' : vehicleHealth > 25 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ height: `${vehicleHealth}%` }}
            />
          </div>
        </div>

        {/* Automatic Gear Indicator */}
        <div className="flex flex-col items-center justify-center bg-slate-900 border border-slate-700 w-12 h-14 rounded-lg">
          <span className="text-[9px] text-slate-500 font-bold">GEAR</span>
          <span className={`text-xl font-black ${
            currentGear === 'R' ? 'text-rose-400' :
            currentGear === 'P' ? 'text-amber-400' :
            'text-cyan-400'
          }`}>
            {currentGear}
          </span>
        </div>

        {/* Speed Number (MPH) */}
        <div className="flex flex-col items-end">
          <div className="flex items-baseline">
            <span className="text-5xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
              {vehicleSpeed}
            </span>
            <span className="text-xs font-black text-cyan-400 ml-1.5 uppercase">MPH</span>
          </div>
          <div className="text-[10px] text-slate-400 tracking-wider">
            [W] DRIVE • [S] REVERSE • [SPACE] HANDBRAKE • [F] EXIT
          </div>
        </div>
      </div>
    </div>
  );
}
