"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

export interface KombiMaterials {
  paint: THREE.MeshPhysicalMaterial;
  paintInner: THREE.MeshStandardMaterial;
  cream: THREE.MeshStandardMaterial;
  chrome: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  rubber: THREE.MeshStandardMaterial;
  matte: THREE.MeshStandardMaterial;
  darkCavity: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
  fabric: THREE.MeshStandardMaterial;
  acoustic: THREE.MeshStandardMaterial;
  led: THREE.MeshBasicMaterial;
  amber: THREE.MeshStandardMaterial;
  lens: THREE.MeshStandardMaterial;
}

/**
 * Materiales PBR compartidos por toda la Kombi.
 * Se crean una sola vez y se reutilizan entre mallas.
 */
export function useKombiMaterials(): KombiMaterials {
  const materials = useMemo<KombiMaterials>(() => {
    // Pintura verde PUDÚ: laca con clearcoat, como en la foto de referencia
    const paint = new THREE.MeshPhysicalMaterial({
      color: "#0e6a3f",
      roughness: 0.32,
      metalness: 0.08,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.1,
    });

    const paintInner = new THREE.MeshStandardMaterial({
      color: "#0b5030",
      roughness: 0.7,
      metalness: 0.05,
    });

    const cream = new THREE.MeshStandardMaterial({
      color: "#f4f0e6",
      roughness: 0.35,
      metalness: 0.05,
    });

    const chrome = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.12,
      metalness: 1,
      envMapIntensity: 1.4,
    });

    const glass = new THREE.MeshPhysicalMaterial({
      color: "#9fc2c4",
      roughness: 0.06,
      metalness: 0,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false,
      envMapIntensity: 1.3,
    });

    const rubber = new THREE.MeshStandardMaterial({
      color: "#161616",
      roughness: 0.92,
    });

    const matte = new THREE.MeshStandardMaterial({
      color: "#23262a",
      roughness: 0.8,
    });

    const darkCavity = new THREE.MeshStandardMaterial({
      color: "#0c0e10",
      roughness: 0.95,
      side: THREE.BackSide,
    });

    const wood = new THREE.MeshStandardMaterial({
      color: "#8a6a46",
      roughness: 0.6,
    });

    const fabric = new THREE.MeshStandardMaterial({
      color: "#31423a",
      roughness: 0.95,
    });

    const acoustic = new THREE.MeshStandardMaterial({
      color: "#20262a",
      roughness: 1,
    });

    // Fuera del rango [0,1] + toneMapped:false → alimenta el bloom
    const led = new THREE.MeshBasicMaterial({ toneMapped: false });
    led.color.setRGB(1.4, 3.2, 2.0);

    const amber = new THREE.MeshStandardMaterial({
      color: "#e08c2a",
      roughness: 0.3,
      emissive: "#7a3d00",
      emissiveIntensity: 0.4,
    });

    const lens = new THREE.MeshStandardMaterial({
      color: "#fdf8e7",
      roughness: 0.15,
      emissive: "#fff3c4",
      emissiveIntensity: 0.25,
    });

    return {
      paint,
      paintInner,
      cream,
      chrome,
      glass,
      rubber,
      matte,
      darkCavity,
      wood,
      fabric,
      acoustic,
      led,
      amber,
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
