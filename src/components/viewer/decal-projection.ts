/**
 * Proyección de gráficas sobre la carrocería.
 *
 * Se parchea el material del modelo para que, al pintar cada píxel, mire su
 * posición en el mundo y, si cae dentro del rectángulo de una gráfica, la
 * mezcle sobre la pintura. Es lo mismo que hace el pipeline de Python al
 * hornear la textura, pero en vivo y sin tocar el archivo.
 */
import * as THREE from "three";
import {
  PAINT_BOTTOM_DEFAULT,
  PAINT_TOP_DEFAULT,
  type Decal,
  type Face,
} from "./decals";

/** Luminancia, con los mismos pesos que usa el shader. */
function luma(c: THREE.Color) {
  return c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722;
}

/** Gráficas colocables a la vez. */
export const MAX_DECALS = 10;

/**
 * Unidades de textura reservadas para las gráficas. WebGL garantiza 16 en
 * total y el material ya usa media docena (color, rugosidad, entorno,
 * sombras); pasarse hace que el material NO compile y la carrocería
 * desaparezca por completo. Las gráficas que repiten imagen comparten ranura,
 * así que cinco alcanzan de sobra.
 */
const MAX_TEX = 5;

/** Código de cara que entiende el shader. */
const FACE_CODE: Record<Face, number> = {
  piloto: 0,
  copiloto: 1,
  trasera: 2,
  frontal: 3,
};

/**
 * Línea de cintura en unidades de escena: bajo ella va el color de abajo y
 * sobre ella el de arriba. Sale del horneado (Y=121 del modelo, escalado a los
 * 4,505 m reales).
 */
const BELT_Y = 1.274;

export interface DecalUniforms {
  /** Color de la mitad de arriba, en lineal. */
  uPaintTop: { value: THREE.Color };
  uPaintBottom: { value: THREE.Color };
  /** Luminancia del color horneado: con ella, no cambiar nada es idéntico. */
  uPaintTopRef: { value: number };
  uPaintBottomRef: { value: number };
  uDecalMap: { value: (THREE.Texture | null)[] };
  /** x,y = h0,h1 · z,w = v0,v1 (mundo) */
  uDecalRect: { value: THREE.Vector4[] };
  /** x = cara · y = opacidad · z = giro (rad) · w = activa */
  uDecalMisc: { value: THREE.Vector4[] };
  /** x = ranura de textura · y = 1 si el negro va transparente */
  uDecalTex: { value: THREE.Vector4[] };
}

function makeDecalUniforms(): DecalUniforms {
  const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
  blank.needsUpdate = true;
  return {
    uPaintTop: { value: new THREE.Color(PAINT_TOP_DEFAULT) },
    uPaintBottom: { value: new THREE.Color(PAINT_BOTTOM_DEFAULT) },
    uPaintTopRef: { value: luma(new THREE.Color(PAINT_TOP_DEFAULT)) },
    uPaintBottomRef: { value: luma(new THREE.Color(PAINT_BOTTOM_DEFAULT)) },
    uDecalMap: { value: Array.from({ length: MAX_TEX }, () => blank) },
    uDecalRect: {
      value: Array.from({ length: MAX_DECALS }, () => new THREE.Vector4()),
    },
    uDecalMisc: {
      value: Array.from({ length: MAX_DECALS }, () => new THREE.Vector4()),
    },
    uDecalTex: {
      value: Array.from({ length: MAX_DECALS }, () => new THREE.Vector4()),
    },
  };
}

/**
 * Únicos para toda la app: `useGLTF` cachea el modelo y sus materiales, así
 * que el shader parcheado sobrevive a los remontajes del componente. Con
 * uniforms por instancia, el material quedaría apuntando a los de una
 * instancia ya desmontada y no se vería nada.
 */
let singleton: DecalUniforms | null = null;
export function getDecalUniforms(): DecalUniforms {
  if (!singleton) singleton = makeDecalUniforms();
  return singleton;
}

/** Caché de imágenes, compartida por el mismo motivo. */
export const decalTextures = new Map<string, THREE.Texture>();

/** Los samplers no se indexan por variable: se despliega la elección. */
function texPicker() {
  let code = "";
  for (let t = 0; t < MAX_TEX; t++) {
    code += `if (slot == ${t}) tex = texture2D(uDecalMap[${t}], tuv);\n          `;
  }
  return code;
}

/**
 * Repinta la carrocería sin rehornear. Reconoce la pintura por el color que
 * quedó horneado —negro casi puro abajo, blanco arriba— y respeta todo lo
 * demás: vidrios, pancartas, cromados y focos no son neutros o no caen en esos
 * rangos. Las ruedas sí son negras, así que se descartan por su sitio.
 *
 * En vez de reemplazar el color se traslada: se conserva la diferencia con el
 * tono horneado, de modo que las líneas del panal y las sombras de la textura
 * siguen ahí. Con el color de fábrica, la cuenta da exactamente lo mismo.
 */
function paintBlock() {
  return `
    {
      vec3 base = diffuseColor.rgb;
      float mxc = max(max(base.r, base.g), base.b);
      float mnc = min(min(base.r, base.g), base.b);
      float lum = dot(base, vec3(0.2126, 0.7152, 0.0722));
      bool neutro = (mxc - mnc) < 0.06;
      bool rueda = vDecalPos.y < 0.70 && abs(abs(vDecalPos.z) - 1.35) < 0.45;
      if (neutro && !rueda) {
        if (vDecalPos.y >= ${BELT_Y} && lum > 0.55) {
          diffuseColor.rgb = max(vec3(0.0), uPaintTop + (lum - uPaintTopRef));
        } else if (vDecalPos.y > 0.30 && lum < 0.22) {
          diffuseColor.rgb =
            max(vec3(0.0), uPaintBottom + (lum - uPaintBottomRef));
        }
      }
    }`;
}

/**
 * Un bloque por gráfica. Cada cara usa su propio eje horizontal y su propio
 * sentido: visto desde fuera, en el costado piloto la derecha de pantalla es
 * -Z, y atrás es -X. De ahí los volteos.
 */
function decalBlocks() {
  let code = "";
  for (let i = 0; i < MAX_DECALS; i++) {
    code += `
    {
      vec4 misc = uDecalMisc[${i}];
      if (misc.w > 0.5) {
        float cara = misc.x;
        bool visible = false;
        float hc = 0.0;
        bool voltear = false;

        if (cara < 0.5) {
          visible = vDecalNormal.x > 0.15 && vDecalPos.x > 0.85;
          hc = vDecalPos.z; voltear = true;
        } else if (cara < 1.5) {
          visible = vDecalNormal.x < -0.15 && vDecalPos.x < -0.85;
          hc = vDecalPos.z; voltear = false;
        } else if (cara < 2.5) {
          visible = vDecalNormal.z < -0.4 && vDecalPos.z < -1.9;
          hc = vDecalPos.x; voltear = true;
        } else {
          visible = vDecalNormal.z > 0.4 && vDecalPos.z > 1.9;
          hc = vDecalPos.x; voltear = false;
        }

        if (visible) {
          vec4 rect = uDecalRect[${i}];
          vec2 c = vec2((rect.x + rect.y) * 0.5, (rect.z + rect.w) * 0.5);
          vec2 hs = vec2((rect.y - rect.x) * 0.5, (rect.w - rect.z) * 0.5);
          vec2 p = vec2(hc - c.x, vDecalPos.y - c.y);
          float sr = sin(-misc.z), cr = cos(-misc.z);
          p = vec2(p.x * cr - p.y * sr, p.x * sr + p.y * cr);
          vec2 uv = p / hs * 0.5 + 0.5;
          if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) {
            vec2 tuv = vec2(voltear ? 1.0 - uv.x : uv.x, uv.y);
            int slot = int(uDecalTex[${i}].x);
            vec4 tex = vec4(0.0);
            ${texPicker()}
            float a = uDecalTex[${i}].y > 0.5
              ? max(max(tex.r, tex.g), tex.b)
              : tex.a;
            diffuseColor.rgb = mix(diffuseColor.rgb, tex.rgb, a * misc.y);
          }
        }
      }
    }`;
  }
  return code;
}

/** Deja el material listo para recibir gráficas. Idempotente. */
export function patchMaterial(
  material: THREE.Material,
  uniforms: DecalUniforms,
) {
  const flagged = material as THREE.Material & {
    userData: { decals?: boolean };
  };
  if (flagged.userData.decals) return;
  flagged.userData.decals = true;

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uPaintTop = uniforms.uPaintTop;
    shader.uniforms.uPaintBottom = uniforms.uPaintBottom;
    shader.uniforms.uPaintTopRef = uniforms.uPaintTopRef;
    shader.uniforms.uPaintBottomRef = uniforms.uPaintBottomRef;
    shader.uniforms.uDecalMap = uniforms.uDecalMap;
    shader.uniforms.uDecalRect = uniforms.uDecalRect;
    shader.uniforms.uDecalMisc = uniforms.uDecalMisc;
    shader.uniforms.uDecalTex = uniforms.uDecalTex;

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vDecalPos;
        varying vec3 vDecalNormal;`,
      )
      .replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>
        vDecalPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
        vDecalNormal = normalize(mat3(modelMatrix) * objectNormal);`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vDecalPos;
        varying vec3 vDecalNormal;
        uniform vec3 uPaintTop;
        uniform vec3 uPaintBottom;
        uniform float uPaintTopRef;
        uniform float uPaintBottomRef;
        uniform sampler2D uDecalMap[${MAX_TEX}];
        uniform vec4 uDecalRect[${MAX_DECALS}];
        uniform vec4 uDecalMisc[${MAX_DECALS}];
        uniform vec4 uDecalTex[${MAX_DECALS}];`,
      )
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
        ${paintBlock()}
        ${decalBlocks()}`,
      );
  };
  material.needsUpdate = true;
}

/** Colores de la pintura, en los uniforms. */
export function writePaint(
  uniforms: DecalUniforms,
  top: string,
  bottom: string,
) {
  uniforms.uPaintTop.value.set(top);
  uniforms.uPaintBottom.value.set(bottom);
}

/** Vuelca el estado del editor en los uniforms. */
export function writeUniforms(
  uniforms: DecalUniforms,
  decals: Decal[],
  textures: Map<string, THREE.Texture>,
) {
  // Una ranura por imagen distinta; las repetidas la comparten.
  const slots = new Map<string, number>();
  for (const decal of decals) {
    if (
      !slots.has(decal.src) &&
      textures.has(decal.src) &&
      slots.size < MAX_TEX
    ) {
      const slot = slots.size;
      slots.set(decal.src, slot);
      uniforms.uDecalMap.value[slot] = textures.get(decal.src)!;
    }
  }

  for (let i = 0; i < MAX_DECALS; i++) {
    const decal = decals[i];
    const slot = decal ? slots.get(decal.src) : undefined;
    if (!decal || slot === undefined) {
      uniforms.uDecalMisc.value[i].set(0, 0, 0, 0);
      continue;
    }
    const height = decal.width * decal.aspect;
    uniforms.uDecalRect.value[i].set(
      decal.h - decal.width / 2,
      decal.h + decal.width / 2,
      decal.v - height / 2,
      decal.v + height / 2,
    );
    uniforms.uDecalMisc.value[i].set(
      FACE_CODE[decal.face],
      decal.opacity,
      THREE.MathUtils.degToRad(decal.rotation),
      1,
    );
    uniforms.uDecalTex.value[i].set(slot, decal.knockoutBlack ? 1 : 0, 0, 0);
  }
}
