/**
 * Dimensiones maestras de la Kombi (en metros, piso en y=0).
 * Toda la geometría procedural se deriva de estos valores.
 */
export const DIM = {
  halfL: 2.2, // mitad del largo (x: -2.2 trasera … +2.2 frente)
  halfW: 0.86, // mitad del ancho (z: ±0.86)
  t: 0.05, // espesor de paneles

  rockerBottom: 0.38, // borde inferior de la carrocería
  doorBottom: 0.78, // umbral de las puertas
  belt: 1.32, // línea de cintura (inicio de ventanas)
  winTop: 1.8, // techo de ventanas
  railTop: 1.94, // riel superior (base del techo)
  floorTop: 0.725, // piso interior

  axleX: 1.45, // posición de los ejes
  wheelR: 0.34,
  wheelZ: 0.72,
  archR: 0.42, // radio del arco de rueda
  archCY: 0.36, // centro vertical del arco

  doorFrontX: 1.85, // puertas delanteras: x 1.05 … 1.85
  doorRearX: 1.05,
  sliderFrontX: 0.97, // puerta corrediza (solo lado derecho): x 0.02 … 0.97
  sliderRearX: 0.02,
  bulkheadX: -1.78, // mamparo trasero (separa cabina del vano motor)
} as const;

export type PartKey = "driver" | "copilot" | "slider" | "tailgate" | "engine";

export type KombiOpenState = Record<PartKey, boolean>;

export const CLOSED_STATE: KombiOpenState = {
  driver: false,
  copilot: false,
  slider: false,
  tailgate: false,
  engine: false,
};

export const PART_LABELS: Record<PartKey, string> = {
  driver: "Puerta conductor",
  copilot: "Puerta copiloto",
  slider: "Puerta lateral",
  tailgate: "Portón trasero",
  engine: "Motor",
};
