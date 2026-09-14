'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export function useMouseControls() {
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const mouseDelta = useRef({ x: 0, y: 0 });
  const isMouseDown = useRef(false);

  const requestLock = useCallback((element: HTMLElement) => {
    if (document.pointerLockElement !== element) {
      element.requestPointerLock?.();
    }
  }, []);

  const releaseLock = useCallback(() => {
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
  }, []);

  useEffect(() => {
    const handleLockChange = () => {
      setIsPointerLocked(!!document.pointerLockElement);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement || isMouseDown.current) {
        mouseDelta.current.x += e.movementX;
        mouseDelta.current.y += e.movementY;
      }
    };

    const handleMouseDown = () => {
      isMouseDown.current = true;
    };

    const handleMouseUp = () => {
      isMouseDown.current = false;
    };

    document.addEventListener('pointerlockchange', handleLockChange);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('pointerlockchange', handleLockChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const consumeDelta = useCallback(() => {
    const dx = mouseDelta.current.x;
    const dy = mouseDelta.current.y;
    mouseDelta.current.x = 0;
    mouseDelta.current.y = 0;
    return { dx, dy };
  }, []);

  return {
    isPointerLocked,
    requestLock,
    releaseLock,
    consumeDelta,
    isMouseDown,
  };
}
