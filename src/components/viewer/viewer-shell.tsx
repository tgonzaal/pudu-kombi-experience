"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useProgress } from "@react-three/drei";
import {
  DoorOpen,
  LogOut,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KOMBI_MODEL_URL } from "./config";
import type { ViewerApi } from "./viewer-scene";

const ViewerScene = dynamic(() => import("./viewer-scene"), { ssr: false });

type ModelStatus = "checking" | "ready" | "missing";

const SPECS = [
  { label: "Año", value: "1971" },
  { label: "Motor", value: "Eléctrico" },
  { label: "Capacidad", value: "2 pasajeros + equipo" },
  { label: "Autonomía", value: "Hasta 300 km" },
];

/** Pantalla de carga con progreso real de descarga del GLB. */
function ViewerLoader({ visible }: { visible: boolean }) {
  const { progress } = useProgress();
  if (!visible) return null;
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-background/95">
      <p className="font-display text-4xl font-extrabold tracking-tight">
        PUDÚ <span className="text-primary">Kombi</span>
      </p>
      <div className="h-1 w-48 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${Math.max(progress, 8)}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Cargando modelo… {Math.round(progress)}%
      </p>
    </div>
  );
}

/**
 * Visor 3D de la Kombi, estilo configurador automotriz:
 * rotación 360°, zoom, auto-rotación y reinicio de cámara.
 * Sin más interacciones: la Kombi se contempla como en un museo.
 */
export function ViewerShell() {
  const apiRef = useRef<ViewerApi | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [inside, setInside] = useState(false);
  const [status, setStatus] = useState<ModelStatus>("checking");
  const [sceneReady, setSceneReady] = useState(false);

  // Detecta si el GLB existe antes de intentar cargarlo
  useEffect(() => {
    let cancelled = false;
    fetch(KOMBI_MODEL_URL, { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setStatus(res.ok ? "ready" : "missing");
      })
      .catch(() => {
        if (!cancelled) setStatus("missing");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const showLoader = status === "checking" || !sceneReady;

  return (
    <section
      className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden"
      aria-label="Visor 3D de la Kombi PUDÚ"
    >
      {status !== "checking" && (
        <ViewerScene
          autoRotate={autoRotate}
          modelAvailable={status === "ready"}
          inside={inside}
          apiRef={apiRef}
          onReady={() => setSceneReady(true)}
        />
      )}

      <ViewerLoader visible={showLoader} />

      {!showLoader && (
        <>
          {/* Entrar / salir de la cabina */}
          <motion.div
            className="absolute inset-x-0 bottom-14 z-10 flex justify-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <Button size="lg" onClick={() => setInside((v) => !v)}>
              {inside ? (
                <>
                  <LogOut className="size-4" />
                  Salir de la Kombi
                </>
              ) : (
                <>
                  <DoorOpen className="size-4" />
                  Entrar a la Kombi
                </>
              )}
            </Button>
          </motion.div>

          {/* Panel de identidad y ficha, como en la referencia */}
          {!inside && (
            <motion.aside
              className="pointer-events-none absolute top-8 left-6 z-10 hidden w-60 md:block lg:left-10"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <h1 className="font-display text-4xl leading-tight font-extrabold tracking-tight">
                PUDÚ
                <br />
                KOMBI
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Movemos historias, conectamos territorios.
              </p>
              <div className="my-5 h-px w-10 bg-border" />
              <dl className="space-y-2.5">
                {SPECS.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-2 text-sm"
                  >
                    <dt className="text-muted-foreground">{spec.label}</dt>
                    <dd className="text-right font-medium">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </motion.aside>
          )}

          {/* Controles de cámara */}
          <motion.div
            className="absolute top-1/2 right-4 z-10 flex -translate-y-1/2 flex-col gap-2 lg:right-8"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Button
              size="icon"
              variant="secondary"
              aria-label="Acercar"
              onClick={() => apiRef.current?.zoomBy(0.8)}
            >
              <Plus className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              aria-label="Alejar"
              onClick={() => apiRef.current?.zoomBy(1.25)}
            >
              <Minus className="size-4" />
            </Button>
            {!inside && (
              <Button
                size="icon"
                variant="secondary"
                aria-label="Reiniciar cámara"
                onClick={() => apiRef.current?.reset()}
              >
                <RotateCcw className="size-4" />
              </Button>
            )}
          </motion.div>

          {/* Auto-rotación */}
          {!inside && (
            <motion.div
              className="absolute bottom-6 left-6 z-10 lg:left-10"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <Button
                size="sm"
                variant={autoRotate ? "default" : "secondary"}
                onClick={() => setAutoRotate((v) => !v)}
                aria-pressed={autoRotate}
              >
                {autoRotate ? (
                  <Pause className="size-3.5" />
                ) : (
                  <Play className="size-3.5" />
                )}
                Auto
              </Button>
            </motion.div>
          )}

          {/* Pie */}
          <motion.p
            className="pointer-events-none absolute inset-x-0 bottom-6 z-0 hidden text-center text-xs text-muted-foreground sm:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            Historias que nos mueven, futuro que construimos.
          </motion.p>
        </>
      )}
    </section>
  );
}
