"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useBrandTextures } from "@/components/experience/kombi/textures";
import { Decal } from "@/components/experience/kombi/parts";
import { useT2Materials, type T2Materials } from "./materials";

/**
 * Volkswagen Type 2 T2 "Bay Window" procedural, orientada a fidelidad:
 * carrocería de una sola pieza extruida con bordes redondeados,
 * parabrisas panorámico de una pieza (característico de la segunda
 * generación), líneas de chapa, faros redondos con bisel cromado,
 * parachoques envolventes y la identidad PUDÚ de la referencia.
 *
 * Frente hacia +x. Piso en y=0. Largo ≈ 4.5 m, ancho ≈ 1.72 m.
 */

const ARCH_X = 1.44; // ejes
const ARCH_R = 0.42;
const BODY_BOTTOM = 0.35;

/** Silueta lateral del bus, extruida a lo ancho con bisel redondeado. */
function useBodyGeometry() {
  const geometry = useMemo(() => {
    const s = new THREE.Shape();

    s.moveTo(-2.25, BODY_BOTTOM);
    // Bajos con arcos de rueda
    s.lineTo(-ARCH_X - ARCH_R, BODY_BOTTOM);
    s.absarc(-ARCH_X, BODY_BOTTOM, ARCH_R, Math.PI, 0, true);
    s.lineTo(ARCH_X - ARCH_R, BODY_BOTTOM);
    s.absarc(ARCH_X, BODY_BOTTOM, ARCH_R, Math.PI, 0, true);
    s.lineTo(2.25, BODY_BOTTOM);
    // Frontal: leve panza característica y entrada al parabrisas
    s.quadraticCurveTo(2.33, 0.95, 2.26, 1.42);
    // Rake del parabrisas
    s.lineTo(2.12, 1.78);
    // Esquina frontal del techo
    s.quadraticCurveTo(2.08, 1.97, 1.84, 1.97);
    // Techo
    s.lineTo(-1.9, 1.97);
    // Esquina trasera redondeada
    s.quadraticCurveTo(-2.24, 1.94, -2.25, 1.5);
    s.closePath();

    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 1.6,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.058,
      bevelSegments: 5,
      curveSegments: 24,
    });
    geo.translate(0, 0, -0.8); // centrado: caras planas en z ≈ ±0.86
    return geo;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

/** Ventana lateral con burlete de goma y vidrio tintado. */
function SideWindow({
  x,
  w,
  side,
  m,
  y = 1.575,
  h = 0.4,
}: {
  x: number;
  w: number;
  side: -1 | 1;
  m: T2Materials;
  y?: number;
  h?: number;
}) {
  return (
    <group position={[x, y, side * 0.868]}>
      <mesh material={m.gasket}>
        <boxGeometry args={[w + 0.05, h + 0.05, 0.012]} />
      </mesh>
      <mesh material={m.glass} position={[0, 0, side * 0.004]}>
        <boxGeometry args={[w, h, 0.012]} />
      </mesh>
    </group>
  );
}

/** Línea de chapa (junta de puerta o tapa). */
function Seam({
  p,
  s,
  r,
  m,
}: {
  p: [number, number, number];
  s: [number, number, number];
  r?: [number, number, number];
  m: T2Materials;
}) {
  return (
    <mesh material={m.seam} position={p} rotation={r}>
      <boxGeometry args={s} />
    </mesh>
  );
}

function Headlight({ z, m }: { z: number; m: T2Materials }) {
  return (
    <group position={[2.283, 1.02, z]} rotation={[0, 0, Math.PI / 2]}>
      <mesh material={m.chrome}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 28]} />
      </mesh>
      <mesh material={m.lens} position={[-0.012, 0, 0]}>
        <sphereGeometry args={[0.125, 24, 16]} />
      </mesh>
    </group>
  );
}

function Bumper({ x, m }: { x: number; m: T2Materials }) {
  const dir = Math.sign(x);
  return (
    <group>
      <mesh material={m.cream} position={[x, 0.5, 0]} castShadow>
        <boxGeometry args={[0.13, 0.2, 1.98]} />
      </mesh>
      {[1, -1].map((sz) => (
        <mesh
          key={sz}
          material={m.cream}
          position={[x - dir * 0.22, 0.5, sz * 0.95]}
          castShadow
        >
          <boxGeometry args={[0.48, 0.2, 0.12]} />
        </mesh>
      ))}
    </group>
  );
}

function Wheel({ x, z, m }: { x: number; z: number; m: T2Materials }) {
  return (
    <group position={[x, 0.34, z]}>
      {/* Neumático clásico */}
      <mesh material={m.rubber} castShadow>
        <torusGeometry args={[0.245, 0.095, 14, 32]} />
      </mesh>
      {/* Llanta y tapacubos cromado */}
      <mesh material={m.cream} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.13, 24]} />
      </mesh>
      <mesh
        material={m.chrome}
        position={[0, 0, Math.sign(z) * 0.075]}
        scale={[1, 1, 0.35]}
      >
        <sphereGeometry args={[0.15, 24, 16]} />
      </mesh>
    </group>
  );
}

/** Espejo retrovisor redondo con brazo cromado. */
function Mirror({ side, m }: { side: -1 | 1; m: T2Materials }) {
  return (
    <group position={[2.02, 1.7, side * 0.9]}>
      <mesh
        material={m.chrome}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, side * 0.06]}
      >
        <cylinderGeometry args={[0.012, 0.012, 0.14, 8]} />
      </mesh>
      <mesh
        material={m.chrome}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0.02, side * 0.14]}
      >
        <cylinderGeometry args={[0.085, 0.085, 0.016, 20]} />
      </mesh>
    </group>
  );
}

export function ProceduralT2() {
  const m = useT2Materials();
  const tex = useBrandTextures();
  const body = useBodyGeometry();

  // Ventanas laterales: puerta + 3 paños (los pilares son la propia chapa)
  const sideWindows: Array<{ x: number; w: number }> = [
    { x: 1.63, w: 0.68 }, // ventana de puerta delantera
    { x: 0.74, w: 0.82 },
    { x: -0.25, w: 0.82 },
    { x: -1.34, w: 0.92 },
  ];

  return (
    <group>
      {/* Carrocería de una pieza */}
      <mesh geometry={body} material={m.paint} castShadow receiveShadow />

      {/* Bajos oscurecidos y ejes */}
      <mesh material={m.dark} position={[0, 0.4, 0]}>
        <boxGeometry args={[4.2, 0.24, 1.15]} />
      </mesh>
      {[ARCH_X, -ARCH_X].map((x) => (
        <mesh
          key={x}
          material={m.dark}
          position={[x, 0.34, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.04, 0.04, 1.4, 10]} />
        </mesh>
      ))}

      {/* Parabrisas panorámico de una pieza (Bay Window) */}
      <group position={[2.2, 1.6, 0]} rotation={[0, 0, -0.37]}>
        <mesh material={m.gasket}>
          <boxGeometry args={[0.014, 0.43, 1.48]} />
        </mesh>
        <mesh material={m.glass} position={[0.005, 0, 0]}>
          <boxGeometry args={[0.014, 0.38, 1.42]} />
        </mesh>
        {/* Limpiaparabrisas */}
        {[-0.28, 0.3].map((z) => (
          <mesh
            key={z}
            material={m.dark}
            position={[0.02, -0.1, z]}
            rotation={[0.5, 0, 0]}
          >
            <boxGeometry args={[0.014, 0.34, 0.02]} />
          </mesh>
        ))}
      </group>

      {/* Rejilla de ventilación sobre el parabrisas */}
      {[-0.5, -0.3, -0.1, 0.1, 0.3, 0.5].map((z) => (
        <mesh
          key={z}
          material={m.dark}
          position={[2.06, 1.9, z]}
          rotation={[0, 0, -0.5]}
        >
          <boxGeometry args={[0.012, 0.09, 0.14]} />
        </mesh>
      ))}

      {/* Ventanas laterales */}
      {sideWindows.map(({ x, w }) => (
        <group key={x}>
          <SideWindow x={x} w={w} side={-1} m={m} />
          <SideWindow x={x} w={w} side={1} m={m} />
        </group>
      ))}

      {/* Luneta trasera */}
      <group position={[-2.265, 1.55, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh material={m.gasket}>
          <boxGeometry args={[1.12, 0.38, 0.014]} />
        </mesh>
        <mesh material={m.glass} position={[0, 0, -0.004]}>
          <boxGeometry args={[1.06, 0.33, 0.014]} />
        </mesh>
      </group>

      {/* Líneas de chapa: puertas delanteras (ambos lados) */}
      {([-1, 1] as const).map((side) => (
        <group key={side}>
          <Seam p={[2.04, 0.88, side * 0.8655]} s={[0.014, 1.0, 0.012]} m={m} />
          <Seam p={[1.22, 0.88, side * 0.8655]} s={[0.014, 1.0, 0.012]} m={m} />
          <Seam
            p={[1.63, 0.39, side * 0.8655]}
            s={[0.83, 0.014, 0.012]}
            m={m}
          />
          {/* Manilla cromada */}
          <mesh material={m.chrome} position={[1.34, 1.16, side * 0.872]}>
            <boxGeometry args={[0.16, 0.028, 0.024]} />
          </mesh>
        </group>
      ))}

      {/* Puerta corrediza: solo lado derecho */}
      <Seam p={[0.24, 0.88, 0.8655]} s={[0.014, 1.0, 0.012]} m={m} />
      <Seam p={[-0.95, 0.88, 0.8655]} s={[0.014, 1.0, 0.012]} m={m} />
      <Seam p={[-0.355, 0.39, 0.8655]} s={[1.2, 0.014, 0.012]} m={m} />
      <Seam p={[-0.355, 1.37, 0.8655]} s={[1.2, 0.014, 0.012]} m={m} />
      <mesh material={m.chrome} position={[0.08, 1.16, 0.872]}>
        <boxGeometry args={[0.16, 0.028, 0.024]} />
      </mesh>

      {/* Rejillas de motor en los pilares traseros */}
      {([-1, 1] as const).map((side) =>
        [0, 1, 2, 3, 4, 5, 6].map((i) => (
          <mesh
            key={`${side}-${i}`}
            material={m.dark}
            position={[-2.06 + i * 0.055, 1.62, side * 0.8655]}
          >
            <boxGeometry args={[0.02, 0.17, 0.012]} />
          </mesh>
        )),
      )}

      {/* ——— Frente ——— */}
      <Headlight z={0.52} m={m} />
      <Headlight z={-0.52} m={m} />
      {/* Intermitentes */}
      {[0.56, -0.56].map((z) => (
        <mesh key={z} material={m.amber} position={[2.3, 0.74, z]}>
          <boxGeometry args={[0.03, 0.08, 0.17]} />
        </mesh>
      ))}
      {/* Insignia PUDÚ (el emblema VW es marca registrada) */}
      <mesh
        material={m.cream}
        rotation={[0, 0, Math.PI / 2]}
        position={[2.305, 1.04, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.15, 0.15, 0.03, 32]} />
      </mesh>
      <Decal
        tex={tex.logoGreen}
        w={0.22}
        h={0.22}
        p={[2.323, 1.04, 0]}
        r={[0, Math.PI / 2, 0]}
      />
      <Bumper x={2.34} m={m} />
      <Mirror side={-1} m={m} />
      <Mirror side={1} m={m} />

      {/* ——— Trasera ——— */}
      {/* Juntas de la tapa del motor y el portón */}
      <Seam p={[-2.262, 1.32, 0]} s={[0.012, 0.014, 1.3]} m={m} />
      <Seam p={[-2.262, 0.55, 0]} s={[0.012, 0.014, 1.3]} m={m} />
      <mesh material={m.chrome} position={[-2.27, 0.93, 0]}>
        <boxGeometry args={[0.024, 0.03, 0.14]} />
      </mesh>
      {/* Pilotos traseros */}
      {[0.62, -0.62].map((z) => (
        <group key={z} position={[-2.265, 1.05, z]}>
          <mesh material={m.amber} position={[0, 0.07, 0]}>
            <boxGeometry args={[0.03, 0.12, 0.13]} />
          </mesh>
          <mesh material={m.red} position={[0, -0.07, 0]}>
            <boxGeometry args={[0.03, 0.12, 0.13]} />
          </mesh>
        </group>
      ))}
      {/* Escape */}
      <mesh
        material={m.chrome}
        position={[-2.3, 0.3, 0.45]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.032, 0.032, 0.18, 12]} />
      </mesh>
      <Bumper x={-2.34} m={m} />

      {/* Ruedas */}
      <Wheel x={ARCH_X} z={0.7} m={m} />
      <Wheel x={ARCH_X} z={-0.7} m={m} />
      <Wheel x={-ARCH_X} z={0.7} m={m} />
      <Wheel x={-ARCH_X} z={-0.7} m={m} />

      {/* ——— Identidad PUDÚ (imagen de referencia) ——— */}
      {/* Lado izquierdo: texto adelante, ilustración al final */}
      <Decal
        tex={tex.wordmark}
        w={1.3}
        h={0.65}
        p={[0.5, 0.94, -0.869]}
        r={[0, Math.PI, 0]}
      />
      <Decal
        tex={tex.logoWhite}
        w={0.78}
        h={0.78}
        p={[-1.3, 0.94, -0.869]}
        r={[0, Math.PI, 0]}
      />
      {/* Lado derecho, espejado */}
      <Decal tex={tex.wordmark} w={1.3} h={0.65} p={[0.5, 0.94, 0.869]} />
      <Decal tex={tex.logoWhite} w={0.78} h={0.78} p={[-1.3, 0.94, 0.869]} />
    </group>
  );
}
