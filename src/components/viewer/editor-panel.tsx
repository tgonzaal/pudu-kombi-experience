"use client";

import { useRef, type ChangeEvent } from "react";
import { Check, Download, FileUp, Save, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AREAS,
  FACES,
  LIBRARY,
  PAINT_BOTTOM_DEFAULT,
  PAINT_TOP_DEFAULT,
  type Decal,
  type Face,
} from "./decals";
import { SCENE_LIST, type SceneId } from "./scenes";

/** Muestra de color con su valor, para elegir la pintura. */
function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-md border p-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="size-7 cursor-pointer rounded border-0 bg-transparent p-0"
        aria-label={`Color ${label}`}
      />
      <span className="min-w-0">
        <span className="block text-xs font-medium">{label}</span>
        <span className="block text-[10px] text-muted-foreground uppercase">
          {value}
        </span>
      </span>
    </label>
  );
}

interface EditorPanelProps {
  decals: Decal[];
  selectedId: string | null;
  error: string | null;
  onSelect: (id: string) => void;
  onAddFiles: (files: FileList) => void;
  onAddFromLibrary: (src: string) => void;
  onUpdate: (id: string, patch: Partial<Decal>) => void;
  onRemove: (id: string) => void;
  scene: SceneId;
  onScene: (scene: SceneId) => void;
  paintTop: string;
  paintBottom: string;
  onPaint: (patch: { top?: string; bottom?: string }) => void;
  hasDraft: boolean;
  onDiscard: () => void;
  onPublish: () => void;
  publishing: boolean;
  published: boolean;
  onExport: () => void;
  onImport: (file: File) => void;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">
          {value.toFixed(2)}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-primary"
      />
    </label>
  );
}

export function EditorPanel({
  decals,
  selectedId,
  error,
  onSelect,
  onAddFiles,
  onAddFromLibrary,
  onUpdate,
  onRemove,
  scene,
  onScene,
  paintTop,
  paintBottom,
  onPaint,
  hasDraft,
  onDiscard,
  onPublish,
  publishing,
  published,
  onExport,
  onImport,
}: EditorPanelProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const selected = decals.find((d) => d.id === selectedId) ?? null;
  const area = selected ? AREAS[selected.face] : null;

  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) onAddFiles(e.target.files);
    e.target.value = "";
  };

  return (
    <aside className="flex h-full w-full flex-col gap-4 overflow-y-auto border-l bg-card/95 p-5 backdrop-blur md:w-80">
      <div>
        <h2 className="font-display text-lg font-bold">Gráficas</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Se suman a la gráfica que ya trae la Kombi. Arrástralas sobre la
          carrocería y se guardan solas.
        </p>
      </div>

      <div>
        <span className="text-xs text-muted-foreground">Escena</span>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {SCENE_LIST.map((e) => (
            <Button
              key={e.id}
              size="sm"
              variant={scene === e.id ? "default" : "secondary"}
              className="text-xs"
              onClick={() => onScene(e.id)}
            >
              {e.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-xs text-muted-foreground">Pintura</span>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <ColorField
            label="Arriba"
            value={paintTop}
            onChange={(top) => onPaint({ top })}
          />
          <ColorField
            label="Abajo"
            value={paintBottom}
            onChange={(bottom) => onPaint({ bottom })}
          />
        </div>
        <button
          className="mt-2 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          onClick={() =>
            onPaint({ top: PAINT_TOP_DEFAULT, bottom: PAINT_BOTTOM_DEFAULT })
          }
        >
          Volver a los colores originales
        </button>
      </div>

      <div>
        <span className="text-xs text-muted-foreground">Elementos PUDÚ</span>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {LIBRARY.map((item) => (
            <button
              key={item.src}
              onClick={() => onAddFromLibrary(item.src)}
              title={`Agregar ${item.name}`}
              className="flex flex-col items-center gap-1 rounded-md border bg-black/90 p-2 transition-colors hover:border-primary"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt={item.name}
                className="h-10 w-full object-contain"
              />
              <span className="text-[10px] text-white/80">{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      <Button size="sm" onClick={() => fileInput.current?.click()}>
        <Upload className="size-4" />
        Subir una marca
      </Button>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={pick}
      />

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="space-y-1">
        {decals.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Todavía no agregaste ninguna.
          </p>
        )}
        {decals.map((d) => (
          <button
            key={d.id}
            onClick={() => onSelect(d.id)}
            className={`flex w-full items-center gap-2 rounded-md border p-2 text-left text-xs transition-colors ${
              d.id === selectedId
                ? "border-primary bg-primary/10"
                : "hover:bg-secondary"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={d.src}
              alt=""
              className="h-8 w-12 shrink-0 rounded border bg-black object-contain"
            />
            <span className="min-w-0 flex-1 truncate">{d.name}</span>
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {FACES.find((f) => f.id === d.face)
                ?.label.split(" ")
                .pop()}
            </span>
          </button>
        ))}
      </div>

      {selected && area && (
        <div className="space-y-4 border-t pt-4">
          <div>
            <span className="text-xs text-muted-foreground">Dónde va</span>
            <div className="mt-1 grid grid-cols-2 gap-1">
              {FACES.map((f) => (
                <Button
                  key={f.id}
                  size="sm"
                  variant={selected.face === f.id ? "default" : "secondary"}
                  className="text-xs"
                  onClick={() => {
                    // Al cambiar de cara, se recentra: las coordenadas de una
                    // no significan lo mismo en la otra.
                    const a = AREAS[f.id as Face];
                    onUpdate(selected.id, {
                      face: f.id,
                      h: (a.hMin + a.hMax) / 2,
                      v: (a.vMin + a.vMax) / 2,
                    });
                  }}
                >
                  {f.label.replace("Costado ", "")}
                </Button>
              ))}
            </div>
          </div>

          <Slider
            label="Horizontal"
            value={selected.h}
            min={area.hMin}
            max={area.hMax}
            step={0.01}
            onChange={(h) => onUpdate(selected.id, { h })}
          />
          <Slider
            label="Altura"
            value={selected.v}
            min={area.vMin}
            max={area.vMax}
            step={0.01}
            onChange={(v) => onUpdate(selected.id, { v })}
          />
          <Slider
            label="Tamaño"
            value={selected.width}
            min={0.05}
            max={2.5}
            step={0.01}
            onChange={(width) => onUpdate(selected.id, { width })}
          />
          <Slider
            label="Giro"
            value={selected.rotation}
            min={-30}
            max={30}
            step={0.5}
            suffix="°"
            onChange={(rotation) => onUpdate(selected.id, { rotation })}
          />
          <Slider
            label="Opacidad"
            value={selected.opacity}
            min={0.1}
            max={1}
            step={0.01}
            onChange={(opacity) => onUpdate(selected.id, { opacity })}
          />

          <label className="flex items-start gap-2 text-xs">
            <input
              type="checkbox"
              checked={selected.mirror ?? false}
              onChange={(e) =>
                onUpdate(selected.id, { mirror: e.target.checked })
              }
              className="mt-0.5 accent-primary"
            />
            <span>
              <span className="font-medium">Espejar</span>
              <span className="block text-muted-foreground">
                Voltea la imagen. Para que una silueta mire hacia el otro lado.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-2 text-xs">
            <input
              type="checkbox"
              checked={selected.knockoutBlack}
              onChange={(e) =>
                onUpdate(selected.id, { knockoutBlack: e.target.checked })
              }
              className="mt-0.5 accent-primary"
            />
            <span>
              <span className="font-medium">Quitar fondo negro</span>
              <span className="block text-muted-foreground">
                Para logos claros sobre negro en JPG, que no traen
                transparencia.
              </span>
            </span>
          </label>

          <Button
            size="sm"
            variant="secondary"
            className="w-full text-destructive"
            onClick={() => onRemove(selected.id)}
          >
            <Trash2 className="size-4" />
            Eliminar
          </Button>
        </div>
      )}

      <div className="mt-auto space-y-2 border-t pt-4">
        <Button className="w-full" onClick={onPublish} disabled={publishing}>
          {published ? (
            <Check className="size-4" />
          ) : (
            <Save className="size-4" />
          )}
          {publishing
            ? "Guardando…"
            : published
              ? "Guardado en la página"
              : "Guardar en la página"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Mientras editas se guarda un borrador en este navegador; al cerrar el
          editor se muestra lo publicado. Al guardar en la página, esto pasa a
          ser lo que ve cualquiera.
        </p>
        {hasDraft && (
          <button
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            onClick={onDiscard}
          >
            Descartar mis cambios y volver a lo publicado
          </button>
        )}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="flex-1"
            onClick={onExport}
            disabled={decals.length === 0}
          >
            <Download className="size-4" />
            Exportar
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="flex-1"
            onClick={() => importInput.current?.click()}
          >
            <FileUp className="size-4" />
            Importar
          </Button>
          <input
            ref={importInput}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImport(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>
    </aside>
  );
}
