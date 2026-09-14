'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { GTAHud } from '@/components/ui/GTAHud';
import { Speedometer } from '@/components/ui/Speedometer';
import { MissionBanner } from '@/components/ui/MissionBanner';
import { WastedOverlay } from '@/components/ui/WastedOverlay';
import { InGamePhone } from '@/components/ui/InGamePhone';
import { ControlsGuide } from '@/components/ui/ControlsGuide';

// Dynamically import Three.js / R3F Canvas with SSR disabled
const GameCanvas = dynamic(() => import('@/components/canvas/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white font-mono select-none">
      <div className="text-center space-y-4 max-w-md px-6">
        <h1 className="text-4xl md:text-5xl font-black text-amber-400 tracking-widest drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]">
          VICE DISTRICT
        </h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          Initializing 3D Open-World Engine & Rapier Physics...
        </p>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
          <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500 h-full w-2/3 animate-pulse" />
        </div>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden relative bg-slate-950">
      {/* 3D R3F Physics Viewport */}
      <GameCanvas />

      {/* GTA Heads-Up Display */}
      <GTAHud />

      {/* Driving Telemetry Speedometer */}
      <Speedometer />

      {/* Active Mission / Objective Banners */}
      <MissionBanner />

      {/* Player Smartphone Menu & Pause */}
      <InGamePhone />

      {/* Interactive Controls Overlay */}
      <ControlsGuide />

      {/* Wasted / Busted Overlay */}
      <WastedOverlay />
    </main>
  );
}
