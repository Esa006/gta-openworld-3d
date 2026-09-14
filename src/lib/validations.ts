import { z } from 'zod';

export const PlayerStateUpdateSchema = z.object({
  health: z.number().min(0).max(100),
  armor: z.number().min(0).max(100),
  cash: z.number().int(),
  wantedLevel: z.number().int().min(0).max(5),
  position: z.tuple([z.number(), z.number(), z.number()]),
  rotation: z.number().optional(),
  currentVehicleId: z.string().nullable().optional(),
  eventReason: z.string().optional(), // "CHECKPOINT", "VEHICLE_HIJACK", "HOSPITAL_RESPAWN", etc.
});

export const VehicleActionSchema = z.object({
  vehicleId: z.string(),
  action: z.enum(['ENTER', 'EXIT', 'HIJACK', 'DAMAGE', 'REPAIR']),
  health: z.number().min(0).max(100).optional(),
  position: z.tuple([z.number(), z.number(), z.number()]).optional(),
});

export const MissionActionSchema = z.object({
  missionId: z.string(),
  action: z.enum(['START', 'COMPLETE', 'FAIL']),
  stats: z.object({
    timeSpentSec: z.number().optional(),
    copsEvaded: z.number().optional(),
  }).optional(),
});

export const InventoryActionSchema = z.object({
  weaponId: z.string(),
  action: z.enum(['EQUIP', 'BUY_AMMO']),
  cost: z.number().optional(),
});

export const SaveGameSchema = z.object({
  slotNumber: z.number().int().min(1).max(5),
  saveName: z.string().min(1).max(60),
  worldData: z.record(z.string(), z.unknown()),
});

export type PlayerStateUpdateInput = z.infer<typeof PlayerStateUpdateSchema>;
export type VehicleActionInput = z.infer<typeof VehicleActionSchema>;
export type MissionActionInput = z.infer<typeof MissionActionSchema>;
export type InventoryActionInput = z.infer<typeof InventoryActionSchema>;
export type SaveGameInput = z.infer<typeof SaveGameSchema>;
