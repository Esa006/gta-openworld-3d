'use client';

import { useEffect, useRef } from 'react';

export interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
  jump: boolean;
  actionF: boolean;
  actionE: boolean;
  attack: boolean;
  radio: boolean;
  horn: boolean;
  phone: boolean;
}

export function useKeyboardControls(isPaused: boolean = false) {
  const keys = useRef<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false,
    actionF: false,
    actionE: false,
    attack: false,
    radio: false,
    horn: false,
    phone: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;

      if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.current.forward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.current.backward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.current.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.current.right = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.current.sprint = true;
      if (e.code === 'Space') keys.current.jump = true;
      if (e.code === 'KeyF' || e.code === 'Enter' || e.code === 'NumpadEnter') keys.current.actionF = true;
      if (e.code === 'KeyE') keys.current.actionE = true;
      if (e.code === 'KeyJ' || e.code === 'ControlLeft') keys.current.attack = true;
      if (e.code === 'KeyR') keys.current.radio = true;
      if (e.code === 'KeyH') keys.current.horn = true;
      if (e.code === 'KeyP' || e.code === 'Tab') keys.current.phone = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.current.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.current.backward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.current.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.current.right = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.current.sprint = false;
      if (e.code === 'Space') keys.current.jump = false;
      if (e.code === 'KeyF' || e.code === 'Enter' || e.code === 'NumpadEnter') keys.current.actionF = false;
      if (e.code === 'KeyE') keys.current.actionE = false;
      if (e.code === 'KeyJ' || e.code === 'ControlLeft') keys.current.attack = false;
      if (e.code === 'KeyR') keys.current.radio = false;
      if (e.code === 'KeyH') keys.current.horn = false;
      if (e.code === 'KeyP' || e.code === 'Tab') keys.current.phone = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPaused]);

  return keys;
}
