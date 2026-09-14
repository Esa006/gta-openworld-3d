'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { MissionData } from '@/types/gta';
import {
  X,
  Target,
  Car,
  Save,
  Radio,
  BarChart2,
  CheckCircle2,
  Play,
  Download,
} from 'lucide-react';

export function InGamePhone() {
  const isPhoneOpen = useGameStore((s) => s.isPhoneOpen);
  const togglePhone = useGameStore((s) => s.togglePhone);
  const activePhoneApp = useGameStore((s) => s.activePhoneApp);
  const setPhoneApp = useGameStore((s) => s.setPhoneApp);
  const startMission = useGameStore((s) => s.startMission);
  const activeMission = useGameStore((s) => s.activeMission);
  const completedMissions = useGameStore((s) => s.completedMissions);
  const cash = useGameStore((s) => s.cash);
  const health = useGameStore((s) => s.health);
  const armor = useGameStore((s) => s.armor);
  const wantedLevel = useGameStore((s) => s.wantedLevel);
  const position = useGameStore((s) => s.position);
  const radioStation = useGameStore((s) => s.radioStation);
  const cycleRadio = useGameStore((s) => s.cycleRadio);

  const [missions, setMissions] = useState<MissionData[]>([]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveSlots, setSaveSlots] = useState<any[]>([]);

  useEffect(() => {
    if (isPhoneOpen) {
      // Fetch missions
      fetch('/api/missions')
        .then((res) => res.json())
        .then((data) => {
          if (data?.missions) setMissions(data.missions);
        })
        .catch(() => {});

      // Fetch saves
      fetch('/api/load')
        .then((res) => res.json())
        .then((data) => {
          if (data?.saves) setSaveSlots(data.saves);
        })
        .catch(() => {});
    }
  }, [isPhoneOpen]);

  // Keyboard shortcut [P] to toggle phone
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyP') {
        togglePhone();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePhone]);

  if (!isPhoneOpen) return null;

  const handleSaveGame = async (slotNumber: number) => {
    setSaveStatus('Saving game...');
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotNumber,
          saveName: `Downtown Safehouse - $${cash}`,
          worldData: {
            health,
            armor,
            cash,
            wantedLevel,
            position,
            completedMissions,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus(`Saved to Slot ${slotNumber}!`);
        setSaveSlots((prev) => {
          const filtered = prev.filter((s) => s.slotNumber !== slotNumber);
          return [...filtered, data.save];
        });
      } else {
        setSaveStatus('Failed to save.');
      }
    } catch {
      setSaveStatus('Network error.');
    }
    setTimeout(() => setSaveStatus(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none p-4">
      {/* Smartphone Body */}
      <div className="relative w-80 h-[560px] bg-slate-900 border-4 border-slate-700 rounded-[36px] shadow-2xl flex flex-col overflow-hidden text-white font-mono">
        {/* Phone Top Notch */}
        <div className="w-full bg-slate-950 px-6 py-2 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800">
          <span>9:41 PM</span>
          <div className="w-16 h-3.5 bg-black rounded-full" />
          <span>5G 98%</span>
        </div>

        {/* App Header & Close */}
        <div className="bg-slate-950 px-4 py-2 flex items-center justify-between border-b border-slate-800">
          <span className="text-xs font-bold text-cyan-400 tracking-wider">iFRUIT OS 12</span>
          <button
            onClick={togglePhone}
            className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Phone App Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* MISSIONS APP */}
          {activePhoneApp === 'MISSIONS' && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Target className="w-4 h-4" /> City Contracts
              </h3>
              {missions.length === 0 && (
                <div className="text-xs text-slate-400 text-center py-6">Loading contracts...</div>
              )}
              {missions.map((m) => {
                const isCurrent = activeMission?.id === m.id;
                const isCompleted = completedMissions.includes(m.id);
                return (
                  <div
                    key={m.id}
                    className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{m.title}</span>
                      <span className="text-[10px] text-emerald-400 font-black">
                        +${m.rewardCash.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">{m.description}</div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[9px] text-slate-500">Client: {m.client}</span>
                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Done
                        </span>
                      ) : isCurrent ? (
                        <span className="text-[10px] text-amber-400 font-bold animate-pulse">
                          In Progress...
                        </span>
                      ) : (
                        <button
                          onClick={() => startMission(m)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] rounded transition cursor-pointer"
                        >
                          <Play className="w-2.5 h-2.5 fill-black" /> Accept
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* GARAGE APP */}
          {activePhoneApp === 'GARAGE' && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <Car className="w-4 h-4" /> Vehicle Fleet
              </h3>
              {[
                { name: 'Banshee GT', type: 'Super Sports', topSpeed: '160 MPH', loc: 'Downtown Blvd' },
                { name: 'Stallion V8', type: 'Muscle Car', topSpeed: '145 MPH', loc: 'West Avenue' },
                { name: 'VCPD Interceptor', type: 'Police Cruiser', topSpeed: '150 MPH', loc: 'Precinct' },
                { name: 'Sanchez 500', type: 'Dirt Bike', topSpeed: '120 MPH', loc: 'North Alley' },
              ].map((v, i) => (
                <div key={i} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{v.name}</span>
                    <span className="text-[10px] text-cyan-400 font-bold">{v.topSpeed}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">{v.type} • Parked: {v.loc}</div>
                </div>
              ))}
            </div>
          )}

          {/* SAVE APP */}
          {activePhoneApp === 'SAVE' && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <Save className="w-4 h-4" /> Cloud Checkpoint
              </h3>
              {saveStatus && (
                <div className="p-2 text-center text-xs font-bold rounded bg-slate-800 text-emerald-400 border border-emerald-500/40">
                  {saveStatus}
                </div>
              )}
              {[1, 2, 3].map((slot) => {
                const existing = saveSlots.find((s) => s.slotNumber === slot);
                return (
                  <div
                    key={slot}
                    className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">Slot {slot}</div>
                      <div className="text-[9px] text-slate-400">
                        {existing ? existing.saveName : 'Empty Slot'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSaveGame(slot)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded transition cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* RADIO APP */}
          {activePhoneApp === 'RADIO' && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-pink-400 uppercase tracking-widest flex items-center gap-1.5">
                <Radio className="w-4 h-4" /> Radio Stations
              </h3>
              <div className="space-y-2">
                {[
                  { id: 'WAVE_103', name: 'Wave 103', genre: 'Synthwave & New Wave' },
                  { id: 'FLASH_FM', name: 'Flash FM', genre: 'Vice Electro Pop' },
                  { id: 'V_ROCK', name: 'V-Rock', genre: 'Heavy Metal & Rock' },
                  { id: 'OFF', name: 'Radio Off', genre: 'Mute broadcast' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={cycleRadio}
                    className={`w-full p-3 rounded-xl border text-left transition cursor-pointer ${
                      radioStation === st.id
                        ? 'bg-pink-950/60 border-pink-500 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    <div className="text-xs font-bold">{st.name}</div>
                    <div className="text-[10px] text-slate-400">{st.genre}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STATS APP */}
          {activePhoneApp === 'STATS' && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4" /> Criminal Record
              </h3>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Alias</span>
                  <span className="font-bold text-white">Viper</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Net Worth</span>
                  <span className="font-bold text-emerald-400">${cash.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Health / Armor</span>
                  <span className="font-bold text-cyan-400">{Math.round(health)} / {Math.round(armor)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Wanted Stars</span>
                  <span className="font-bold text-amber-400">{'★'.repeat(wantedLevel) || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Missions Completed</span>
                  <span className="font-bold text-white">{completedMissions.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom App Dock Icons */}
        <div className="bg-slate-950 p-2.5 flex items-center justify-around border-t border-slate-800">
          <button
            onClick={() => setPhoneApp('MISSIONS')}
            className={`p-2 rounded-xl transition cursor-pointer ${
              activePhoneApp === 'MISSIONS' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
            title="Contracts"
          >
            <Target className="w-5 h-5" />
          </button>
          <button
            onClick={() => setPhoneApp('GARAGE')}
            className={`p-2 rounded-xl transition cursor-pointer ${
              activePhoneApp === 'GARAGE' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
            title="Garage"
          >
            <Car className="w-5 h-5" />
          </button>
          <button
            onClick={() => setPhoneApp('SAVE')}
            className={`p-2 rounded-xl transition cursor-pointer ${
              activePhoneApp === 'SAVE' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'
            }`}
            title="Save Checkpoint"
          >
            <Save className="w-5 h-5" />
          </button>
          <button
            onClick={() => setPhoneApp('RADIO')}
            className={`p-2 rounded-xl transition cursor-pointer ${
              activePhoneApp === 'RADIO' ? 'bg-pink-500/20 text-pink-400' : 'text-slate-400 hover:text-white'
            }`}
            title="Radio Tuner"
          >
            <Radio className="w-5 h-5" />
          </button>
          <button
            onClick={() => setPhoneApp('STATS')}
            className={`p-2 rounded-xl transition cursor-pointer ${
              activePhoneApp === 'STATS' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'
            }`}
            title="Stats"
          >
            <BarChart2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
