"use client";

import { useState, type RefObject } from "react";
import * as THREE from "three";
import { useCursor } from "@react-three/drei";
import { B, Decal } from "./parts";
import type { KombiMaterials } from "./materials";
import type { BrandTextures } from "./textures";
import type { PartKey } from "./constants";

type GroupRef = RefObject<THREE.Group | null>;

interface DoorProps {
  groupRef: GroupRef;
  m: KombiMaterials;
  onToggle: (part: PartKey) => void;
}

/** Grupo clicable con cursor pointer. */
function Clickable({
  part,
  onToggle,
  children,
}: {
  part: PartKey;
  onToggle: (part: PartKey) => void;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onToggle(part);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {children}
    </group>
  );
}

/**
 * Puerta delantera con bisagra en el borde frontal.
 * `side` = -1 conductor (izquierda), +1 copiloto (derecha).
 */
function FrontDoor({
  groupRef,
  m,
  onToggle,
  side,
}: DoorProps & { side: -1 | 1 }) {
  const part: PartKey = side === -1 ? "driver" : "copilot";
  return (
    <group ref={groupRef} position={[1.85, 0, side * 0.86]}>
      <Clickable part={part} onToggle={onToggle}>
        {/* Panel inferior */}
        <B s={[0.8, 0.545, 0.05]} p={[-0.4, 1.0475, 0]} m={m.paint} />
        {/* Marco de ventana */}
        <B s={[0.8, 0.04, 0.05]} p={[-0.4, 1.78, 0]} m={m.paint} />
        <B s={[0.05, 0.44, 0.05]} p={[-0.025, 1.54, 0]} m={m.paint} />
        <B s={[0.05, 0.44, 0.05]} p={[-0.775, 1.54, 0]} m={m.paint} />
        <mesh material={m.glass} position={[-0.4, 1.54, 0]}>
          <boxGeometry args={[0.7, 0.44, 0.02]} />
        </mesh>
        {/* Manilla y tapiz interior */}
        <B s={[0.14, 0.03, 0.05]} p={[-0.66, 1.18, side * 0.02]} m={m.chrome} />
        <B
          s={[0.76, 0.5, 0.015]}
          p={[-0.4, 1.03, -side * 0.035]}
          m={m.paintInner}
        />
        {/* Espejo lateral */}
        <mesh
          material={m.chrome}
          position={[-0.05, 1.66, side * 0.1]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.013, 0.013, 0.18, 8]} />
        </mesh>
        <B s={[0.03, 0.13, 0.09]} p={[-0.05, 1.68, side * 0.2]} m={m.chrome} />
      </Clickable>
    </group>
  );
}

export function DriverDoor(props: DoorProps) {
  return <FrontDoor {...props} side={-1} />;
}

export function CopilotDoor(props: DoorProps) {
  return <FrontDoor {...props} side={1} />;
}

/** Puerta corrediza — solo en el lado derecho. */
export function SlidingDoor({
  groupRef,
  m,
  tex,
  onToggle,
}: DoorProps & { tex: BrandTextures }) {
  return (
    <group ref={groupRef} position={[0, 0, 0.86]}>
      <Clickable part="slider" onToggle={onToggle}>
        <B s={[0.95, 0.545, 0.05]} p={[0.495, 1.0475, 0]} m={m.paint} />
        <B s={[0.95, 0.04, 0.05]} p={[0.495, 1.78, 0]} m={m.paint} />
        <B s={[0.05, 0.44, 0.05]} p={[0.045, 1.54, 0]} m={m.paint} />
        <B s={[0.05, 0.44, 0.05]} p={[0.945, 1.54, 0]} m={m.paint} />
        <mesh material={m.glass} position={[0.495, 1.54, 0]}>
          <boxGeometry args={[0.85, 0.44, 0.02]} />
        </mesh>
        <B s={[0.14, 0.03, 0.05]} p={[0.12, 1.18, 0.02]} m={m.chrome} />
        <B s={[0.91, 0.5, 0.015]} p={[0.495, 1.03, -0.035]} m={m.paintInner} />
        {/* Riel inferior */}
        <B s={[0.95, 0.03, 0.02]} p={[0.495, 0.8, 0.035]} m={m.chrome} />
        <Decal tex={tex.logoWhite} w={0.5} h={0.5} p={[0.495, 1.03, 0.032]} />
      </Clickable>
    </group>
  );
}

/** Portón trasero con bisagra superior (abre hacia arriba). */
export function Tailgate({ groupRef, m, onToggle }: DoorProps) {
  return (
    <group ref={groupRef} position={[-2.2, 1.8, 0]}>
      <Clickable part="tailgate" onToggle={onToggle}>
        <B s={[0.05, 0.25, 1.4]} p={[0, -0.655, 0]} m={m.paint} />
        <B s={[0.05, 0.06, 1.4]} p={[0, -0.055, 0]} m={m.paint} />
        <B s={[0.05, 0.42, 0.11]} p={[0, -0.32, 0.645]} m={m.paint} />
        <B s={[0.05, 0.42, 0.11]} p={[0, -0.32, -0.645]} m={m.paint} />
        <mesh material={m.glass} position={[0, -0.32, 0]}>
          <boxGeometry args={[0.02, 0.42, 1.18]} />
        </mesh>
        <B s={[0.05, 0.03, 0.16]} p={[-0.04, -0.7, 0]} m={m.chrome} />
      </Clickable>
    </group>
  );
}

/** Tapa del compartimiento del motor, bajo el portón. */
export function EngineLid({
  groupRef,
  m,
  tex,
  onToggle,
}: DoorProps & { tex: BrandTextures }) {
  return (
    <group ref={groupRef} position={[-2.2, 1.02, 0]}>
      <Clickable part="engine" onToggle={onToggle}>
        <B s={[0.05, 0.52, 1.4]} p={[0, -0.26, 0]} m={m.paint} />
        {/* Rejillas de refrigeración */}
        {[0, 1, 2, 3].map((i) => (
          <B
            key={i}
            s={[0.02, 0.03, 0.9]}
            p={[-0.035, -0.1 - i * 0.075, 0]}
            m={m.matte}
          />
        ))}
        <B s={[0.05, 0.03, 0.14]} p={[-0.04, -0.46, 0]} m={m.chrome} />
        <Decal
          tex={tex.logoWhite}
          w={0.26}
          h={0.26}
          p={[-0.033, -0.28, 0.45]}
          r={[0, -Math.PI / 2, 0]}
        />
      </Clickable>
    </group>
  );
}
