"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

export interface BrandTextures {
  logoWhite: THREE.CanvasTexture;
  logoGreen: THREE.CanvasTexture;
  wordmark: THREE.CanvasTexture;
  screen: THREE.CanvasTexture;
}

function makeTexture(canvas: HTMLCanvasElement) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Dibuja la cabeza de pudú (logo de marca) en un canvas. */
function drawPuduLogo(color: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  // Orejas
  const ear = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, 58, 95, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  ear(152, 195, -0.55);
  ear(360, 195, 0.55);

  // Astas pequeñas (el pudú tiene cuernos cortos)
  ctx.lineWidth = 26;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(228, 165);
  ctx.lineTo(206, 88);
  ctx.moveTo(284, 165);
  ctx.lineTo(306, 88);
  ctx.stroke();

  // Cabeza y hocico
  ctx.beginPath();
  ctx.ellipse(256, 305, 118, 125, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(256, 395, 62, 58, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ojos y nariz perforados (dejan ver la pintura de fondo)
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(215, 298, 14, 0, Math.PI * 2);
  ctx.arc(297, 298, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(256, 414, 21, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  return c;
}

/** "PUDÚ — ECOSISTEMA EN MOVIMIENTO" como en la foto de referencia. */
function drawWordmark() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#f4f0e6";
  ctx.textBaseline = "alphabetic";

  ctx.font = "800 218px -apple-system, 'Helvetica Neue', Arial, sans-serif";
  ctx.fillText("PUDÚ", 28, 250);

  ctx.font = "700 64px -apple-system, 'Helvetica Neue', Arial, sans-serif";
  ctx.fillText("ECOSISTEMA EN", 32, 370);
  ctx.fillText("MOVIMIENTO", 32, 452);

  return c;
}

/** Pantalla del estudio: "ON AIR" + forma de onda. */
function drawScreen() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 288;
  const ctx = c.getContext("2d")!;

  ctx.fillStyle = "#06110b";
  ctx.fillRect(0, 0, 512, 288);

  ctx.fillStyle = "#34d17c";
  ctx.beginPath();
  ctx.arc(80, 84, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = "800 64px -apple-system, 'Helvetica Neue', Arial, sans-serif";
  ctx.fillText("ON AIR", 122, 106);

  ctx.font = "600 30px -apple-system, 'Helvetica Neue', Arial, sans-serif";
  ctx.fillStyle = "#9be8c0";
  ctx.fillText("PUDÚ · ESTUDIO MÓVIL", 60, 156);

  // Forma de onda determinista (sin Math.random para evitar re-renders)
  ctx.fillStyle = "#34d17c";
  for (let i = 0; i < 30; i++) {
    const h = 14 + 44 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6));
    ctx.fillRect(48 + i * 14.5, 226 - h / 2, 7, h);
  }

  return c;
}

/**
 * Texturas de marca generadas por código (sin assets externos),
 * aplicadas como calcomanías sobre la carrocería.
 */
export function useBrandTextures(): BrandTextures {
  const textures = useMemo<BrandTextures>(() => {
    return {
      logoWhite: makeTexture(drawPuduLogo("#f4f0e6")),
      logoGreen: makeTexture(drawPuduLogo("#0e6a3f")),
      wordmark: makeTexture(drawWordmark()),
      screen: makeTexture(drawScreen()),
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(textures).forEach((t) => t.dispose());
    };
  }, [textures]);

  return textures;
}
