"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { Decal } from "./decals";
import {
  decalTextures,
  getDecalUniforms,
  patchMaterial,
  writePaint,
  writeUniforms,
} from "./decal-projection";
import { PAINT_BOTTOM_DEFAULT, PAINT_TOP_DEFAULT } from "./decals";
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
/** Carga las imágenes de las gráficas y avisa cuando llega alguna nueva. */
function useDecalTextures(decals: Decal[]) {
  const [version, bump] = useState(0);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let alive = true;
    decals
      .map((d) => d.src)
      .filter((src) => !decalTextures.has(src))
      .forEach((src) => {
        loader.load(src, (texture) => {
          if (!alive) {
            texture.dispose();
            return;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = 8;
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          decalTextures.set(src, texture);
          bump((n) => n + 1);
        });
      });

    return () => {
      alive = false;
    };
  }, [decals]);

  return version;
}

export function KombiModel({
  decals = [],
  paintTop = PAINT_TOP_DEFAULT,
  paintBottom = PAINT_BOTTOM_DEFAULT,
}: {
  decals?: Decal[];
  paintTop?: string;
  paintBottom?: string;
}) {
  const { scene } = useGLTF(KOMBI_MODEL_URL, DRACO_DECODER_PATH);
  const uniforms = getDecalUniforms();
  const version = useDecalTextures(decals);

  // El material se prepara una sola vez; los uniforms se refrescan al editar.
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        materials.forEach((m) => patchMaterial(m, uniforms));
      }
    });
  }, [scene, uniforms]);

  useEffect(() => {
    writeUniforms(uniforms, decals, decalTextures);
  }, [uniforms, decals, version]);

  useEffect(() => {
    writePaint(uniforms, paintTop, paintBottom);
  }, [uniforms, paintTop, paintBottom]);

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
