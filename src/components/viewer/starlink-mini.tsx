"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

/**
 * Starlink Mini sobre el techo: panel plano de ~30 × 26 cm con
 * soporte bajo, apenas inclinado hacia el cielo.
 */
export function StarlinkMini({
  position = [0, 2.045, -0.35] as [number, number, number],
}) {
  const materials = useMemo(() => {
    return {
      panel: new THREE.MeshStandardMaterial({
        color: "#f4f5f2",
        roughness: 0.35,
        metalness: 0.05,
      }),
      base: new THREE.MeshStandardMaterial({
        color: "#c9cdcc",
        roughness: 0.55,
        metalness: 0.1,
      }),
      dark: new THREE.MeshStandardMaterial({
        color: "#3a3f42",
        roughness: 0.7,
      }),
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [materials]);

  return (
    <group position={position}>
      {/* Soporte bajo */}
      <mesh material={materials.dark} position={[0, 0.015, 0]}>
        <boxGeometry args={[0.2, 0.03, 0.16]} />
      </mesh>

      {/* Panel con leve inclinación */}
      <group position={[0, 0.045, 0]} rotation={[-0.12, 0, 0]}>
        <RoundedBox
          args={[0.3, 0.03, 0.26]}
          radius={0.012}
          material={materials.base}
          castShadow
        />
        {/* Cara superior blanca */}
        <RoundedBox
          args={[0.285, 0.012, 0.245]}
          radius={0.006}
          position={[0, 0.014, 0]}
          material={materials.panel}
          castShadow
        />
      </group>
    </group>
  );
}
