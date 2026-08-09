/**
 * Gráficas que se colocan sobre la Kombi desde el navegador.
 *
 * Van pintadas sobre la chapa: el material del modelo mira la posición de
 * cada píxel en el mundo y, si cae dentro del rectángulo de una gráfica, la
 * mezcla sobre la pintura. No son calcomanías flotando delante.
 *
 * El modelo trae la pintura y el panal horneados; los elementos de marca van
 * todos por aquí, para poder moverlos y redimensionarlos sin rehornear nada.
 */

/** Cara de la carrocería sobre la que se pega la gráfica. */
export type Face = "piloto" | "copiloto" | "trasera" | "frontal";

export const FACES: { id: Face; label: string }[] = [
  { id: "piloto", label: "Costado piloto" },
  { id: "copiloto", label: "Costado copiloto" },
  { id: "trasera", label: "Atrás" },
  { id: "frontal", label: "Adelante" },
];

export interface Decal {
  id: string;
  name: string;
  face: Face;
  /** Imagen: ruta de /graficas o data URL de una subida. */
  src: string;
  /** Centro de la gráfica sobre la cara, en unidades de escena. */
  h: number;
  v: number;
  /** Ancho; el alto sale del aspecto de la imagen. */
  width: number;
  /** Alto / ancho de la imagen original. */
  aspect: number;
  /** Giro en grados sobre el plano de la cara. */
  rotation: number;
  /**
   * Voltea la imagen horizontalmente. Los textos ya se leen bien en los dos
   * costados; esto es para las siluetas, que en un lado tienen que mirar
   * hacia el otro.
   */
  mirror?: boolean;
  opacity: number;
  /**
   * Con `true`, el negro de la imagen se vuelve transparente. Sirve para
   * logos claros sobre fondo negro en JPG, que no traen transparencia.
   */
  knockoutBlack: boolean;
}

/**
 * Zona útil de cada cara, medida sobre el modelo y pasada a unidades de
 * escena. `h` es el eje horizontal visto desde fuera y `v` la altura.
 */
export const AREAS: Record<
  Face,
  { hMin: number; hMax: number; vMin: number; vMax: number }
> = {
  // Costados: h recorre el largo (Z), de la cola al morro.
  piloto: { hMin: -2.15, hMax: 2.0, vMin: 0.42, vMax: 1.28 },
  copiloto: { hMin: -2.15, hMax: 2.0, vMin: 0.42, vMax: 1.28 },
  // Frente y trasera: h recorre el ancho (X).
  trasera: { hMin: -0.82, hMax: 0.82, vMin: 0.38, vMax: 1.3 },
  frontal: { hMin: -0.82, hMax: 0.82, vMin: 0.38, vMax: 1.3 },
};

/** Elementos de marca listos para colocar, en /public/graficas. */
export const LIBRARY: { name: string; src: string; aspect: number }[] = [
  { name: "Pudú", src: "/graficas/pudu.png", aspect: 241 / 219 },
  { name: "Frase", src: "/graficas/frase.png", aspect: 156 / 364 },
  {
    name: "Auspiciadores",
    src: "/graficas/auspiciadores.png",
    aspect: 120 / 262,
  },
  { name: "Logo PUDÚ", src: "/graficas/logo.png", aspect: 67 / 126 },
];

/**
 * Colores horneados en el modelo. Son el punto de partida y, además, la
 * referencia del shader: mientras no se cambien, la Kombi se ve tal cual salió
 * del horneado.
 */
export const PAINT_TOP_DEFAULT = "#f2f2f0";
export const PAINT_BOTTOM_DEFAULT = "#101010";

/** Todo lo que define cómo se ve la Kombi: pintura y gráficas. */
export interface Livery {
  /** Color de la mitad de arriba (techo y sobre la línea de cintura). */
  top: string;
  /** Color de la franja de abajo. */
  bottom: string;
  decals: Decal[];
}

export function defaultLivery(): Livery {
  return {
    top: PAINT_TOP_DEFAULT,
    bottom: PAINT_BOTTOM_DEFAULT,
    decals: defaultDecals(),
  };
}

/** Acepta el formato viejo (solo la lista de gráficas) y el actual. */
function parseLivery(value: unknown): Livery | null {
  if (Array.isArray(value)) {
    return { ...defaultLivery(), decals: value as Decal[] };
  }
  if (value && typeof value === "object") {
    const v = value as Partial<Livery>;
    if (!Array.isArray(v.decals)) return null;
    return {
      top: typeof v.top === "string" ? v.top : PAINT_TOP_DEFAULT,
      bottom: typeof v.bottom === "string" ? v.bottom : PAINT_BOTTOM_DEFAULT,
      decals: v.decals,
    };
  }
  return null;
}

const STORAGE_KEY = "pudu-kombi-graficas-v1";

/**
 * Devuelve lo guardado, o `null` si nunca se editó. Distinguir ambos casos
 * importa: una lista vacía es una decisión y hay que respetarla.
 */
export function loadLivery(): Livery | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    return parseLivery(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveLivery(livery: Livery) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(livery));
  } catch {
    throw new Error(
      "No se pudo guardar: el navegador se quedó sin espacio. Usa imágenes más livianas o borra alguna.",
    );
  }
}

/**
 * Disposición publicada: un archivo del sitio, igual para todo el que entre.
 * El guardado del navegador es el borrador; esto es lo que sale en la página.
 */
export const PUBLISHED_URL = "/graficas/layout.json";

/** Lee lo publicado. `null` si todavía no se ha publicado nada. */
export async function fetchPublishedLivery(): Promise<Livery | null> {
  try {
    const res = await fetch(PUBLISHED_URL, { cache: "no-store" });
    if (!res.ok) return null;
    return parseLivery(await res.json());
  } catch {
    return null;
  }
}

/** Deja la disposición actual como la oficial de la página. */
export async function publishLivery(livery: Livery): Promise<void> {
  const res = await fetch("/api/graficas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(livery),
  });
  if (!res.ok) {
    const detalle: unknown = await res.json().catch(() => null);
    const mensaje =
      detalle &&
      typeof detalle === "object" &&
      typeof (detalle as { error?: unknown }).error === "string"
        ? (detalle as { error: string }).error
        : "No se pudo publicar.";
    throw new Error(mensaje);
  }
}

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Reduce la imagen antes de guardarla: en localStorage caben unos 5 MB y una
 * foto de cámara se los come entera.
 */
export function fileToDecalSource(
  file: File,
  maxWidth = 1200,
): Promise<{ src: string; aspect: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("El archivo no es una imagen."));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo procesar la imagen."));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        // PNG conserva la transparencia; el resto va a JPEG para pesar menos.
        const isPng = /png/i.test(file.type);
        resolve({
          src: isPng
            ? canvas.toDataURL("image/png")
            : canvas.toDataURL("image/jpeg", 0.86),
          aspect: img.height / img.width,
        });
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Disposición de partida: las mismas piezas que antes iban horneadas en el
 * modelo, ahora sueltas para poder moverlas y redimensionarlas. Las medidas
 * salen de calcular dónde quedaba cada una en la textura anterior, así que
 * al abrir el editor la Kombi se ve igual que siempre.
 */
export function defaultDecals(): Decal[] {
  // [archivo, horizontal, altura, ancho] en unidades de escena
  const layout: [string, number, number, number][] = [
    ["/graficas/pudu.png", -1.682, 0.896, 0.698],
    ["/graficas/auspiciadores.png", -0.664, 1.022, 0.835],
    ["/graficas/frase.png", 0.585, 1.028, 1.158],
    ["/graficas/logo.png", 1.617, 1.023, 0.402],
  ];
  const out: Decal[] = [];
  for (const face of ["piloto", "copiloto"] as Face[]) {
    for (const [src, h, v, width] of layout) {
      const item = LIBRARY.find((l) => l.src === src);
      if (!item) continue;
      out.push({
        ...makeDecal(item.name, src, item.aspect, face),
        // Mismo sitio en los dos costados: el morro es +Z para ambos. El
        // espejo lo resuelve el shader al muestrear, para que se lea bien.
        h,
        v,
        width,
      });
    }
  }
  return out;
}

/** Gráfica nueva, centrada en la cara y a un tamaño prudente. */
export function makeDecal(
  name: string,
  src: string,
  aspect: number,
  face: Face = "piloto",
): Decal {
  const area = AREAS[face];
  const lado = face === "piloto" || face === "copiloto";
  return {
    id: newId(),
    name,
    face,
    src,
    h: (area.hMin + area.hMax) / 2,
    v: (area.vMin + area.vMax) / 2,
    width: lado ? 0.9 : 0.5,
    aspect,
    rotation: 0,
    mirror: false,
    opacity: 1,
    knockoutBlack: false,
  };
}
