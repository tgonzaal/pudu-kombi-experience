"use client";

import { RoundedBox } from "@react-three/drei";
import { B } from "./parts";
import type { KombiMaterials } from "./materials";
import type { BrandTextures } from "./textures";

/** Micrófono de estudio sobre brazo articulado. */
function Mic({ x, m }: { x: number; m: KombiMaterials }) {
  return (
    <group position={[x, 1.145, -0.5]}>
      <mesh material={m.matte} position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.03, 16]} />
      </mesh>
      <mesh
        material={m.matte}
        position={[-0.02, 0.15, 0.03]}
        rotation={[0.35, 0, 0.25]}
      >
        <cylinderGeometry args={[0.012, 0.012, 0.3, 8]} />
      </mesh>
      <mesh
        material={m.matte}
        position={[-0.06, 0.29, 0.08]}
        rotation={[Math.PI / 2.6, 0, 0.4]}
      >
        <capsuleGeometry args={[0.045, 0.09, 4, 12]} />
      </mesh>
      <mesh
        material={m.led}
        position={[-0.06, 0.29, 0.08]}
        rotation={[Math.PI / 2.6, 0, 0.4]}
      >
        <torusGeometry args={[0.052, 0.007, 8, 24]} />
      </mesh>
    </group>
  );
}

function Stool({ x, m }: { x: number; m: KombiMaterials }) {
  return (
    <group position={[x, 0, 0.14]}>
      <mesh material={m.matte} position={[0, 0.745, 0]}>
        <cylinderGeometry args={[0.15, 0.16, 0.025, 20]} />
      </mesh>
      <mesh material={m.matte} position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 0.2, 12]} />
      </mesh>
      <mesh material={m.fabric} position={[0, 0.985, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.17, 0.07, 20]} />
      </mesh>
    </group>
  );
}

/** Grilla de paneles acústicos. */
function AcousticGrid({
  m,
  positions,
  rotation,
  size = 0.28,
}: {
  m: KombiMaterials;
  positions: [number, number, number][];
  rotation?: [number, number, number];
  size?: number;
}) {
  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} material={m.acoustic} position={p} rotation={rotation}>
          <boxGeometry args={[size, size, 0.025]} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Interior: estudio creativo móvil para grabar podcasts.
 * Escritorio, micrófonos, pantalla "ON AIR", paneles acústicos y LED.
 */
export function Interior({
  m,
  tex,
}: {
  m: KombiMaterials;
  tex: BrandTextures;
}) {
  return (
    <group>
      {/* Piso de madera + alfombra */}
      <B s={[4.3, 0.05, 1.62]} p={[0, 0.7, 0]} m={m.wood} />
      <B s={[2.1, 0.015, 1.15]} p={[-0.35, 0.735, 0.05]} m={m.acoustic} />

      {/* Cielo + tiras LED */}
      <B s={[4.2, 0.02, 1.5]} p={[0, 1.88, 0]} m={m.cream} castShadow={false} />
      <B
        s={[3.2, 0.02, 0.045]}
        p={[-0.3, 1.865, 0.58]}
        m={m.led}
        castShadow={false}
      />
      <B
        s={[3.2, 0.02, 0.045]}
        p={[-0.3, 1.865, -0.58]}
        m={m.led}
        castShadow={false}
      />

      {/* Luz cálida interior */}
      <pointLight
        position={[-0.4, 1.7, 0]}
        intensity={1.4}
        distance={4}
        decay={2}
        color="#ffe2b8"
      />

      {/* Mamparo trasero (backdrop del estudio) */}
      <B s={[0.04, 1.16, 1.6]} p={[-1.78, 1.28, 0]} m={m.paintInner} />
      <AcousticGrid
        m={m}
        rotation={[0, Math.PI / 2, 0]}
        positions={[-0.45, 0, 0.45].flatMap((z) =>
          [0.95, 1.28, 1.61].map(
            (y) => [-1.757, y, z] as [number, number, number],
          ),
        )}
      />
      {/* Cara trasera del mamparo, visible al abrir el portón */}
      <AcousticGrid
        m={m}
        rotation={[0, -Math.PI / 2, 0]}
        positions={[-0.45, 0, 0.45].flatMap((z) =>
          [1.25, 1.58].map((y) => [-1.803, y, z] as [number, number, number]),
        )}
      />

      {/* Baúl sobre el motor: repisa con equipos */}
      <B s={[0.38, 0.03, 1.4]} p={[-2.0, 1.02, 0]} m={m.matte} />
      <B s={[0.2, 0.22, 0.2]} p={[-2.0, 1.15, 0.45]} m={m.matte} />
      <B s={[0.2, 0.22, 0.2]} p={[-2.0, 1.15, -0.45]} m={m.matte} />

      {/* Vano del motor + motor bóxer estilizado */}
      <mesh material={m.darkCavity} position={[-1.98, 0.7, 0]}>
        <boxGeometry args={[0.42, 0.62, 1.44]} />
      </mesh>
      <B s={[0.3, 0.26, 0.5]} p={[-1.96, 0.56, 0]} m={m.matte} />
      <mesh
        material={m.chrome}
        position={[-1.85, 0.74, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.15, 0.15, 0.06, 24]} />
      </mesh>
      <mesh
        material={m.matte}
        position={[-1.94, 0.48, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[0.03, 0.03, 0.9, 10]} />
      </mesh>
      {[0.3, -0.3].map((z) => (
        <mesh
          key={z}
          material={m.matte}
          position={[-1.9, 0.62, z]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.06, 0.06, 0.12, 14]} />
        </mesh>
      ))}

      {/* ——— Estudio ——— */}
      {/* Escritorio contra la pared izquierda */}
      <B s={[2.3, 0.05, 0.5]} p={[-0.45, 1.12, -0.54]} m={m.wood} />
      <B s={[2.3, 0.36, 0.03]} p={[-0.45, 0.93, -0.77]} m={m.wood} />
      <B s={[0.05, 0.37, 0.45]} p={[-1.55, 0.91, -0.54]} m={m.matte} />
      <B s={[0.05, 0.37, 0.45]} p={[0.65, 0.91, -0.54]} m={m.matte} />

      {/* Monitor con pantalla ON AIR */}
      <B s={[0.05, 0.14, 0.06]} p={[-1.32, 1.2, -0.62]} m={m.matte} />
      <B s={[0.5, 0.32, 0.04]} p={[-1.32, 1.42, -0.63]} m={m.matte} />
      <mesh position={[-1.32, 1.42, -0.608]}>
        <planeGeometry args={[0.46, 0.27]} />
        <meshBasicMaterial map={tex.screen} toneMapped={false} />
      </mesh>

      {/* Interfaz de audio con perillas */}
      <B s={[0.34, 0.06, 0.22]} p={[-0.35, 1.175, -0.55]} m={m.matte} />
      {[-0.44, -0.35, -0.26].map((x) => (
        <mesh key={x} material={m.chrome} position={[x, 1.21, -0.5]}>
          <cylinderGeometry args={[0.016, 0.016, 0.02, 12]} />
        </mesh>
      ))}
      <B
        s={[0.1, 0.012, 0.02]}
        p={[-0.35, 1.21, -0.62]}
        m={m.led}
        castShadow={false}
      />

      {/* Micrófonos y asientos */}
      <Mic x={-0.85} m={m} />
      <Mic x={0.25} m={m} />
      <Stool x={-0.85} m={m} />
      <Stool x={0.25} m={m} />

      {/* Audífonos sobre el escritorio */}
      <mesh
        material={m.matte}
        position={[0.45, 1.16, -0.5]}
        rotation={[Math.PI / 2, 0, 0.4]}
      >
        <torusGeometry args={[0.09, 0.018, 8, 24]} />
      </mesh>

      {/* Paneles acústicos en la pared derecha interior */}
      <AcousticGrid
        m={m}
        positions={[-1.5, -1.1, -0.7, -0.3].flatMap((x) =>
          [0.95, 1.28].map((y) => [x, y, 0.79] as [number, number, number]),
        )}
      />

      {/* Planta */}
      <group position={[-1.55, 0, 0.55]}>
        <mesh material={m.matte} position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.06, 0.15, 14]} />
        </mesh>
        <mesh position={[0, 0.99, 0]} castShadow>
          <icosahedronGeometry args={[0.14, 0]} />
          <meshStandardMaterial color="#3f7d4e" roughness={0.9} flatShading />
        </mesh>
      </group>

      {/* ——— Cabina delantera ——— */}
      <RoundedBox
        args={[0.24, 0.18, 1.58]}
        radius={0.04}
        position={[2.02, 1.22, 0]}
        material={m.paintInner}
        castShadow
      />
      {/* Volante del conductor (izquierda) */}
      <group position={[1.8, 1.1, -0.42]} rotation={[0, 0, 0.9]}>
        <mesh material={m.matte} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.17, 0.018, 10, 28]} />
        </mesh>
        <mesh material={m.matte} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.2, 8]} />
        </mesh>
        {[0, 1.05, -1.05].map((r) => (
          <mesh key={r} material={m.matte} rotation={[r, Math.PI / 2, 0]}>
            <boxGeometry args={[0.3, 0.015, 0.015]} />
          </mesh>
        ))}
      </group>
      {/* Asientos delanteros */}
      {[-0.42, 0.42].map((z) => (
        <group key={z} position={[1.42, 0, z]}>
          <B s={[0.5, 0.3, 0.48]} p={[0, 0.93, 0]} m={m.matte} />
          <B s={[0.5, 0.09, 0.48]} p={[0, 1.12, 0]} m={m.fabric} />
          <B
            s={[0.09, 0.52, 0.48]}
            p={[0.24, 1.38, 0]}
            m={m.fabric}
            r={[0, 0, -0.12]}
          />
        </group>
      ))}
    </group>
  );
}
