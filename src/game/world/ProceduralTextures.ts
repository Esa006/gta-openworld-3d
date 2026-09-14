'use client';

import * as THREE from 'three';

// Cache generated textures in memory
const textureCache: Record<string, THREE.CanvasTexture> = {};

/**
 * Procedural Realistic Human Face Texture
 */
export function getProceduralFaceTexture(): THREE.CanvasTexture {
  if (textureCache['face']) return textureCache['face'];
  if (typeof document === 'undefined') return new THREE.Texture() as unknown as THREE.CanvasTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Base Mediterranean skin gradient
    const skinGrad = ctx.createLinearGradient(0, 0, 0, 512);
    skinGrad.addColorStop(0, '#e5a585');
    skinGrad.addColorStop(0.5, '#df9b77');
    skinGrad.addColorStop(1, '#c98460');
    ctx.fillStyle = skinGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle skin noise & pore texture
    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }

    // 5 O'Clock Stubble Shadow Beard
    ctx.fillStyle = 'rgba(45, 25, 20, 0.35)';
    ctx.beginPath();
    ctx.ellipse(256, 380, 160, 100, 0, 0, Math.PI);
    ctx.fill();

    // Eyes
    [-90, 90].forEach((xOffset) => {
      const eyeX = 256 + xOffset;
      const eyeY = 220;

      // Sclera (Whites)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, 32, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Iris (Dark Amber Brown)
      ctx.fillStyle = '#3a2012';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 14, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 7, 0, Math.PI * 2);
      ctx.fill();

      // Eye Specular Highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX - 4, eyeY - 4, 3, 0, Math.PI * 2);
      ctx.fill();

      // Eyelid crease
      ctx.strokeStyle = 'rgba(70, 35, 25, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY - 6, 34, 18, 0, Math.PI, Math.PI * 2);
      ctx.stroke();

      // Masculine Eyebrow
      ctx.fillStyle = '#1c1514';
      ctx.beginPath();
      ctx.moveTo(eyeX - 38, eyeY - 26);
      ctx.lineTo(eyeX + 38, eyeY - 22 + (xOffset < 0 ? -4 : 4));
      ctx.lineTo(eyeX + 34, eyeY - 36);
      ctx.lineTo(eyeX - 38, eyeY - 32);
      ctx.closePath();
      ctx.fill();
    });

    // Nose Bridge Shading & Nostrils
    ctx.fillStyle = 'rgba(140, 75, 55, 0.4)';
    ctx.beginPath();
    ctx.ellipse(256, 280, 14, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    // Nostrils
    ctx.fillStyle = 'rgba(40, 20, 15, 0.7)';
    ctx.beginPath();
    ctx.arc(244, 310, 5, 0, Math.PI * 2);
    ctx.arc(268, 310, 5, 0, Math.PI * 2);
    ctx.fill();

    // Lips with Smirk
    ctx.fillStyle = '#a65242';
    ctx.beginPath();
    ctx.ellipse(256, 360, 42, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#662218';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(216, 360);
    ctx.quadraticCurveTo(256, 364, 298, 358); // subtle smirk upward
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache['face'] = texture;
  return texture;
}

/**
 * Procedural Vice City Jersey #69 Texture
 */
export function getProceduralJerseyTexture(): THREE.CanvasTexture {
  if (textureCache['jersey']) return textureCache['jersey'];
  if (typeof document === 'undefined') return new THREE.Texture() as unknown as THREE.CanvasTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Teal Base
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle athletic mesh perforation pattern
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let x = 8; x < 512; x += 16) {
      for (let y = 8; y < 512; y += 16) {
        ctx.fillRect(x, y, 3, 3);
      }
    }

    // Top Arc Text: "MARCUS" / "VICE DISTRICT"
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '8px';
    ctx.fillText('MARCUS', 256, 120);

    // Big Bold Athletic Number 69 with Pink Outline
    ctx.font = '900 210px Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Pink Outer Stroke
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 26;
    ctx.lineJoin = 'round';
    ctx.strokeText('69', 256, 280);

    // Crisp White Core Number
    ctx.fillStyle = '#ffffff';
    ctx.fillText('69', 256, 280);

    // Bottom Decorative Stripes
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(0, 460, 512, 22);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 485, 512, 14);
  }

  const texture = new THREE.CanvasTexture(canvas);
  textureCache['jersey'] = texture;
  return texture;
}

/**
 * Procedural Art Deco Skyscraper Windows Texture
 */
export function getProceduralBuildingTexture(isNight: boolean = false): THREE.CanvasTexture {
  const key = isNight ? 'building_night' : 'building_day';
  if (textureCache[key]) return textureCache[key];
  if (typeof document === 'undefined') return new THREE.Texture() as unknown as THREE.CanvasTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = isNight ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, 256, 512);

    const cols = 6;
    const rows = 14;
    const padX = 14;
    const padY = 16;
    const w = (256 - padX * (cols + 1)) / cols;
    const h = (512 - padY * (rows + 1)) / rows;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = padX + c * (w + padX);
        const y = padY + r * (h + padY);

        if (isNight) {
          // Warm glowing window lights at night
          const lit = (c * 7 + r * 13) % 3 === 0;
          ctx.fillStyle = lit ? '#fef08a' : '#1e293b';
        } else {
          // Tinted reflection during sunny day
          ctx.fillStyle = (c + r) % 2 === 0 ? '#38bdf8' : '#0284c7';
          ctx.globalAlpha = 0.45;
        }

        ctx.fillRect(x, y, w, h);
        ctx.globalAlpha = 1.0;
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 4);
  textureCache[key] = texture;
  return texture;
}
