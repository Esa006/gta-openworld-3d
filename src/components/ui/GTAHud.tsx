'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useWorldStore } from '@/stores/useWorldStore';
import { Crosshair, Smartphone, Volume2, VolumeX, Shield, Heart, User, Sun } from 'lucide-react';

export function GTAHud() {
  const health = useGameStore((s) => s.health);
  const armor = useGameStore((s) => s.armor);
  const cash = useGameStore((s) => s.cash);
  const wantedLevel = useGameStore((s) => s.wantedLevel);
  const equippedWeapon = useGameStore((s) => s.equippedWeapon);
  const ammo = useGameStore((s) => s.ammo);
  const position = useGameStore((s) => s.position);
  const rotation = useGameStore((s) => s.rotation);
  const playerMode = useGameStore((s) => s.playerMode);
  const nearbyVehicleId = useGameStore((s) => s.nearbyVehicleId);
  const nearbyVehicleName = useGameStore((s) => s.nearbyVehicleName);
  const activeMission = useGameStore((s) => s.activeMission);
  const togglePhone = useGameStore((s) => s.togglePhone);
  const isMuted = useGameStore((s) => s.isMuted);
  const toggleMute = useGameStore((s) => s.toggleMute);
  const playerSkin = useGameStore((s) => s.playerSkin);
  const togglePlayerSkin = useGameStore((s) => s.togglePlayerSkin);

  const timeOfDay = useWorldStore((s) => s.timeOfDay);
  const cycleTimePreset = useWorldStore((s) => s.cycleTimePreset);

  // Global [T] key listener for instant day / night cycling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key?.toLowerCase();
      if (e.code === 'KeyT' || k === 't') {
        cycleTimePreset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cycleTimePreset]);

  const timePeriodLabel =
    timeOfDay >= 5.5 && timeOfDay < 10.5
      ? '🌅 MORNING'
      : timeOfDay >= 10.5 && timeOfDay < 16.5
      ? '☀️ NOON'
      : timeOfDay >= 16.5 && timeOfDay < 20.0
      ? '🌇 SUNSET'
      : '🌙 NIGHT';

  const districtName =
    position[2] > -140
      ? 'OCEAN DRIVE • VICE BEACH'
      : position[2] >= -400
      ? 'OCEAN CAUSEWAY EXPRESSWAY'
      : 'FINANCIAL DISTRICT • VICE BAY';

  // Minimap coordinates normalized to radar circle (radius = 58px)
  const radarScale = 0.85;
  const radarRadius = 58;

  // Active mission beacon position relative to player
  const targetX = activeMission ? (activeMission.targetPosition ? activeMission.targetPosition[0] : activeMission.targetX ?? -65) : 0;
  const targetZ = activeMission ? (activeMission.targetPosition ? activeMission.targetPosition[2] : activeMission.targetZ ?? -65) : 0;
  
  const relX = (targetX - position[0]) * radarScale;
  const relZ = (targetZ - position[2]) * radarScale;
  const targetDist = Math.hypot(relX, relZ);
  const clampedDist = Math.min(targetDist, radarRadius - 6);
  const angleToTarget = Math.atan2(relZ, relX);
  const beaconRadarX = 64 + Math.cos(angleToTarget) * clampedDist;
  const beaconRadarY = 64 + Math.sin(angleToTarget) * clampedDist;

  // Format cash GTA style: $5,000
  const formattedCash = `$${Math.max(0, cash).toLocaleString()}`;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden font-sans select-none">
      {/* ================= TOP RIGHT: GTA VI MINIMALIST WEAPON, CASH & WANTED ================= */}
      <div className="pointer-events-auto absolute top-5 right-7 flex flex-col items-end gap-2.5 drop-shadow-md">
        {/* GTA VI Translucent 5-Star Wanted Rating (matches reference screenshot) */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
          {[1, 2, 3, 4, 5].map((star) => {
            const isStarActive = star <= wantedLevel;
            return (
              <span
                key={star}
                className={`text-xl transition-all ${
                  isStarActive
                    ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)] animate-pulse font-black'
                    : 'text-white/30 font-normal'
                }`}
              >
                ★
              </span>
            );
          })}
        </div>

        {/* Modern GTA Cash Counter */}
        <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-emerald-500/30 text-emerald-400 font-mono font-extrabold text-2xl tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <span>{formattedCash}</span>
        </div>

        {/* Modern Weapon / Ammo Card */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white font-mono text-xs">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <span className="font-bold uppercase tracking-wider text-slate-200">
            {equippedWeapon.replace('_', ' ')}
          </span>
          <span className="text-amber-400 font-extrabold text-sm ml-1">
            {equippedWeapon === 'FISTS' ? '∞' : `${ammo[equippedWeapon] ?? 0} / 150`}
          </span>
        </div>
      </div>

      {/* ================= TOP LEFT: QUICK UTILITY CONTROLS ================= */}
      <div className="pointer-events-auto absolute top-5 left-6 flex items-center gap-2">
        <button
          onClick={togglePhone}
          className="flex items-center gap-2 bg-black/60 hover:bg-black/85 text-white px-3 py-1.5 rounded-lg border border-white/15 text-xs font-bold transition shadow-md cursor-pointer backdrop-blur-md"
        >
          <Smartphone className="w-4 h-4 text-pink-400" />
          <span className="font-mono text-[11px] tracking-wider">PHONE [P]</span>
        </button>

        <button
          onClick={togglePlayerSkin}
          className="flex items-center gap-1.5 bg-black/60 hover:bg-black/85 text-white px-3 py-1.5 rounded-lg border border-white/15 text-xs font-bold transition shadow-md cursor-pointer backdrop-blur-md"
          title="Switch Character Skin (Real Human Face / Soldier)"
        >
          <User className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-[11px] tracking-wider">
            {playerSkin === 'CIVILIAN' ? 'SKIN: REAL MAN' : 'SKIN: SOLDIER'}
          </span>
        </button>

        <button
          onClick={cycleTimePreset}
          className="flex items-center gap-1.5 bg-black/60 hover:bg-black/85 text-white px-3 py-1.5 rounded-lg border border-white/15 text-xs font-bold transition shadow-md cursor-pointer backdrop-blur-md"
          title="Cycle Day/Night Time (Morning, Noon, Sunset, Night) [T]"
        >
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-[11px] tracking-wider">
            {timePeriodLabel} [T]
          </span>
        </button>

        <button
          onClick={toggleMute}
          className="bg-black/60 hover:bg-black/85 text-white p-2 rounded-lg border border-white/15 transition shadow-md cursor-pointer backdrop-blur-md"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {/* ================= CENTER / PROXIMITY PROMPT: GTA VI INTERACTION BADGE ================= */}
      {playerMode === 'FOOT' && nearbyVehicleId && (
        <div className="pointer-events-none absolute bottom-32 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-lg border border-amber-500/70 text-white px-6 py-2.5 rounded-full font-bold text-xs shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center gap-3 animate-bounce">
          <span className="text-amber-400 font-extrabold uppercase tracking-widest text-[11px]">
            {nearbyVehicleName || 'Vehicle'}
          </span>
          <span className="text-white/60">•</span>
          <span className="text-white/80 font-mono">PRESS</span>
          <span className="bg-amber-400 text-black px-2 py-0.5 rounded font-black text-xs shadow-md">F</span>
          <span className="text-white/80 font-mono">TO JACK</span>
        </div>
      )}

      {/* ================= BOTTOM LEFT: GTA V / VI STYLE RADAR & HEALTH/ARMOR BARS ================= */}
      <div className="pointer-events-auto absolute bottom-6 left-6 flex flex-col gap-1.5 select-none">
        {/* Radar Circular / Rectangular Frame */}
        <div className="relative w-36 h-36 rounded-2xl border-2 border-white/20 bg-slate-950/85 backdrop-blur-md shadow-[0_0_25px_rgba(0,0,0,0.9)] overflow-hidden">
          {/* Radar Grid Overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="w-full h-0.5 bg-cyan-400 absolute top-1/2 -translate-y-1/2" />
            <div className="h-full w-0.5 bg-cyan-400 absolute left-1/2 -translate-x-1/2" />
            <div className="w-24 h-24 rounded-full border border-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>

          {/* City Street Lines on Radar (Rotates with Player Heading) */}
          <div
            className="absolute inset-0 pointer-events-none transition-transform duration-75"
            style={{
              transform: `rotate(${-rotation}rad)`,
              transformOrigin: '72px 72px',
            }}
          >
            {/* North-South Avenue */}
            <div
              className="absolute bg-slate-400/50 h-36 w-2"
              style={{ left: `${72 - position[0] * radarScale}px`, top: 0 }}
            />
            {/* East-West Avenue */}
            <div
              className="absolute bg-slate-400/50 w-36 h-2"
              style={{ top: `${72 - position[2] * radarScale}px`, left: 0 }}
            />
          </div>

          {/* Active Mission Objective Marker */}
          {activeMission && (
            <div
              className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full bg-amber-400 border-2 border-white shadow-[0_0_10px_#f59e0b] animate-ping"
              style={{ left: `${beaconRadarX + 8}px`, top: `${beaconRadarY + 8}px` }}
            />
          )}
          {activeMission && (
            <div
              className="absolute w-3.5 h-3.5 -ml-1.5 -mt-1.5 rounded-full bg-amber-500 border border-white"
              style={{ left: `${beaconRadarX + 8}px`, top: `${beaconRadarY + 8}px` }}
            />
          )}

          {/* Player Direction Arrow */}
          <div
            className="absolute top-1/2 left-1/2 w-0 h-0 -translate-x-1/2 -translate-y-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-cyan-400 filter drop-shadow-[0_0_6px_#00e5ff]"
            style={{ transform: `translate(-50%, -50%) rotate(${rotation}rad)` }}
          />

          {/* North Compass Heading Indicator */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[10px] font-black text-rose-500 tracking-wider">
            N
          </div>
        </div>

        {/* Dual Health (Green) & Armor (Blue) Bars directly under radar (GTA V / VI Standard) */}
        <div className="w-36 flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1.5 rounded-lg border border-white/10 shadow-lg">
          {/* Health Bar (Green) */}
          <div className="w-1/2 flex items-center gap-1">
            <Heart className="w-3 h-3 text-emerald-400 fill-emerald-400 shrink-0" />
            <div className="w-full bg-slate-900 h-2.5 rounded-sm overflow-hidden border border-emerald-900/50">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-150"
                style={{ width: `${Math.max(0, Math.min(100, health))}%` }}
              />
            </div>
          </div>

          {/* Armor Bar (Blue) */}
          <div className="w-1/2 flex items-center gap-1">
            <Shield className="w-3 h-3 text-cyan-400 fill-cyan-400 shrink-0" />
            <div className="w-full bg-slate-900 h-2.5 rounded-sm overflow-hidden border border-cyan-900/50">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-150"
                style={{ width: `${Math.max(0, Math.min(100, armor))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Location Street Tag (GTA VI Clean Typography) */}
        <div className="w-36 text-center bg-black/60 backdrop-blur-sm py-0.5 px-1 rounded text-[9px] text-white/90 font-bold uppercase tracking-wider border border-white/10 shadow-md truncate" title={districtName}>
          {districtName}
        </div>
      </div>
    </div>
  );
}
