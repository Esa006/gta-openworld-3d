export type PlayerMode = 'FOOT' | 'DRIVING';

export type WeaponType = 'FISTS' | 'BASEBALL_BAT' | 'PISTOL' | 'MICRO_SMG';

export interface WeaponInfo {
  id: WeaponType;
  name: string;
  category: 'MELEE' | 'PISTOL' | 'SMG';
  ammo: number;
  maxAmmo: number;
  damage: number;
  fireRateMs: number;
}

export interface VehicleData {
  id: string;
  modelName: string;
  vehicleType: 'SPORTS' | 'MUSCLE' | 'POLICE' | 'MOTO';
  color: string;
  topSpeed: number;
  acceleration: number;
  handling: number;
  health: number;
  maxHealth: number;
  position: [number, number, number];
  rotation: number;
  isPlayerInside?: boolean;
}

export interface MissionData {
  id: string;
  code: string;
  title: string;
  client: string;
  description: string;
  rewardCash: number;
  rewardXp: number;
  targetPosition?: [number, number, number];
  targetX?: number;
  targetY?: number;
  targetZ?: number;
  targetName: string;
  status: 'AVAILABLE' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
}

export interface NPCData {
  id: string;
  name: string;
  type: 'CIVILIAN' | 'POLICE' | 'GANG';
  position: [number, number, number];
  rotation: number;
  state: 'IDLE' | 'WALKING' | 'FLEEING' | 'ATTACKING';
  health: number;
}

export interface WorldLocationData {
  id: string;
  name: string;
  type: 'SAFEHOUSE' | 'GARAGE' | 'MISSION_HUB' | 'WEAPON_SHOP' | 'HOSPITAL';
  position: [number, number, number];
  description?: string;
}

export interface SaveSlotData {
  id: string;
  slotNumber: number;
  saveName: string;
  savedAt: string;
  playerData: {
    health: number;
    armor: number;
    cash: number;
    wantedLevel: number;
    position: [number, number, number];
    weapon: WeaponType;
  };
  missionsCompleted: string[];
}
