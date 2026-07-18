/**
 * Configuración del visor 3D de la Kombi.
 *
 * El visor NO genera geometría propia: carga un modelo GLB/GLTF
 * profesional de una Volkswagen Type 2 T2 Bay Window colocado en
 * `public/models/kombi.glb`. Ver README → "Visor 3D" para el flujo
 * de licenciamiento y optimización del modelo.
 */

/** Ruta pública del modelo. Reemplázalo por tu GLB licenciado. */
export const KOMBI_MODEL_URL = "/models/kombi.glb";

/** Decoder Draco servido localmente (copiado desde three). */
export const DRACO_DECODER_PATH = "/draco/";

/** Largo real de una T2 Bay Window (m). El modelo se normaliza a esta escala. */
export const TARGET_LENGTH = 4.505;

/**
 * Si tu GLB ya trae la gráfica PUDÚ horneada en sus texturas, deja
 * esto en `false` (recomendado). Si el modelo viene sin livery y
 * quieres aplicar solo la pintura verde PUDÚ por código, ponlo en
 * `true`: los materiales cuyo nombre coincida con
 * `PAINT_MATERIAL_PATTERNS` se reemplazan por pintura automotriz
 * PBR verde (clearcoat físicamente correcto).
 */
export const APPLY_PUDU_PAINT = false;

/** Verde PUDÚ tomado de la imagen de referencia. */
export const PUDU_GREEN = "#14603c";

/** Patrones de nombre de material que se consideran "pintura de carrocería". */
export const PAINT_MATERIAL_PATTERNS = [
  /paint/i,
  /body/i,
  /carrocer/i,
  /car[_ ]?shell/i,
  /lack/i,
];
