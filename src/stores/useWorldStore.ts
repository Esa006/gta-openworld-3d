import { create } from 'zustand';

export type TimePeriod = 'MORNING' | 'NOON' | 'SUNSET' | 'NIGHT';

export interface WorldState {
  timeOfDay: number; // 0 to 24 (e.g. 7 = morning, 12 = noon, 18.5 = sunset, 23 = night)
  timeSpeed: number; // time speed multiplier
  weather: 'SUNNY' | 'OVERCAST' | 'RAIN';
  trafficDensity: number;
  pedestrianDensity: number;
  setTimeOfDay: (time: number) => void;
  advanceTime: (deltaSeconds: number) => void;
  cycleTimePreset: () => void;
  setTimeSpeed: (speed: number) => void;
  setWeather: (weather: 'SUNNY' | 'OVERCAST' | 'RAIN') => void;
}

const PRESET_TIMES = [
  { hour: 7.0, label: 'MORNING' },
  { hour: 12.5, label: 'NOON' },
  { hour: 18.5, label: 'SUNSET' },
  { hour: 23.0, label: 'NIGHT' },
];

export const useWorldStore = create<WorldState>((set, get) => ({
  timeOfDay: 12.5, // Start at bright sunny noon
  timeSpeed: 0.12, // Faster natural day/night progression (about 3.5 minutes per 24h cycle)
  weather: 'SUNNY',
  trafficDensity: 1.0,
  pedestrianDensity: 1.0,

  setTimeOfDay: (time) => set({ timeOfDay: ((time % 24) + 24) % 24 }),

  advanceTime: (deltaSeconds) => {
    set((state) => ({
      timeOfDay: (state.timeOfDay + deltaSeconds * state.timeSpeed) % 24,
    }));
  },

  cycleTimePreset: () => {
    const current = get().timeOfDay;
    // Find next preset
    if (current < 7.0 || current >= 23.0) {
      set({ timeOfDay: 7.0 });
    } else if (current < 12.5) {
      set({ timeOfDay: 12.5 });
    } else if (current < 18.5) {
      set({ timeOfDay: 18.5 });
    } else {
      set({ timeOfDay: 23.0 });
    }
  },

  setTimeSpeed: (speed) => set({ timeSpeed: speed }),

  setWeather: (weather) => set({ weather }),
}));
