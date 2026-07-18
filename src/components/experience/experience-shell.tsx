"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "./loader";
import {
  CLOSED_STATE,
  PART_LABELS,
  type KombiOpenState,
  type PartKey,
} from "./kombi/constants";

const Scene = dynamic(() => import("./scene"), { ssr: false });

const PARTS = Object.keys(PART_LABELS) as PartKey[];

/**
 * Contenedor de la experiencia: escena 3D, pantalla de carga
 * y panel de control de las partes móviles.
 */
export function ExperienceShell() {
  const [open, setOpen] = useState<KombiOpenState>(CLOSED_STATE);
  const [sceneReady, setSceneReady] = useState(false);
  const [minTimeDone, setMinTimeDone] = useState(false);

  // El loader se muestra al menos 1.6 s para evitar un parpadeo
  useEffect(() => {
    const id = setTimeout(() => setMinTimeDone(true), 1600);
    return () => clearTimeout(id);
  }, []);

  const active = sceneReady && minTimeDone;

  const toggle = useCallback((part: PartKey) => {
    setOpen((prev) => ({ ...prev, [part]: !prev[part] }));
  }, []);

  const allOpen = PARTS.every((p) => open[p]);
  const setAll = (value: boolean) => {
    setOpen({
      driver: value,
      copilot: value,
      slider: value,
      tailgate: value,
      engine: value,
    });
  };

  return (
    <section
      className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden"
      aria-label="Experiencia 3D de la Kombi PUDÚ"
    >
      <Scene
        open={open}
        onToggle={toggle}
        active={active}
        onReady={() => setSceneReady(true)}
      />

      <LoadingScreen visible={!active} />

      {active && (
        <>
          {/* Instrucciones */}
          <motion.div
            className="pointer-events-none absolute top-6 left-1/2 z-10 -translate-x-1/2"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8 }}
          >
            <p className="rounded-full bg-background/70 px-4 py-2 text-xs text-muted-foreground backdrop-blur-md sm:text-sm">
              Arrastra para rotar · Rueda para acercar · Haz clic en las puertas
            </p>
          </motion.div>

          {/* Panel de partes móviles */}
          <motion.div
            className="absolute inset-x-0 bottom-6 z-10 flex justify-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0, duration: 0.8 }}
          >
            <div className="flex max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl border border-border/60 bg-background/70 p-3 shadow-lg backdrop-blur-md">
              {PARTS.map((part) => (
                <Button
                  key={part}
                  size="sm"
                  variant={open[part] ? "default" : "secondary"}
                  onClick={() => toggle(part)}
                  aria-pressed={open[part]}
                >
                  {PART_LABELS[part]}
                </Button>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAll(!allOpen)}
              >
                {allOpen ? "Cerrar todo" : "Abrir todo"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </section>
  );
}
