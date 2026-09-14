import { create } from 'zustand';
import { PlayerMode, WeaponType, VehicleData, MissionData } from '@/types/gta';
import { soundFx } from '@/lib/soundEffects';

interface GameState {
  // Player state
  playerMode: PlayerMode;
  position: [number, number, number];
  rotation: number;
  health: number;
  armor: number;
  cash: number;
  wantedLevel: number;
  isWasted: boolean;
  isBusted: boolean;

  // Driving & Vehicles
  activeVehicleId: string | null;
  nearbyVehicleId: string | null;
  nearbyVehicleName: string | null;
  vehicleSpeed: number;
  vehicleHealth: number;
  vehicleGear: string;
  radioStation: 'FLASH_FM' | 'WAVE_103' | 'V_ROCK' | 'OFF';
  headlightsOn: boolean;
  playerSkin: 'CIVILIAN' | 'SOLDIER';

  // Combat & Inventory
  equippedWeapon: WeaponType;
  ammo: Record<WeaponType, number>;

  // Missions & Objectives
  activeMission: MissionData | null;
  completedMissions: string[];
  bannerMessage: { title: string; subtitle: string; type: 'OBJECTIVE' | 'PASSED' | 'FAILED' } | null;

  // UI & App state
  cameraAngle: number;
  isPhoneOpen: boolean;
  isMuted: boolean;
  activePhoneApp: 'MISSIONS' | 'GARAGE' | 'SAVE' | 'STATS' | 'RADIO';

  // Actions
  setCameraAngle: (angle: number) => void;
  setPlayerPosition: (pos: [number, number, number], rot?: number) => void;
  setPlayerMode: (mode: PlayerMode, vehicleId?: string | null, vehicleName?: string | null) => void;
  setNearbyVehicle: (vehicleId: string | null, vehicleName?: string | null) => void;
  updateVehicleTelemetry: (speed: number, health: number, gear?: string) => void;
  toggleHeadlights: () => void;
  cycleRadio: () => void;
  togglePlayerSkin: () => void;
  
  // Health & Wanted
  takeDamage: (amount: number) => void;
  healPlayer: (amount: number) => void;
  setWantedLevel: (level: number) => void;
  addCash: (amount: number) => void;
  spendCash: (amount: number) => boolean;

  // Combat
  setEquippedWeapon: (weapon: WeaponType) => void;
  fireWeapon: () => boolean;
  addAmmo: (weapon: WeaponType, amount: number) => void;

  // Missions
  startMission: (mission: MissionData) => void;
  completeActiveMission: () => void;
  failActiveMission: (reason: string) => void;
  clearBanner: () => void;

  // System
  respawnPlayer: () => void;
  togglePhone: () => void;
  setPhoneApp: (app: 'MISSIONS' | 'GARAGE' | 'SAVE' | 'STATS' | 'RADIO') => void;
  toggleMute: () => void;
  syncStateToBackend: (reason: string) => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  playerMode: 'FOOT',
  position: [0, 1.5, 0],
  rotation: 0,
  health: 100,
  armor: 50,
  cash: 5000,
  wantedLevel: 0,
  isWasted: false,
  isBusted: false,

  activeVehicleId: null,
  nearbyVehicleId: null,
  nearbyVehicleName: null,
  vehicleSpeed: 0,
  vehicleHealth: 100,
  vehicleGear: 'D',
  radioStation: 'OFF',
  headlightsOn: true,
  playerSkin: 'CIVILIAN',

  equippedWeapon: 'PISTOL',
  ammo: {
    FISTS: 1,
    BASEBALL_BAT: 1,
    PISTOL: 48,
    MICRO_SMG: 90,
  },

  activeMission: null,
  completedMissions: [],
  bannerMessage: {
    title: 'WELCOME TO VICE DISTRICT',
    subtitle: 'Press [F] or [E] to drive cars. [WASD] to move. [P] for Phone.',
    type: 'OBJECTIVE',
  },

  cameraAngle: 0,
  isPhoneOpen: false,
  isMuted: false,
  activePhoneApp: 'MISSIONS',

  setCameraAngle: (angle) => set({ cameraAngle: angle }),

  setPlayerPosition: (pos, rot) => {
    set((state) => ({
      position: pos,
      rotation: rot !== undefined ? rot : state.rotation,
    }));
  },

  setPlayerMode: (mode, vehicleId = null, vehicleName = null) => {
    const prevMode = get().playerMode;
    const vName = vehicleName || get().nearbyVehicleName || 'Vehicle';

    set({
      playerMode: mode,
      activeVehicleId: vehicleId,
      vehicleSpeed: 0,
    });

    if (mode === 'DRIVING') {
      soundFx.playCarDoor();
      soundFx.playHorn();

      // Police vehicle theft triggers police wanted level
      if (vehicleId?.toLowerCase().includes('police')) {
        set((s) => ({ wantedLevel: Math.max(s.wantedLevel, 1) }));
      }

      // Display hijack notification banner
      set({
        bannerMessage: {
          title: 'VEHICLE HIJACKED',
          subtitle: `${vName} secured. [W/A/S/D] Drive • [SPACE] Handbrake • [F / E] Exit`,
          type: 'OBJECTIVE',
        },
      });

      // Clear banner after 4.5 seconds
      setTimeout(() => {
        if (!get().activeMission && get().bannerMessage?.title === 'VEHICLE HIJACKED') {
          get().clearBanner();
        }
      }, 4500);

      get().syncStateToBackend('ENTERED_VEHICLE');
    } else if (prevMode === 'DRIVING') {
      soundFx.playCarDoor();
      soundFx.stopEngine();
      get().syncStateToBackend('EXITED_VEHICLE');
    }
  },

  setNearbyVehicle: (vehicleId, vehicleName = null) => {
    set({ nearbyVehicleId: vehicleId, nearbyVehicleName: vehicleName ?? null });
  },

  updateVehicleTelemetry: (speed, health, gear = 'D') => {
    set({ vehicleSpeed: speed, vehicleHealth: health, vehicleGear: gear });
    soundFx.updateEngine(Math.min(speed / 50, 1), get().playerMode === 'DRIVING');
  },

  toggleHeadlights: () => {
    set((state) => ({ headlightsOn: !state.headlightsOn }));
  },

  togglePlayerSkin: () => {
    set((state) => ({ playerSkin: state.playerSkin === 'CIVILIAN' ? 'SOLDIER' : 'CIVILIAN' }));
  },

  cycleRadio: () => {
    const stations: ('OFF' | 'FLASH_FM' | 'WAVE_103' | 'V_ROCK')[] = ['OFF', 'FLASH_FM', 'WAVE_103', 'V_ROCK'];
    const currentIdx = stations.indexOf(get().radioStation);
    const nextStation = stations[(currentIdx + 1) % stations.length];
    set({ radioStation: nextStation });
    soundFx.cycleRadio(nextStation);
  },

  takeDamage: (amount) => {
    const { health, armor } = get();
    if (armor > 0) {
      const absorbed = Math.min(armor, amount);
      const remaining = amount - absorbed;
      const newArmor = armor - absorbed;
      const newHealth = Math.max(0, health - remaining);
      set({ armor: newArmor, health: newHealth, isWasted: newHealth <= 0 });
    } else {
      const newHealth = Math.max(0, health - amount);
      set({ health: newHealth, isWasted: newHealth <= 0 });
    }

    if (get().health <= 0) {
      soundFx.stopEngine();
      get().syncStateToBackend('PLAYER_WASTED');
    }
  },

  healPlayer: (amount) => {
    set((state) => ({ health: Math.min(100, state.health + amount) }));
  },

  setWantedLevel: (level) => {
    const clamped = Math.max(0, Math.min(5, level));
    set({ wantedLevel: clamped });
    if (clamped > 0) {
      soundFx.startSiren();
    } else {
      soundFx.stopSiren();
    }
    get().syncStateToBackend(`WANTED_LEVEL_${clamped}`);
  },

  addCash: (amount) => {
    set((state) => ({ cash: state.cash + amount }));
    soundFx.playCashRegister();
    get().syncStateToBackend('CASH_ADDED');
  },

  spendCash: (amount) => {
    const { cash } = get();
    if (cash >= amount) {
      set({ cash: cash - amount });
      soundFx.playCashRegister();
      get().syncStateToBackend('CASH_SPENT');
      return true;
    }
    return false;
  },

  setEquippedWeapon: (weapon) => {
    set({ equippedWeapon: weapon });
  },

  fireWeapon: () => {
    const { equippedWeapon, ammo } = get();
    if (equippedWeapon === 'FISTS' || equippedWeapon === 'BASEBALL_BAT') {
      soundFx.playHorn(); // quick whoosh
      return true;
    }
    if (ammo[equippedWeapon] > 0) {
      set((state) => ({
        ammo: { ...state.ammo, [equippedWeapon]: state.ammo[equippedWeapon] - 1 },
      }));
      soundFx.playGunshot();
      // Firing weapon in public can alert cops if wantedLevel is 0
      if (get().wantedLevel === 0 && Math.random() < 0.3) {
        get().setWantedLevel(1);
      }
      return true;
    }
    return false;
  },

  addAmmo: (weapon, amount) => {
    set((state) => ({
      ammo: { ...state.ammo, [weapon]: state.ammo[weapon] + amount },
    }));
  },

  startMission: (mission) => {
    set({
      activeMission: mission,
      bannerMessage: {
        title: `MISSION: ${mission.title.toUpperCase()}`,
        subtitle: mission.description,
        type: 'OBJECTIVE',
      },
      isPhoneOpen: false,
    });
    // Call backend start
    fetch(`/api/missions/${mission.id}/start`, { method: 'POST' }).catch(() => {});
  },

  completeActiveMission: () => {
    const { activeMission } = get();
    if (!activeMission) return;

    soundFx.playMissionPassed();
    set((state) => ({
      activeMission: null,
      completedMissions: [...state.completedMissions, activeMission.id],
      cash: state.cash + activeMission.rewardCash,
      wantedLevel: 0,
      bannerMessage: {
        title: 'MISSION PASSED!',
        subtitle: `Earned $${activeMission.rewardCash.toLocaleString()} | Respect +`,
        type: 'PASSED',
      },
    }));

    soundFx.stopSiren();
    fetch(`/api/missions/${activeMission.id}/complete`, { method: 'POST' }).catch(() => {});
  },

  failActiveMission: (reason) => {
    set({
      activeMission: null,
      bannerMessage: {
        title: 'MISSION FAILED',
        subtitle: reason,
        type: 'FAILED',
      },
    });
  },

  clearBanner: () => {
    set({ bannerMessage: null });
  },

  respawnPlayer: () => {
    soundFx.stopEngine();
    soundFx.stopSiren();
    set({
      health: 100,
      armor: 25,
      isWasted: false,
      isBusted: false,
      wantedLevel: 0,
      playerMode: 'FOOT',
      activeVehicleId: null,
      position: [-40, 1.5, 30], // Hospital coordinates
      bannerMessage: {
        title: 'VICE CITY GENERAL HOSPITAL',
        subtitle: 'You were patched up. Medical bill: $500',
        type: 'OBJECTIVE',
      },
    });
    get().spendCash(500);
    get().syncStateToBackend('HOSPITAL_RESPAWN');
  },

  togglePhone: () => {
    set((state) => ({ isPhoneOpen: !state.isPhoneOpen }));
  },

  setPhoneApp: (app) => {
    set({ activePhoneApp: app });
  },

  toggleMute: () => {
    const newMute = !get().isMuted;
    set({ isMuted: newMute });
    soundFx.setMuted(newMute);
  },

  syncStateToBackend: async (reason) => {
    try {
      const state = get();
      await fetch('/api/player/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          health: state.health,
          armor: state.armor,
          cash: state.cash,
          wantedLevel: state.wantedLevel,
          position: state.position,
          currentVehicleId: state.activeVehicleId,
          eventReason: reason,
        }),
      });
    } catch {
      // Offline fallback silent
    }
  },
}));
