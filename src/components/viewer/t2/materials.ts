"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { PUDU_GREEN } from "../config";

export interface T2Materials {
  paint: THREE.MeshPhysicalMaterial;
  cream: THREE.MeshStandardMaterial;
  chrome: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  gasket: THREE.MeshStandardMaterial;
  seam: THREE.MeshStandardMaterial;
  rubber: THREE.MeshStandardMaterial;
  dark: THREE.MeshStandardMaterial;
  amber: THREE.MeshStandardMaterial;
  red: THREE.MeshStandardMaterial;
  lens: THREE.MeshStandardMaterial;
}

/** Materiales PBR del visor: pintura automotriz, cromo, vidrio tintado. */
export function useT2Materials(): T2Materials {
  const materials = useMemo<T2Materials>(() => {
    const paint = new THREE.MeshPhysicalMaterial({
      color: PUDU_GREEN,
      metalness: 0.12,
      roughness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.25,
    });

    const cream = new THREE.MeshStandardMaterial({
      color: "#f2eee4",
      roughness: 0.32,
      metalness: 0.08,
    });

    const chrome = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.1,
      metalness: 1,
      envMapIntensity: 1.5,
    });

    // Vidrio automotriz tintado: oscuro y muy reflectante
    const glass = new THREE.MeshPhysicalMaterial({
      color: "#1c2b27",
      roughness: 0.04,
      metalness: 0,
      transparent: true,
      opacity: 0.92,
      envMapIntensity: 1.6,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
    });

    const gasket = new THREE.MeshStandardMaterial({
      color: "#101210",
      roughness: 0.85,
    });

    // Líneas de chapa: verde muy oscuro, leen como sombra de junta
    const seam = new THREE.MeshStandardMaterial({
      color: "#06301c",
      roughness: 0.7,
    });

    const rubber = new THREE.MeshStandardMaterial({
      color: "#141414",
      roughness: 0.95,
    });

    const dark = new THREE.MeshStandardMaterial({
      color: "#1c1f21",
      roughness: 0.8,
    });

    const amber = new THREE.MeshStandardMaterial({
      color: "#e08c2a",
      roughness: 0.25,
      emissive: "#6b3600",
      emissiveIntensity: 0.35,
    });

    const red = new THREE.MeshStandardMaterial({
      color: "#a81f1f",
      roughness: 0.25,
      emissive: "#3a0505",
      emissiveIntensity: 0.35,
    });

    const lens = new THREE.MeshStandardMaterial({
      color: "#f6f3e4",
      roughness: 0.12,
      metalness: 0.05,
      emissive: "#fff4cc",
      emissiveIntensity: 0.18,
    });

    return {
      paint,
      cream,
      chrome,
      glass,
      gasket,
      seam,
      rubber,
      dark,
      amber,
      red,
      lens,
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [materials]);

  return materials;
}
