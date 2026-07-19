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
import { isInstantMode } from "../experience/instant";

/** API imperativa que el shell usa para los botones de cámara. */
export interface ViewerApi {
  zoomBy: (factor: number) => void;
  reset: () => void;
}

interface ViewerSceneProps {
  autoRotate: boolean;
  modelAvailable: boolean;
  apiRef: RefObject<ViewerApi | null>;
  onReady: () => void;
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
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
      />

      <ApiBridge apiRef={apiRef} controlsRef={controlsRef} />
    </Canvas>
  );
}
