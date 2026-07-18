"use client";

import * as THREE from "three";

/** Caja con sombras: el ladrillo básico de la carrocería. */
export function B({
  s,
  p,
  m,
  r,
  castShadow = true,
}: {
  s: [number, number, number];
  p: [number, number, number];
  m: THREE.Material;
  r?: [number, number, number];
  castShadow?: boolean;
}) {
  return (
    <mesh
      castShadow={castShadow}
      receiveShadow
      position={p}
      rotation={r}
      material={m}
    >
      <boxGeometry args={s} />
    </mesh>
  );
}

/** Plano con textura de marca, apoyado sobre un panel (calcomanía). */
export function Decal({
  tex,
  w,
  h,
  p,
  r,
}: {
  tex: THREE.Texture;
  w: number;
  h: number;
  p: [number, number, number];
  r?: [number, number, number];
}) {
  return (
    <mesh position={p} rotation={r}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={tex} transparent roughness={0.5} />
    </mesh>
  );
}
