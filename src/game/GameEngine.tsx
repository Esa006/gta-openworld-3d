'use client';

import React, { Suspense } from 'react';
import { Physics } from '@react-three/rapier';
import { DayNightCycle } from './world/DayNightCycle';
import { RoadNetwork } from './world/RoadNetwork';
import { CityMap } from './world/CityMap';
import { CityTwoMap } from './world/CityTwoMap';
import { CityProps } from './world/CityProps';
import { PlayerCharacter } from '@/components/canvas/PlayerCharacter';
import { VehicleManager } from '@/components/canvas/VehicleManager';
import { TrafficAI } from './vehicles/TrafficAI';
import { NPCController } from './npc/NPCController';
import { PoliceSystem } from './police/PoliceSystem';
import { MissionMarkers } from '@/components/canvas/MissionMarkers';
import { SmartCamera } from './camera/SmartCamera';

export function GameEngine() {
  return (
    <>
      {/* Dynamic Sun, Moon, Sky and Lighting System */}
      <DayNightCycle />

      <Suspense fallback={null}>
        <Physics gravity={[0, -22, 0]}>
          {/* Detailed Miami Road Grid with Crosswalks and Sidewalk Colliders */}
          <RoadNetwork />

          {/* Art Deco Skyscrapers with Storefronts and Neon Signage (City 1: Vice Beach) */}
          <CityMap />

          {/* Modern Glass Corporate Skyscrapers & Helipads (City 2: Vice Bay Financial District) */}
          <CityTwoMap />

          {/* Dense Street Furniture: Streetlights, Palm Trees, Benches, Fire Hydrants, Trash Cans */}
          <CityProps />

          {/* Protagonist (Marcus in #69 Teal Jersey & Crossbody Duffle Bag) */}
          <PlayerCharacter />

          {/* Drivable Vehicles (Motorcycle, Sports Car, Muscle Car, Police Cruiser) */}
          <VehicleManager />

          {/* Living Ambient Traffic AI */}
          <TrafficAI />

          {/* Pedestrian Sidewalk Crowd with Panic & Fleeing AI */}
          <NPCController />

          {/* Dynamic 1-5 Star Police Pursuit Cruisers with Siren Strobes */}
          <PoliceSystem />

          {/* Holographic Mission Marker */}
          <MissionMarkers />
        </Physics>

        {/* Smooth Third-Person Over-The-Shoulder & Chase Camera */}
        <SmartCamera />
      </Suspense>
    </>
  );
}
