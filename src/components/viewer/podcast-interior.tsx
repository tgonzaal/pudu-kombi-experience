"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { useBrandTextures } from "@/components/experience/kombi/textures";

/**
 * Set de podcast en la cabina trasera de la Kombi (visible al "entrar").
 * Dos butacas enfrentadas, mesa baja con micrófonos, pantalla ON AIR,
 * paneles acústicos y luz cálida. Todo procedural, sin tocar el GLB.
 *
 * El frente del vehículo apunta a +z: el grupo completo se rota 180°
 * para que el set quede en la cabina trasera (z < 0).
 */

const FLOOR_Y = 0.52;

interface Mats {
  wood: THREE.MeshStandardMaterial;
  matte: THREE.MeshStandardMaterial;
  fabric: THREE.MeshStandardMaterial;
  fabricLight: THREE.MeshStandardMaterial;
  acoustic: THREE.MeshStandardMaterial;
  chrome: THREE.MeshStandardMaterial;
  led: THREE.MeshStandardMaterial;
  rug: THREE.MeshStandardMaterial;
  cream: THREE.MeshStandardMaterial;
  oak: THREE.MeshStandardMaterial;
  leather: THREE.MeshStandardMaterial;
  leatherDark: THREE.MeshStandardMaterial;
}

function useMats(): Mats {
  const mats = useMemo<Mats>(
    () => ({
      wood: new THREE.MeshStandardMaterial({
        color: "#8a6a46",
        roughness: 0.55,
      }),
      matte: new THREE.MeshStandardMaterial({
        color: "#23262a",
        roughness: 0.8,
      }),
      fabric: new THREE.MeshStandardMaterial({
        color: "#2f4238",
        roughness: 0.95,
      }),
      fabricLight: new THREE.MeshStandardMaterial({
        color: "#c9c0ae",
        roughness: 0.95,
      }),
      acoustic: new THREE.MeshStandardMaterial({
        color: "#1e2326",
        roughness: 1,
      }),
      chrome: new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.15,
        metalness: 1,
      }),
      led: new THREE.MeshStandardMaterial({
        color: "#9ff0c0",
        emissive: "#4ade80",
        emissiveIntensity: 2.2,
        toneMapped: false,
      }),
      rug: new THREE.MeshStandardMaterial({
        color: "#1c211e",
        roughness: 1,
      }),
      cream: new THREE.MeshStandardMaterial({
        color: "#e8e1d3",
        roughness: 0.9,
      }),
      oak: new THREE.MeshStandardMaterial({
        color: "#a07c50",
        roughness: 0.5,
      }),
      leather: new THREE.MeshStandardMaterial({
        color: "#8c5a33",
        roughness: 0.55,
      }),
      leatherDark: new THREE.MeshStandardMaterial({
        color: "#5e3c22",
        roughness: 0.6,
      }),
    }),
    [],
  );

  useEffect(() => {
    return () => {
      Object.values(mats).forEach((m) => m.dispose());
    };
  }, [mats]);

  return mats;
}

/**
 * Forro interior profesional: tapiza paredes, cielo y piso para cubrir
 * el reverso de la gráfica exterior (el GLB es de casco delgado).
 * Coordenadas locales del grupo rotado: +z local = trasera del vehículo.
 */
function CabinLining({ m }: { m: Mats }) {
  return (
    <group>
      {/* Piso de madera */}
      <mesh material={m.oak} position={[0, 0.515, 0.08]}>
        <boxGeometry args={[1.46, 0.025, 3.6]} />
      </mesh>

      {/* Zócalo tapizado en ambas paredes, hasta la línea de ventanas */}
      {[-0.735, 0.735].map((x) => (
        <group key={x}>
          <RoundedBox
            args={[0.025, 0.78, 3.65]}
            radius={0.01}
            position={[x, 0.93, 0.08]}
            material={m.cream}
          />
          {/* Moldura de madera como remate superior */}
          <mesh material={m.oak} position={[x, 1.335, 0.08]}>
            <boxGeometry args={[0.03, 0.045, 3.65]} />
          </mesh>
        </group>
      ))}

      {/* Pared trasera (interior del portón) */}
      <RoundedBox
        args={[1.44, 0.78, 0.025]}
        radius={0.01}
        position={[0, 0.93, 1.92]}
        material={m.cream}
      />
      <mesh material={m.oak} position={[0, 1.335, 1.92]}>
        <boxGeometry args={[1.44, 0.045, 0.03]} />
      </mesh>

      {/* Cielo (headliner) */}
      <mesh material={m.cream} position={[0, 1.79, 0.08]}>
        <boxGeometry args={[1.42, 0.02, 3.6]} />
      </mesh>
    </group>
  );
}

/** Asiento delantero clásico de Kombi: butaca de eco-cuero sobre base. */
function CabSeat({ x, width, m }: { x: number; width: number; m: Mats }) {
  const z = -1.42; // cabina delantera (en local, el frente es -z)
  return (
    <group position={[x, 0, z]}>
      {/* Base / pedestal */}
      <mesh material={m.matte} position={[0, 0.675, 0]}>
        <boxGeometry args={[width - 0.04, 0.31, 0.48]} />
      </mesh>
      {/* Cojín */}
      <RoundedBox
        args={[width, 0.13, 0.5]}
        radius={0.04}
        position={[0, 0.9, 0]}
        material={m.leather}
      />
      {/* Respaldo bajo, levemente reclinado */}
      <RoundedBox
        args={[width, 0.56, 0.11]}
        radius={0.04}
        position={[0, 1.2, 0.24]}
        rotation={[0.14, 0, 0]}
        material={m.leather}
      />
      {/* Costuras horizontales del tapiz */}
      {[1.08, 1.22, 1.36].map((y) => (
        <mesh
          key={y}
          material={m.leatherDark}
          position={[0, y, 0.185 + (y - 1.08) * 0.043]}
          rotation={[0.14, 0, 0]}
        >
          <boxGeometry args={[width + 0.005, 0.012, 0.1]} />
        </mesh>
      ))}
    </group>
  );
}

/** Butaca acolchada compacta. */
function Seat({ z, facing, m }: { z: number; facing: 1 | -1; m: Mats }) {
  return (
    <group position={[0, 0, z]}>
      <RoundedBox
        args={[0.52, 0.16, 0.46]}
        radius={0.04}
        position={[0, FLOOR_Y + 0.17, 0]}
        material={m.matte}
      />
      <RoundedBox
        args={[0.5, 0.1, 0.44]}
        radius={0.04}
        position={[0, FLOOR_Y + 0.3, 0]}
        material={m.fabric}
      />
      {/* Respaldo */}
      <RoundedBox
        args={[0.5, 0.4, 0.1]}
        radius={0.04}
        position={[0, FLOOR_Y + 0.52, -facing * 0.2]}
        rotation={[facing * 0.16, 0, 0]}
        material={m.fabric}
      />
    </group>
  );
}

/** Micrófono de sobremesa con brazo corto. */
function Mic({ x, z, m }: { x: number; z: number; m: Mats }) {
  return (
    <group position={[x, FLOOR_Y + 0.42, z]}>
      <mesh material={m.matte}>
        <cylinderGeometry args={[0.035, 0.045, 0.02, 14]} />
      </mesh>
      <mesh material={m.matte} position={[0, 0.09, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.008, 0.008, 0.18, 8]} />
      </mesh>
      <mesh
        material={m.matte}
        position={[0.045, 0.17, 0]}
        rotation={[0, 0, 1.3]}
      >
        <capsuleGeometry args={[0.03, 0.06, 4, 12]} />
      </mesh>
      <mesh material={m.led} position={[0.045, 0.17, 0]} rotation={[0, 0, 1.3]}>
        <torusGeometry args={[0.036, 0.005, 8, 20]} />
      </mesh>
    </group>
  );
}

export function PodcastInterior() {
  const m = useMats();
  const tex = useBrandTextures();

  return (
    <group rotation={[0, Math.PI, 0]}>
      {/* Forro interior profesional */}
      <CabinLining m={m} />

      {/* Asientos de cabina: butaca del chofer + banqueta del copiloto */}
      <CabSeat x={-0.42} width={0.5} m={m} />
      <CabSeat x={0.27} width={0.72} m={m} />

      {/* Alfombra */}
      <mesh material={m.rug} position={[0, FLOOR_Y + 0.005, 1.05]}>
        <boxGeometry args={[1.3, 0.012, 1.15]} />
      </mesh>

      {/* Mesa baja */}
      <group position={[0, 0, 1.02]}>
        <mesh material={m.wood} position={[0, FLOOR_Y + 0.4, 0]}>
          <cylinderGeometry args={[0.27, 0.27, 0.035, 28]} />
        </mesh>
        <mesh material={m.matte} position={[0, FLOOR_Y + 0.2, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.38, 12]} />
        </mesh>
        <mesh material={m.matte} position={[0, FLOOR_Y + 0.015, 0]}>
          <cylinderGeometry args={[0.16, 0.18, 0.025, 20]} />
        </mesh>
      </group>

      {/* Butacas enfrentadas */}
      <Seat z={0.45} facing={1} m={m} />
      <Seat z={1.6} facing={-1} m={m} />
      {/* Cojines de acento */}
      <RoundedBox
        args={[0.18, 0.14, 0.06]}
        radius={0.03}
        position={[-0.16, FLOOR_Y + 0.42, 0.28]}
        rotation={[0.35, 0.2, 0]}
        material={m.fabricLight}
      />
      <RoundedBox
        args={[0.18, 0.14, 0.06]}
        radius={0.03}
        position={[0.17, FLOOR_Y + 0.42, 1.78]}
        rotation={[-0.3, -0.25, 0]}
        material={m.fabricLight}
      />

      {/* Micrófonos sobre la mesa */}
      <Mic x={-0.1} z={0.9} m={m} />
      <Mic x={0.1} z={1.14} m={m} />

      {/* Pantalla ON AIR en la pared izquierda */}
      <group position={[-0.68, 1.28, 1.02]} rotation={[0, Math.PI / 2, 0]}>
        <mesh material={m.matte}>
          <boxGeometry args={[0.52, 0.32, 0.03]} />
        </mesh>
        <mesh position={[0, 0, 0.017]}>
          <planeGeometry args={[0.48, 0.27]} />
          <meshBasicMaterial map={tex.screen} toneMapped={false} />
        </mesh>
      </group>

      {/* Paneles acústicos en la pared derecha */}
      {[0.55, 1.02, 1.49].map((z) =>
        [1.05, 1.45].map((y) => (
          <mesh
            key={`${z}-${y}`}
            material={m.acoustic}
            position={[0.72, y, z]}
            rotation={[0, -Math.PI / 2, 0]}
          >
            <boxGeometry args={[0.34, 0.3, 0.025]} />
          </mesh>
        )),
      )}

      {/* Tiras LED en el cielo */}
      <mesh material={m.led} position={[-0.58, 1.72, 1.05]}>
        <boxGeometry args={[0.02, 0.015, 1.5]} />
      </mesh>
      <mesh material={m.led} position={[0.58, 1.72, 1.05]}>
        <boxGeometry args={[0.02, 0.015, 1.5]} />
      </mesh>

      {/* Planta pequeña */}
      <group position={[0.52, 0, 1.82]}>
        <mesh material={m.matte} position={[0, FLOOR_Y + 0.07, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.13, 12]} />
        </mesh>
        <mesh position={[0, FLOOR_Y + 0.2, 0]}>
          <icosahedronGeometry args={[0.09, 0]} />
          <meshStandardMaterial color="#3f7d4e" roughness={0.9} flatShading />
        </mesh>
      </group>

      {/* Luz cálida del set (alcance corto: no afecta el exterior) */}
      <pointLight
        position={[0, 1.55, 1.0]}
        intensity={1.6}
        distance={2.6}
        decay={2}
        color="#ffdfb0"
      />
    </group>
  );
}
