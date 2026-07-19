"use client";

import { Suspense, useEffect, useRef, type RefObject } from "react";
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
import { StarlinkMini } from "./starlink-mini";
import { PodcastInterior } from "./podcast-interior";
import { isInstantMode } from "../experience/instant";

/** API imperativa que el shell usa para los botones de cámara. */
export interface ViewerApi {
  zoomBy: (factor: number) => void;
  reset: () => void;
}

interface ViewerSceneProps {
  autoRotate: boolean;
  modelAvailable: boolean;
  /** true = cámara dentro de la cabina (modo podcast) */
  inside: boolean;
  apiRef: RefObject<ViewerApi | null>;
  onReady: () => void;
}

/** Límites de órbita por modo. */
const OUTSIDE = {
  target: new THREE.Vector3(0, 1.05, 0),
  position: new THREE.Vector3(5.6, 2.0, 6.4),
  fov: 30,
  minDistance: 3.5,
  maxDistance: 11,
  minPolar: 0.25,
  maxPolar: 1.45,
};
const INSIDE = {
  target: new THREE.Vector3(0, 0.72, -0.5),
  position: new THREE.Vector3(0, 1.55, -1.9),
  fov: 62,
  minDistance: 0.5,
  maxDistance: 1.9,
  minPolar: 0.7,
  maxPolar: 1.7,
};

/** Transición de cámara al entrar/salir de la cabina por el portón. */
function CameraModes({
  inside,
  controlsRef,
}: {
  inside: boolean;
  controlsRef: RefObject<OrbitControlsImpl | null>;
}) {
  const camera = useThree((s) => s.camera);
  const mounted = useRef(false);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    const mode = inside ? INSIDE : OUTSIDE;
    controls.enabled = false;

    const persp = camera as THREE.PerspectiveCamera;
    const fovTween = gsap.to(persp, {
      fov: mode.fov,
      duration: 1.2,
      ease: "power2.inOut",
      overwrite: "auto",
      onUpdate: () => persp.updateProjectionMatrix(),
    });
    if (isInstantMode()) fovTween.progress(1);

    // Punto de paso: detrás del portón trasero, a la altura de la cabina
    const gate = new THREE.Vector3(0, 1.35, -3.4);
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut", overwrite: "auto" },
      onUpdate: () => controls.update(),
      onComplete: () => {
        controls.minDistance = mode.minDistance;
        controls.maxDistance = mode.maxDistance;
        controls.minPolarAngle = mode.minPolar;
        controls.maxPolarAngle = mode.maxPolar;
        controls.enabled = true;
      },
    });

    if (inside) {
      // Al entrar los límites se relajan de inmediato para el trayecto
      controls.minDistance = 0.05;
      controls.maxDistance = 30;
      tl.to(camera.position, { ...vec(gate), duration: 1.1 })
        .to(controls.target, { ...vec(INSIDE.target), duration: 1.1 }, "<")
        .to(camera.position, { ...vec(INSIDE.position), duration: 1.2 });
    } else {
      controls.minDistance = 0.05;
      controls.maxDistance = 30;
      tl.to(camera.position, { ...vec(gate), duration: 1.0 })
        .to(camera.position, { ...vec(OUTSIDE.position), duration: 1.2 })
        .to(controls.target, { ...vec(OUTSIDE.target), duration: 1.2 }, "<");
    }
    if (isInstantMode()) tl.progress(1);

    return () => {
      tl.kill();
    };
  }, [inside, camera, controlsRef]);

  return null;
}

function vec(v: THREE.Vector3) {
  return { x: v.x, y: v.y, z: v.z };
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
  inside,
  apiRef,
  onReady,
}: ViewerSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const bg = isDark ? "#14171a" : "#e9e6e0";
  const floor = isDark ? "#191d20" : "#dfdbd3";

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      camera={{ position: [5.6, 2.0, 6.4], fov: 30, near: 0.1, far: 60 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
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
      <fog attach="fog" args={[bg, 16, 42]} />

      <directionalLight
        position={[5, 8, 4]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-6, 4, -4]} intensity={0.35} />

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
        {modelAvailable ? <KombiModel /> : <ProceduralT2 />}
        <StarlinkMini />
        <PodcastInterior />
      </Suspense>

      {/* Piso de estudio */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[30, 48]} />
        <meshStandardMaterial color={floor} roughness={0.95} />
      </mesh>
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.5}
        scale={12}
        blur={2.6}
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
        autoRotate={autoRotate && !inside}
        autoRotateSpeed={0.5}
      />

      <CameraModes inside={inside} controlsRef={controlsRef} />
      <ApiBridge apiRef={apiRef} controlsRef={controlsRef} />
    </Canvas>
  );
}
