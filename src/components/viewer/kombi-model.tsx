"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import {
  APPLY_PUDU_PAINT,
  DRACO_DECODER_PATH,
  KOMBI_MODEL_URL,
  PAINT_MATERIAL_PATTERNS,
  PUDU_GREEN,
  TARGET_LENGTH,
} from "./config";

function isPaintMaterial(material: THREE.Material) {
  return PAINT_MATERIAL_PATTERNS.some((p) => p.test(material.name));
}

/** Pintura automotriz PBR: laca verde PUDÚ con clearcoat. */
function makePuduPaint(name: string) {
  const paint = new THREE.MeshPhysicalMaterial({
    name,
    color: PUDU_GREEN,
    metalness: 0.1,
    roughness: 0.35,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.2,
  });
  return paint;
}

/**
 * Carga el GLB de la Volkswagen T2 (con Draco), lo normaliza a la
 * escala real del vehículo, lo apoya en el piso y prepara sombras
 * y materiales. No altera la geometría original.
 */
export function KombiModel() {
  const { scene } = useGLTF(KOMBI_MODEL_URL, DRACO_DECODER_PATH);

  const { scale, position } = useMemo(() => {
    // Sombras + calidad de texturas
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];

        materials.forEach((mat, i) => {
          if (mat instanceof THREE.MeshStandardMaterial && mat.map) {
            mat.map.anisotropy = 8;
          }
          if (APPLY_PUDU_PAINT && isPaintMaterial(mat)) {
            const paint = makePuduPaint(mat.name);
            if (Array.isArray(child.material)) child.material[i] = paint;
            else child.material = paint;
          }
        });
      }
    });

    // Normaliza: largo real de la T2, centrado en origen, sobre y=0
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const length = Math.max(size.x, size.z) || 1;
    const s = TARGET_LENGTH / length;

    return {
      scale: s,
      position: [-center.x * s, -box.min.y * s, -center.z * s] as [
        number,
        number,
        number,
      ],
    };
  }, [scene]);

  return <primitive object={scene} scale={scale} position={position} />;
}
