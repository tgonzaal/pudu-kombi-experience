"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { B, Decal } from "./parts";
import { DIM } from "./constants";
import type { KombiMaterials } from "./materials";
import type { BrandTextures } from "./textures";

/**
 * Panel inferior lateral (zócalo + guardabarros) con los arcos de rueda
 * recortados mediante una forma extruida.
 */
function useFenderGeometry() {
  const geometry = useMemo(() => {
    const { halfL, rockerBottom, doorBottom, axleX, archR, archCY } = DIM;
    const shape = new THREE.Shape();
    shape.moveTo(-halfL, rockerBottom);
    // Arco trasero
    shape.lineTo(-axleX - archR, rockerBottom);
    shape.absarc(-axleX, archCY, archR, Math.PI, 0, true);
    // Arco delantero
    shape.lineTo(axleX - archR, rockerBottom);
    shape.absarc(axleX, archCY, archR, Math.PI, 0, true);
    shape.lineTo(halfL, rockerBottom);
    shape.lineTo(halfL, doorBottom);
    shape.lineTo(-halfL, doorBottom);
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, {
      depth: DIM.t,
      bevelEnabled: false,
    });
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

function Bumper({ x, m }: { x: number; m: KombiMaterials }) {
  const dir = Math.sign(x);
  return (
    <group>
      <RoundedBox
        args={[0.14, 0.18, 1.94]}
        radius={0.04}
        position={[x, 0.52, 0]}
        material={m.cream}
        castShadow
        receiveShadow
      />
      <B s={[0.35, 0.18, 0.1]} p={[x - dir * 0.14, 0.52, 0.92]} m={m.cream} />
      <B s={[0.35, 0.18, 0.1]} p={[x - dir * 0.14, 0.52, -0.92]} m={m.cream} />
    </group>
  );
}

function Headlight({ z, m }: { z: number; m: KombiMaterials }) {
  return (
    <group position={[2.21, 1.02, z]}>
      <mesh castShadow material={m.chrome} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.14, 0.14, 0.05, 24]} />
      </mesh>
      <mesh
        material={m.lens}
        rotation={[0, 0, Math.PI / 2]}
        position={[0.015, 0, 0]}
      >
        <cylinderGeometry args={[0.115, 0.115, 0.05, 24]} />
      </mesh>
    </group>
  );
}

/** Rejillas de ventilación del motor en los pilares traseros. */
function Louvres({ z, m }: { z: number; m: KombiMaterials }) {
  return (
    <group>
      {[0, 1, 2, 3, 4].map((i) => (
        <B
          key={i}
          s={[0.28, 0.028, 0.02]}
          p={[-1.9, 1.5 + i * 0.052, z]}
          m={m.matte}
        />
      ))}
    </group>
  );
}

/** Carrocería fija: paneles, ventanas, techo, frente, trasera y marca. */
export function Body({ m, tex }: { m: KombiMaterials; tex: BrandTextures }) {
  const fender = useFenderGeometry();
  const glassH = 0.44;
  const glassY = 1.56;

  return (
    <group>
      {/* Zócalos con arcos de rueda (izquierda y derecha) */}
      <mesh
        geometry={fender}
        material={m.paint}
        position={[0, 0, -DIM.halfW]}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={fender}
        material={m.paint}
        position={[0, 0, DIM.halfW - DIM.t]}
        castShadow
        receiveShadow
      />

      {/* Paneles de cintura — lado izquierdo (sin puerta corrediza) */}
      <B s={[3.25, 0.54, 0.05]} p={[-0.575, 1.05, -0.835]} m={m.paint} />
      <B s={[0.35, 0.54, 0.05]} p={[2.025, 1.05, -0.835]} m={m.paint} />

      {/* Paneles de cintura — lado derecho (deja el vano corredizo) */}
      <B s={[2.22, 0.54, 0.05]} p={[-1.09, 1.05, 0.835]} m={m.paint} />
      <B s={[0.35, 0.54, 0.05]} p={[2.025, 1.05, 0.835]} m={m.paint} />
      {/* Pilar B derecho */}
      <B s={[0.08, 1.02, 0.05]} p={[1.01, 1.29, 0.835]} m={m.paint} />

      {/* Banda de ventanas — izquierda: 3 ventanas fijas */}
      <mesh material={m.glass} position={[-0.56, glassY, -0.83]}>
        <boxGeometry args={[3.18, glassH, 0.02]} />
      </mesh>
      <B s={[0.07, 0.48, 0.05]} p={[-1.15, glassY, -0.835]} m={m.paint} />
      <B s={[0.07, 0.48, 0.05]} p={[-0.1, glassY, -0.835]} m={m.paint} />

      {/* Banda de ventanas — derecha trasera: 2 ventanas fijas */}
      <mesh material={m.glass} position={[-1.075, glassY, 0.83]}>
        <boxGeometry args={[2.15, glassH, 0.02]} />
      </mesh>
      <B s={[0.07, 0.48, 0.05]} p={[-1.1, glassY, 0.835]} m={m.paint} />

      {/* Ventanillas delanteras fijas + pilares A */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh material={m.glass} position={[2.0, glassY, s * 0.83]}>
            <boxGeometry args={[0.26, glassH, 0.02]} />
          </mesh>
          <B s={[0.06, 0.48, 0.05]} p={[1.86, glassY, s * 0.835]} m={m.paint} />
          <B s={[0.08, 0.48, 0.05]} p={[2.16, glassY, s * 0.835]} m={m.paint} />
        </group>
      ))}

      {/* Rieles superiores perimetrales */}
      <B s={[4.4, 0.14, 0.05]} p={[0, 1.87, -0.835]} m={m.paint} />
      <B s={[4.4, 0.14, 0.05]} p={[0, 1.87, 0.835]} m={m.paint} />
      <B s={[0.06, 0.14, 1.72]} p={[2.2, 1.87, 0]} m={m.paint} />
      <B s={[0.06, 0.14, 1.72]} p={[-2.2, 1.87, 0]} m={m.paint} />

      {/* Techo */}
      <RoundedBox
        args={[4.44, 0.18, 1.76]}
        radius={0.08}
        position={[0, 1.99, 0]}
        material={m.paint}
        castShadow
        receiveShadow
      />

      {/* ——— Frente ——— */}
      <B s={[0.06, 0.94, 1.72]} p={[2.2, 0.85, 0]} m={m.paint} />
      {/* Parabrisas dividido */}
      <mesh material={m.glass} position={[2.19, glassY, 0.42]}>
        <boxGeometry args={[0.02, glassH, 0.76]} />
      </mesh>
      <mesh material={m.glass} position={[2.19, glassY, -0.42]}>
        <boxGeometry args={[0.02, glassH, 0.76]} />
      </mesh>
      <B s={[0.05, 0.48, 0.08]} p={[2.2, glassY, 0]} m={m.paint} />
      {/* Limpiaparabrisas */}
      <B
        s={[0.02, 0.4, 0.03]}
        p={[2.22, 1.4, -0.3]}
        m={m.matte}
        r={[0.5, 0, 0]}
      />
      <B
        s={[0.02, 0.4, 0.03]}
        p={[2.22, 1.4, 0.25]}
        m={m.matte}
        r={[0.5, 0, 0]}
      />

      <Headlight z={0.52} m={m} />
      <Headlight z={-0.52} m={m} />

      {/* Insignia PUDÚ (reemplaza el logo VW de la referencia) */}
      <mesh
        material={m.cream}
        rotation={[0, 0, Math.PI / 2]}
        position={[2.225, 1.05, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.16, 0.16, 0.035, 32]} />
      </mesh>
      <Decal
        tex={tex.logoGreen}
        w={0.24}
        h={0.24}
        p={[2.245, 1.05, 0]}
        r={[0, Math.PI / 2, 0]}
      />

      {/* Intermitentes */}
      <B s={[0.03, 0.07, 0.16]} p={[2.23, 0.68, 0.55]} m={m.amber} />
      <B s={[0.03, 0.07, 0.16]} p={[2.23, 0.68, -0.55]} m={m.amber} />

      <Bumper x={2.26} m={m} />

      {/* ——— Trasera (marco alrededor del portón y la tapa del motor) ——— */}
      <B s={[0.06, 0.12, 1.72]} p={[-2.2, 0.44, 0]} m={m.paint} />
      <B s={[0.05, 1.3, 0.16]} p={[-2.2, 1.15, 0.78]} m={m.paint} />
      <B s={[0.05, 1.3, 0.16]} p={[-2.2, 1.15, -0.78]} m={m.paint} />
      {/* Luces traseras */}
      <B s={[0.03, 0.16, 0.1]} p={[-2.23, 1.0, 0.78]} m={m.amber} />
      <B s={[0.03, 0.16, 0.1]} p={[-2.23, 1.0, -0.78]} m={m.amber} />
      <Bumper x={-2.26} m={m} />

      <Louvres z={-0.875} m={m} />
      <Louvres z={0.875} m={m} />

      {/* ——— Gráfica de marca (como la foto de referencia) ——— */}
      {/* Lado izquierdo: lockup completo */}
      <Decal
        tex={tex.wordmark}
        w={1.36}
        h={0.68}
        p={[0.42, 0.97, -0.868]}
        r={[0, Math.PI, 0]}
      />
      <Decal
        tex={tex.logoWhite}
        w={0.72}
        h={0.72}
        p={[-1.28, 0.97, -0.868]}
        r={[0, Math.PI, 0]}
      />
      {/* Lado derecho: wordmark sobre el panel trasero */}
      <Decal tex={tex.wordmark} w={0.9} h={0.45} p={[-1.2, 1.02, 0.868]} />
    </group>
  );
}
