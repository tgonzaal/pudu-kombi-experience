"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { AREAS, type Decal, type Face } from "./decals";

/**
 * Tiradores para mover las gráficas en el editor.
 *
 * La gráfica se pinta en el shader, sobre la chapa; esto es solo la zona
 * sensible al puntero: un plano transparente del mismo tamaño, un pelo por
 * fuera. Solo existe mientras se edita.
 */
interface DecalHandlesProps {
  decals: Decal[];
  selectedId: string | null;
  onSelect?: (id: string) => void;
  onMove?: (id: string, h: number, v: number) => void;
  onDragChange?: (dragging: boolean) => void;
}

/** Plano de cada cara: normal hacia fuera y distancia al origen. */
const PLANES: Record<Face, { normal: THREE.Vector3; d: number }> = {
  piloto: { normal: new THREE.Vector3(1, 0, 0), d: 1.06 },
  copiloto: { normal: new THREE.Vector3(-1, 0, 0), d: 1.06 },
  trasera: { normal: new THREE.Vector3(0, 0, -1), d: 2.24 },
  frontal: { normal: new THREE.Vector3(0, 0, 1), d: 2.21 },
};

/** Giro del plano para que mire hacia fuera en cada cara. */
function rotationFor(face: Face): [number, number, number] {
  switch (face) {
    case "piloto":
      return [0, Math.PI / 2, 0];
    case "copiloto":
      return [0, -Math.PI / 2, 0];
    case "trasera":
      return [0, Math.PI, 0];
    default:
      return [0, 0, 0];
  }
}

/** Posición en el mundo del centro de la gráfica. */
function positionFor(decal: Decal): [number, number, number] {
  const { normal, d } = PLANES[decal.face];
  const lado = decal.face === "piloto" || decal.face === "copiloto";
  return lado
    ? [normal.x * d, decal.v, decal.h]
    : [decal.h, decal.v, normal.z * d];
}

function Handle({
  decal,
  selected,
  onSelect,
  onMove,
  onDragChange,
}: {
  decal: Decal;
  selected: boolean;
  onSelect?: (id: string) => void;
  onMove?: (id: string, h: number, v: number) => void;
  onDragChange?: (dragging: boolean) => void;
}) {
  const { camera, gl } = useThree();
  const grab = useRef<{ dh: number; dv: number } | null>(null);

  const lado = decal.face === "piloto" || decal.face === "copiloto";
  const height = decal.width * decal.aspect;
  const area = AREAS[decal.face];

  const plane = useMemo(() => {
    const { normal, d } = PLANES[decal.face];
    return new THREE.Plane(normal.clone(), -d);
  }, [decal.face]);

  /** Del puntero a coordenadas de la cara. */
  const pointerToFace = useCallback(
    (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      const ray = new THREE.Raycaster();
      ray.setFromCamera(ndc, camera);
      const hit = new THREE.Vector3();
      if (!ray.ray.intersectPlane(plane, hit)) return null;
      return { h: lado ? hit.z : hit.x, v: hit.y };
    },
    [camera, gl, plane, lado],
  );

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (!grab.current) return;
      const point = pointerToFace(event);
      if (!point) return;
      onMove?.(
        decal.id,
        THREE.MathUtils.clamp(point.h + grab.current.dh, area.hMin, area.hMax),
        THREE.MathUtils.clamp(point.v + grab.current.dv, area.vMin, area.vMax),
      );
    };
    const up = () => {
      if (!grab.current) return;
      grab.current = null;
      onDragChange?.(false);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [pointerToFace, onMove, onDragChange, decal.id, area]);

  return (
    <group position={positionFor(decal)} rotation={rotationFor(decal.face)}>
      <mesh
        rotation={[0, 0, THREE.MathUtils.degToRad(decal.rotation)]}
        onPointerDown={(event) => {
          event.stopPropagation();
          onSelect?.(decal.id);
          // Se guarda el desfase para que la gráfica no salte al agarrarla.
          grab.current = {
            dh: decal.h - (lado ? event.point.z : event.point.x),
            dv: decal.v - event.point.y,
          };
          onDragChange?.(true);
        }}
      >
        <planeGeometry args={[decal.width, height]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {selected && (
        <lineSegments
          rotation={[0, 0, THREE.MathUtils.degToRad(decal.rotation)]}
          renderOrder={999}
        >
          <edgesGeometry
            args={[new THREE.PlaneGeometry(decal.width, height)]}
          />
          <lineBasicMaterial color="#4ade80" depthTest={false} />
        </lineSegments>
      )}
    </group>
  );
}

export function DecalHandles({
  decals,
  selectedId,
  onSelect,
  onMove,
  onDragChange,
}: DecalHandlesProps) {
  return (
    <>
      {decals.map((decal) => (
        <Handle
          key={decal.id}
          decal={decal}
          selected={selectedId === decal.id}
          onSelect={onSelect}
          onMove={onMove}
          onDragChange={onDragChange}
        />
      ))}
    </>
  );
}
