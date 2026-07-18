"use client";

import { DIM } from "./constants";
import { B } from "./parts";
import type { KombiMaterials } from "./materials";

function Wheel({ x, z, m }: { x: number; z: number; m: KombiMaterials }) {
  return (
    <group position={[x, DIM.wheelR, z]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow material={m.rubber}>
        <cylinderGeometry args={[DIM.wheelR, DIM.wheelR, 0.22, 28]} />
      </mesh>
      <mesh material={m.matte}>
        <cylinderGeometry args={[0.2, 0.2, 0.225, 24]} />
      </mesh>
      <mesh material={m.chrome}>
        <cylinderGeometry args={[0.13, 0.13, 0.235, 24]} />
      </mesh>
      <mesh material={m.paint}>
        <cylinderGeometry args={[0.045, 0.045, 0.24, 16]} />
      </mesh>
    </group>
  );
}

/** Ruedas, ejes y bajos oscurecidos. */
export function Wheels({ m }: { m: KombiMaterials }) {
  const { axleX, wheelZ } = DIM;
  return (
    <group>
      {/* Caja inferior: oculta la vista a través de los arcos */}
      <B s={[4.34, 0.34, 1.16]} p={[0, 0.52, 0]} m={m.matte} />
      {/* Ejes */}
      {[axleX, -axleX].map((x) => (
        <mesh
          key={x}
          material={m.matte}
          position={[x, 0.36, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.045, 0.045, 1.44, 12]} />
        </mesh>
      ))}
      <Wheel x={axleX} z={wheelZ} m={m} />
      <Wheel x={axleX} z={-wheelZ} m={m} />
      <Wheel x={-axleX} z={wheelZ} m={m} />
      <Wheel x={-axleX} z={-wheelZ} m={m} />
    </group>
  );
}
