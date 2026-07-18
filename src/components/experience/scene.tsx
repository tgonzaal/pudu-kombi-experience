"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { Experience } from "./experience";
import type { KombiOpenState, PartKey } from "./kombi/constants";

interface SceneProps {
  open: KombiOpenState;
  onToggle: (part: PartKey) => void;
  active: boolean;
  onReady: () => void;
}

/**
 * Canvas WebGL de la experiencia. Se importa con `next/dynamic`
 * (ssr: false) desde el shell, por lo que solo vive en el cliente.
 */
export default function Scene({ open, onToggle, active, onReady }: SceneProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.75]}
      camera={{ position: [11.5, 4.6, 11.5], fov: 32, near: 0.1, far: 80 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      onCreated={() => {
        // Espera el primer frame antes de retirar el loader, con un
        // fallback por si rAF está pausado (pestaña en segundo plano)
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
      <Suspense fallback={null}>
        <Experience
          open={open}
          onToggle={onToggle}
          active={active}
          isDark={resolvedTheme === "dark"}
        />
      </Suspense>
    </Canvas>
  );
}
