"use client";

import { Suspense, useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import gsap from "gsap";
import { useTheme } from "next-themes";
import { KombiModel } from "./kombi-model";
import { ProceduralT2 } from "./t2/procedural-t2";
import { DecalHandles } from "./decal-handles";
import { RoadStage } from "./scenes/road";
import { SCENES, type SceneId } from "./scenes";
import type { Decal } from "./decals";
import { isInstantMode } from "../experience/instant";

/** API imperativa que el shell usa para los botones de cámara. */
export interface ViewerApi {
  zoomBy: (factor: number) => void;
  reset: () => void;
  /** Lleva la cámara frente a una cara, para revisarla de frente. */
  viewFace: (face: "piloto" | "copiloto" | "trasera" | "frontal") => void;
}

interface ViewerSceneProps {
  autoRotate: boolean;
  modelAvailable: boolean;
  apiRef: RefObject<ViewerApi | null>;
  onReady: () => void;
  /** Gráficas colocadas desde el editor. */
  decals?: Decal[];
  paintTop?: string;
  paintBottom?: string;
  /** Entorno en el que se muestra la Kombi. */
  scene?: SceneId;
  editing?: boolean;
  selectedDecalId?: string | null;
  onSelectDecal?: (id: string) => void;
  onMoveDecal?: (id: string, h: number, v: number) => void;
}

/**
 * Suelta la órbita mientras se arrastra una gráfica, si no la cámara gira
 * junto con ella. Va de forma imperativa para no pisar las transiciones de
 * cámara, que también tocan `enabled`.
 */
function OrbitLock({
  locked,
  controlsRef,
}: {
  locked: boolean;
  controlsRef: RefObject<OrbitControlsImpl | null>;
}) {
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.enabled = !locked;
    return () => {
      controls.enabled = true;
    };
  }, [locked, controlsRef]);
  return null;
}

/** Registra zoom y reset sobre los OrbitControls. */
function ApiBridge({
  apiRef,
  controlsRef,
}: {
  apiRef: RefObject<ViewerApi | null>;
  controlsRef: RefObject<OrbitControlsImpl | null>;
}) {
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    apiRef.current = {
      zoomBy(factor) {
        const controls = controlsRef.current;
        if (!controls) return;
        const offset = camera.position.clone().sub(controls.target);
        const distance = THREE.MathUtils.clamp(
          offset.length() * factor,
          controls.minDistance,
          controls.maxDistance,
        );
        const destination = controls.target
          .clone()
          .add(offset.setLength(distance));
        const tween = gsap.to(camera.position, {
          x: destination.x,
          y: destination.y,
          z: destination.z,
          duration: 0.6,
          ease: "power2.out",
          overwrite: "auto",
        });
        if (isInstantMode()) tween.progress(1);
      },
      reset() {
        controlsRef.current?.reset();
      },
      viewFace(face) {
        const controls = controlsRef.current;
        if (!controls) return;
        const puntos = {
          piloto: new THREE.Vector3(7.5, 1.4, 0),
          copiloto: new THREE.Vector3(-7.5, 1.4, 0),
          trasera: new THREE.Vector3(0, 1.4, -7.5),
          frontal: new THREE.Vector3(0, 1.4, 7.5),
        } as const;
        const destino = puntos[face];
        controls.target.set(0, 1.05, 0);
        const tween = gsap.to(camera.position, {
          x: destino.x,
          y: destino.y,
          z: destino.z,
          duration: 0.8,
          ease: "power2.inOut",
          overwrite: "auto",
          onUpdate: () => controls.update(),
        });
        if (isInstantMode()) tween.progress(1);
      },
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, controlsRef, camera]);

  return null;
}

/**
 * Escena tipo estudio fotográfico: fondo limpio, iluminación HDRI
 * (lightformers), sombras suaves y órbita libre. Sin interacción
 * mecánica: la Kombi solo se contempla.
 */
export default function ViewerScene({
  autoRotate,
  modelAvailable,
  apiRef,
  onReady,
  decals = [],
  paintTop,
  paintBottom,
  scene = "estudio",
  editing = false,
  selectedDecalId = null,
  onSelectDecal,
  onMoveDecal,
}: ViewerSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [draggingDecal, setDraggingDecal] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const enRuta = scene === "carretera";
  const ruta = SCENES.carretera.colors;

  // En el estudio el fondo sigue al tema; una carretera tiene el suyo.
  const bg = enRuta ? ruta.niebla : isDark ? "#14171a" : "#e9e6e0";
  const floor = isDark ? "#191d20" : "#dfdbd3";

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      camera={{ position: [5.6, 2.0, 6.4], fov: 30, near: 0.1, far: 60 }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        // Permite capturar el lienzo para revisarlo y, más adelante,
        // descargar la vista como imagen.
        preserveDrawingBuffer: true,
      }}
      onCreated={() => {
        let notified = false;
        const notify = () => {
          if (!notified) {
            notified = true;
            onReady();
          }
        };
        requestAnimationFrame(notify);
        setTimeout(notify, 400);
      }}
    >
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={enRuta ? [bg, 45, 320] : [bg, 16, 42]} />

      <directionalLight
        position={enRuta ? [-9, 5, 7] : [5, 8, 4]}
        color={enRuta ? "#ffd9a8" : "#ffffff"}
        intensity={enRuta ? 2.1 : 1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
      />
      <directionalLight
        position={[-6, 4, -4]}
        intensity={enRuta ? 0.15 : 0.35}
      />
      {enRuta && (
        // Rebote del cielo, para que las sombras no queden muertas
        <hemisphereLight
          args={[ruta.cenit, ruta.tierra, 1.1]}
          position={[0, 10, 0]}
        />
      )}

      {/* Estudio HDRI generado con lightformers (sin assets externos) */}
      <Environment resolution={512} frames={1}>
        <Lightformer
          intensity={3}
          position={[0, 6, 0]}
          rotation-x={Math.PI / 2}
          scale={[10, 10, 1]}
        />
        <Lightformer
          intensity={1.6}
          position={[-6, 3, 2]}
          rotation-y={Math.PI / 2}
          scale={[7, 3, 1]}
        />
        <Lightformer
          intensity={1.2}
          color="#fff3de"
          position={[6, 3, -2]}
          rotation-y={-Math.PI / 2}
          scale={[7, 3, 1]}
        />
        <Lightformer intensity={0.9} position={[0, 3, -8]} scale={[10, 3, 1]} />
      </Environment>

      {/* GLB profesional si existe; si no, la T2 procedural de alta fidelidad */}
      <Suspense fallback={null}>
        {modelAvailable ? (
          <KombiModel
            decals={decals}
            paintTop={paintTop}
            paintBottom={paintBottom}
          />
        ) : (
          <ProceduralT2 />
        )}
        {editing && (
          <DecalHandles
            decals={decals}
            selectedId={selectedDecalId}
            onSelect={onSelectDecal}
            onMove={onMoveDecal}
            onDragChange={setDraggingDecal}
          />
        )}
      </Suspense>

      {enRuta ? (
        <RoadStage colors={ruta} />
      ) : (
        /* Piso de estudio */
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[30, 48]} />
          <meshStandardMaterial color={floor} roughness={0.95} />
        </mesh>
      )}
      {/* En la carretera la sombra va más marcada y por encima de las
          líneas pintadas, si no la Kombi parece flotar sobre el asfalto. */}
      <ContactShadows
        position={[0, enRuta ? 0.012 : 0.001, 0]}
        opacity={enRuta ? 0.8 : 0.5}
        scale={enRuta ? 10 : 12}
        blur={enRuta ? 1.8 : 2.6}
        far={2.2}
        resolution={512}
      />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.06}
        enablePan={false}
        minDistance={3.5}
        maxDistance={11}
        minPolarAngle={0.25}
        maxPolarAngle={1.45}
        target={[0, 1.05, 0]}
        autoRotate={autoRotate && !draggingDecal}
        autoRotateSpeed={0.5}
      />

      <OrbitLock locked={draggingDecal} controlsRef={controlsRef} />
      <ApiBridge apiRef={apiRef} controlsRef={controlsRef} />
    </Canvas>
  );
}
