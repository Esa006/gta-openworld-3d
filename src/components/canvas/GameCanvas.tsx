'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { GameEngine } from '@/game/GameEngine';

export default function GameCanvas() {
  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        camera={{ position: [0, 4, 10], fov: 65 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      >
        {/* Sky Background & Atmospheric Mist */}
        <color attach="background" args={['#38bdf8']} />
        <fog attach="fog" args={['#7dd3fc', 70, 280]} />

        {/* Modular GTA Engine */}
        <GameEngine />
      </Canvas>
    </div>
  );
}
