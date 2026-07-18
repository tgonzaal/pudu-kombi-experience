"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import gsap from "gsap";
import { Kombi } from "./kombi";
import { Effects } from "./effects";
import { isInstantMode } from "./instant";
import type { KombiOpenState, PartKey } from "./kombi/constants";

export interface ExperienceProps {
  open: KombiOpenState;
  onToggle: (part: PartKey) => void;
  /** true cuando la pantalla de carga terminó: dispara la intro de cámara */
  active: boolean;
  isDark: boolean;
}

export function Experience({
  open,
  onToggle,
  active,
  isDark,
}: ExperienceProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const introDone = useRef(false);
  const camera = useThree((s) => s.camera);

  // Intro cinematográfica: dolly desde lejos hasta el encuadre principal
  useEffect(() => {
    if (!active || introDone.current) return;
    introDone.current = true;
    const controls = controlsRef.current;
    if (controls) controls.enabled = false;
    const tween = gsap.to(camera.position, {
      x: 6.2,
      y: 2.1,
      z: 7.0,
      duration: 2.4,
      ease: "power3.out",
      onUpdate: () => camera.lookAt(0, 1, 0),
      onComplete: () => {
        if (controls) {
          controls.enabled = true;
          controls.autoRotate = true;
        }
      },
    });
    if (isInstantMode()) tween.progress(1);
    return () => {
      tween.kill();
    };
  }, [active, camera]);

  const bg = isDark ? "#11150f" : "#e7e3da";
  const floor = isDark ? "#161b15" : "#dbd6cc";

  return (
    <>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 14, 40]} />

      {/* Luz clave con sombras + relleno */}
      <directionalLight
        position={[5, 7, 4]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-6, 3, -4]} intensity={0.3} />

      {/* Iluminación de estudio tipo HDRI, generada con lightformers */}
      <Environment resolution={256} frames={1}>
        <Lightformer
          intensity={3}
          position={[0, 6, 0]}
          rotation-x={Math.PI / 2}
          scale={[9, 9, 1]}
        />
        <Lightformer
          intensity={1.4}
          position={[-6, 3, 2]}
          rotation-y={Math.PI / 2}
          scale={[6, 3, 1]}
        />
        <Lightformer
          intensity={1.1}
          color="#fff2dd"
          position={[6, 3, -2]}
          rotation-y={-Math.PI / 2}
          scale={[6, 3, 1]}
        />
        <Lightformer intensity={0.8} position={[0, 2, -7]} scale={[8, 3, 1]} />
      </Environment>

      <Kombi open={open} onToggle={onToggle} />

      {/* Piso de estudio */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[28, 48]} />
        <meshStandardMaterial color={floor} roughness={0.95} />
      </mesh>
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.55}
        scale={12}
        blur={2.4}
        far={2.5}
        resolution={512}
        frames={Infinity}
      />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.06}
        enablePan
        minDistance={3.2}
        maxDistance={13}
        minPolarAngle={0.15}
        maxPolarAngle={1.5}
        target={[0, 1, 0]}
        autoRotateSpeed={0.7}
        onStart={() => {
          if (controlsRef.current) controlsRef.current.autoRotate = false;
        }}
      />

      <Effects />
    </>
  );
}
