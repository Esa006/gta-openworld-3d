'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';

export function SmartCamera() {
  const { camera, gl } = useThree();
  const playerMode = useGameStore((s) => s.playerMode);
  const position = useGameStore((s) => s.position);
  const vehicleSpeed = useGameStore((s) => s.vehicleSpeed);
  const rotation = useGameStore((s) => s.rotation);
  const setCameraAngle = useGameStore((s) => s.setCameraAngle);

  const yaw = useRef(0);
  const pitch = useRef(0.12);
  const isDragging = useRef(false);

  const currentCamPos = useRef(new THREE.Vector3(0, 10, 15));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    const domElement = gl.domElement;

    const handleMouseDown = (e: MouseEvent) => {
      // Left or Right click to rotate camera
      if (e.button === 0 || e.button === 2) {
        isDragging.current = true;
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const isLocked = document.pointerLockElement === domElement;
      if (isDragging.current || isLocked) {
        yaw.current -= e.movementX * 0.0035;
        pitch.current = Math.max(-0.25, Math.min(0.7, pitch.current - e.movementY * 0.0035));
        setCameraAngle(yaw.current);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    domElement.addEventListener('contextmenu', handleContextMenu);

    return () => {
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      domElement.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [gl, setCameraAngle]);

  useFrame((_, delta) => {
    const px = position[0];
    const py = position[1] || 1.2;
    const pz = position[2];

    const targetLookAt = new THREE.Vector3(px, py + 1.25, pz);
    let targetCamPos: THREE.Vector3;

    if (playerMode === 'DRIVING') {
      // In car: smooth chase camera aligning with car rotation
      const speedOffset = Math.min(vehicleSpeed * 0.08, 4.0);
      const camDist = 8.5 + speedOffset;
      const camHeight = 3.6 + speedOffset * 0.25;

      // Smoothly blend camera yaw with car rotation
      yaw.current = THREE.MathUtils.lerp(yaw.current, rotation, delta * 4.0);
      setCameraAngle(yaw.current);

      const offsetX = Math.sin(yaw.current) * camDist;
      const offsetZ = Math.cos(yaw.current) * camDist;

      targetCamPos = new THREE.Vector3(px + offsetX, py + camHeight, pz + offsetZ);

      if ((camera as THREE.PerspectiveCamera).fov) {
        const targetFov = 60 + Math.min(vehicleSpeed * 0.3, 20);
        (camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp(
          (camera as THREE.PerspectiveCamera).fov,
          targetFov,
          delta * 4
        );
        (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
      }
    } else {
      // On foot: GTA VI style close over-the-shoulder third-person camera
      const camDist = 3.6;
      const camHeight = 1.45;
      const shoulderOffset = 0.35; // Authentic GTA right-shoulder offset

      const cosPitch = Math.cos(pitch.current);
      const sinYaw = Math.sin(yaw.current);
      const cosYaw = Math.cos(yaw.current);

      const offsetX = sinYaw * cosPitch * camDist + cosYaw * shoulderOffset;
      const offsetZ = cosYaw * cosPitch * camDist - sinYaw * shoulderOffset;
      const offsetY = Math.sin(pitch.current) * camDist + camHeight;

      targetCamPos = new THREE.Vector3(px + offsetX, py + offsetY, pz + offsetZ);
      targetLookAt.set(px + cosYaw * (shoulderOffset * 0.4), py + 1.35, pz - sinYaw * (shoulderOffset * 0.4));

      if ((camera as THREE.PerspectiveCamera).fov) {
        (camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp(
          (camera as THREE.PerspectiveCamera).fov,
          65,
          delta * 4
        );
        (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
      }
    }

    // Smooth camera damping
    currentCamPos.current.lerp(targetCamPos, delta * 9.0);
    currentLookAt.current.lerp(targetLookAt, delta * 12.0);

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
