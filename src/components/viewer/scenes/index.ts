import type { RoadColors } from "./road";

/**
 * Escenas en las que se puede mostrar la Kombi. La elegida se guarda y se
 * publica junto con la gráfica, así que la página abre en la que corresponda.
 *
 * Van a ser tres; por ahora el estudio de siempre y la carretera.
 */
export type SceneId = "estudio" | "carretera";

export const SCENES: {
  estudio: { id: "estudio"; label: string };
  carretera: { id: "carretera"; label: string; colors: RoadColors };
} = {
  estudio: { id: "estudio", label: "Estudio" },
  carretera: {
    id: "carretera",
    label: "Carretera",
    colors: {
      // Atardecer del sur: horizonte cálido, cielo que se apaga hacia arriba.
      horizonte: "#c9a688",
      cenit: "#2f3f4e",
      tierra: "#3a3a32",
      cerros: "#585a55",
      niebla: "#9d9384",
    },
  },
};

export const SCENE_LIST = [SCENES.estudio, SCENES.carretera] as const;

export function isSceneId(value: unknown): value is SceneId {
  return value === "estudio" || value === "carretera";
}
