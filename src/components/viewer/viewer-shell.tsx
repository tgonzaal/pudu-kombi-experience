"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useProgress } from "@react-three/drei";
import {
  Check,
  Minus,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditorPanel } from "./editor-panel";
import { KOMBI_MODEL_URL } from "./config";
import { MAX_DECALS } from "./decal-projection";
import {
  FACES,
  LIBRARY,
  clearLivery,
  defaultLivery,
  fetchPublishedLivery,
  fileToDecalSource,
  loadLivery,
  makeDecal,
  publishLivery,
  saveLivery,
  type Decal,
  type Livery,
} from "./decals";
import type { ViewerApi } from "./viewer-scene";

const ViewerScene = dynamic(() => import("./viewer-scene"), { ssr: false });

type ModelStatus = "checking" | "ready" | "missing";

/** Pantalla de carga con progreso real de descarga del GLB. */
function ViewerLoader({ visible }: { visible: boolean }) {
  const { progress } = useProgress();
  if (!visible) return null;
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-background/95">
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
 * Visor 3D de la Kombi con el editor incorporado.
 *
 * La escena es una sola y ocupa siempre la página entera; el editor se abre
 * como panel encima. Al no montar un segundo lienzo, la Kombi no se pierde al
 * pasar de mirar a editar.
 *
 * Lo que se ve por defecto es la versión publicada (`layout.json`). Al editar
 * se trabaja sobre un borrador local, y "Guardar en la página" lo publica.
 */
export function ViewerShell() {
  const apiRef = useRef<ViewerApi | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [status, setStatus] = useState<ModelStatus>("checking");
  const [sceneReady, setSceneReady] = useState(false);

  /** Lo que ve cualquiera que entre. */
  const [oficial, setOficial] = useState<Livery>(defaultLivery);
  /** Cambios sin publicar, guardados solo en este navegador. */
  const [borrador, setBorrador] = useState<Livery | null>(null);
  const [editing, setEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  // Hasta cargar lo guardado no se guarda nada: si no, el autoguardado se
  // dispara con el estado del primer render y pisa lo que había.
  const [loaded, setLoaded] = useState(false);

  /**
   * Mirando se ve lo publicado, siempre. El borrador aparece al abrir el
   * editor: si mandara también fuera de él, cada quien vería su propia Kombi
   * y creería que lo publicado no llegó.
   */
  const livery = editing ? (borrador ?? oficial) : oficial;
  const { decals } = livery;

  useEffect(() => {
    let vivo = true;
    setBorrador(loadLivery());
    fetchPublishedLivery().then((publicada) => {
      if (!vivo) return;
      if (publicada) setOficial(publicada);
      setLoaded(true);
    });
    return () => {
      vivo = false;
    };
  }, []);

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

  /**
   * Único punto de guardado del borrador. Espera un momento porque arrastrar
   * una gráfica dispara decenas de cambios por segundo.
   */
  useEffect(() => {
    if (!loaded || !borrador) return;
    const t = setTimeout(() => {
      try {
        saveLivery(borrador);
        setError((e) => (e?.startsWith("No se pudo guardar") ? null : e));
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo guardar.");
      }
    }, 400);
    return () => clearTimeout(t);
  }, [borrador, loaded]);

  /**
   * Siempre a partir del estado anterior: dos cambios en el mismo instante
   * —mover una gráfica y tocar un color— si no, se pisan entre ellos.
   */
  const commit = useCallback(
    (mut: (prev: Livery) => Livery) => {
      setPublished(false);
      setBorrador((prev) => mut(prev ?? oficial));
    },
    [oficial],
  );

  /** Vuelve a lo publicado y bota lo que había en este navegador. */
  const descartar = useCallback(() => {
    clearLivery();
    setBorrador(null);
    setSelectedId(null);
    setError(null);
  }, []);

  const setDecals = useCallback(
    (mut: (prev: Decal[]) => Decal[]) =>
      commit((prev) => ({ ...prev, decals: mut(prev.decals) })),
    [commit],
  );

  const lleno = decals.length >= MAX_DECALS;

  const addFromLibrary = useCallback(
    (src: string) => {
      if (lleno) {
        setError(`Máximo ${MAX_DECALS} gráficas. Elimina alguna para seguir.`);
        return;
      }
      const item = LIBRARY.find((l) => l.src === src);
      if (!item) return;
      const decal = makeDecal(item.name, item.src, item.aspect);
      setDecals((prev) => [...prev, decal]);
      setSelectedId(decal.id);
    },
    [setDecals, lleno],
  );

  const addFiles = useCallback(
    async (files: FileList) => {
      if (lleno) {
        setError(`Máximo ${MAX_DECALS} gráficas. Elimina alguna para seguir.`);
        return;
      }
      try {
        const added: Decal[] = [];
        for (const file of Array.from(files).slice(
          0,
          MAX_DECALS - decals.length,
        )) {
          const { src, aspect } = await fileToDecalSource(file);
          added.push(makeDecal(file.name.replace(/\.[^.]+$/, ""), src, aspect));
        }
        setDecals((prev) => [...prev, ...added]);
        if (added.length) setSelectedId(added[added.length - 1].id);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "No se pudo cargar la imagen.",
        );
      }
    },
    [decals, setDecals, lleno],
  );

  const update = useCallback(
    (id: string, patch: Partial<Decal>) => {
      setDecals((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      );
    },
    [setDecals],
  );

  const remove = useCallback(
    (id: string) => {
      setDecals((prev) => prev.filter((d) => d.id !== id));
      setSelectedId(null);
    },
    [setDecals],
  );

  /** Durante el arrastre no conviene tocar localStorage en cada cuadro. */
  const move = useCallback(
    (id: string, h: number, v: number) => {
      setDecals((prev) => prev.map((d) => (d.id === id ? { ...d, h, v } : d)));
    },
    [setDecals],
  );

  const paint = useCallback(
    (patch: { top?: string; bottom?: string }) =>
      commit((prev) => ({ ...prev, ...patch })),
    [commit],
  );

  const publish = useCallback(async () => {
    setPublishing(true);
    try {
      await publishLivery(livery);
      setOficial(livery);
      setBorrador(null);
      clearLivery();
      setPublished(true);
      setError(null);
    } catch (e) {
      setPublished(false);
      setError(e instanceof Error ? e.message : "No se pudo publicar.");
    } finally {
      setPublishing(false);
    }
  }, [livery]);

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(livery, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kombi-graficas.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [livery]);

  const importJson = useCallback(
    async (file: File) => {
      try {
        const parsed: unknown = JSON.parse(await file.text());
        if (Array.isArray(parsed)) {
          setDecals(() => parsed as Decal[]);
        } else if (parsed && typeof parsed === "object") {
          commit(() => parsed as Livery);
        } else {
          throw new Error("Formato no reconocido.");
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "El archivo no se pudo leer.",
        );
      }
    },
    [commit, setDecals],
  );

  const showLoader = status === "checking" || !sceneReady;

  return (
    <section
      className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden"
      aria-label="Visor 3D de la Kombi PUDÚ"
    >
      {status !== "checking" && (
        <ViewerScene
          autoRotate={autoRotate && !editing}
          modelAvailable={status === "ready"}
          apiRef={apiRef}
          onReady={() => setSceneReady(true)}
          decals={decals}
          paintTop={livery.top}
          paintBottom={livery.bottom}
          editing={editing}
          selectedDecalId={selectedId}
          onSelectDecal={setSelectedId}
          onMoveDecal={move}
        />
      )}

      <ViewerLoader visible={showLoader} />

      {!showLoader && (
        <>
          {/* Panel de identidad, solo mientras se mira */}
          {!editing && (
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
            </motion.aside>
          )}

          {/* Abrir y cerrar el editor */}
          <div className="absolute top-6 right-4 z-30 lg:right-8">
            <Button
              size="sm"
              variant={editing ? "default" : "secondary"}
              onClick={() => setEditing((v) => !v)}
              aria-expanded={editing}
            >
              {editing ? (
                <>
                  <X className="size-4" />
                  Cerrar
                </>
              ) : (
                <>
                  <Pencil className="size-4" />
                  Editar
                </>
              )}
            </Button>
          </div>

          {/* Vistas de cada cara, mientras se edita */}
          {editing && (
            <div className="absolute top-6 left-4 z-10 flex flex-wrap gap-2 lg:left-8">
              {FACES.map((f) => (
                <Button
                  key={f.id}
                  size="sm"
                  variant="secondary"
                  onClick={() => apiRef.current?.viewFace(f.id)}
                >
                  {f.label.replace("Costado ", "")}
                </Button>
              ))}
            </div>
          )}

          {/* Controles de cámara */}
          <motion.div
            className={`absolute top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2 ${
              editing ? "right-4 md:right-84" : "right-4 lg:right-8"
            }`}
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
            <Button
              size="icon"
              variant="secondary"
              aria-label="Reiniciar cámara"
              onClick={() => apiRef.current?.reset()}
            >
              <RotateCcw className="size-4" />
            </Button>
          </motion.div>

          {/* Auto-rotación */}
          {!editing && (
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
          {!editing && (
            <motion.p
              className="pointer-events-none absolute inset-x-0 bottom-6 z-0 hidden text-center text-xs text-muted-foreground sm:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Historias que nos mueven, futuro que construimos.
            </motion.p>
          )}

          {editing && (
            <>
              <p className="pointer-events-none absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 rounded-full bg-background/80 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur md:block">
                Arrastra la gráfica para moverla · gira la Kombi arrastrando el
                fondo
              </p>
              <motion.div
                className="absolute inset-y-0 right-0 z-20 w-full max-w-80"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                transition={{ type: "tween", duration: 0.25 }}
              >
                <EditorPanel
                  decals={decals}
                  selectedId={selectedId}
                  error={error}
                  onSelect={setSelectedId}
                  onAddFiles={addFiles}
                  onAddFromLibrary={addFromLibrary}
                  onUpdate={update}
                  onRemove={remove}
                  paintTop={livery.top}
                  paintBottom={livery.bottom}
                  onPaint={paint}
                  hasDraft={borrador !== null}
                  onDiscard={descartar}
                  onPublish={publish}
                  publishing={publishing}
                  published={published}
                  onExport={exportJson}
                  onImport={importJson}
                />
              </motion.div>
            </>
          )}
        </>
      )}

      {/* Confirmación discreta de que quedó publicado */}
      {published && !publishing && (
        <p className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground">
          <Check className="size-3.5" />
          Guardado en la página
        </p>
      )}
    </section>
  );
}
