"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * Carretera detenida: la Kombi está parada en la berma, no en marcha.
 *
 * Todo se genera en el navegador —el asfalto, las líneas y el cielo son
 * texturas dibujadas en un canvas y un degradado— así que la escena no suma
 * ni un archivo que descargar.
 *
 * La Kombi mira hacia +Z y ocupa el carril derecho: la línea segmentada del
 * eje queda a su izquierda y la continua del borde, a su derecha.
 */

const LARGO = 400; // metros de calzada, suficiente para perderse en la niebla
const MEDIA_CALZADA = 3.4; // del centro de la Kombi a cada línea

/** Asfalto: gris con grano, para que no se vea como una superficie plana. */
function useAsfalto() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#35363a";
    ctx.fillRect(0, 0, 512, 512);
    // Grano del árido. Con puntos de dos tonos basta para romper el plano.
    for (let i = 0; i < 24000; i++) {
      const claro = Math.random() > 0.5;
      ctx.fillStyle = claro ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.22)";
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 120);
    tex.anisotropy = 8;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

/** Línea pintada: continua, o segmentada con su hueco. */
function useLinea(segmentada: boolean) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 8;
    c.height = 64;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, 8, 64);
    ctx.fillStyle = "#d8d4c8"; // blanco gastado por el sol
    ctx.fillRect(0, 0, 8, segmentada ? 24 : 64);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, segmentada ? 40 : 1);
    tex.anisotropy = 8;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [segmentada]);
}

function Linea({ x, segmentada }: { x: number; segmentada: boolean }) {
  const tex = useLinea(segmentada);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.004, 0]}>
      <planeGeometry args={[0.14, LARGO]} />
      <meshStandardMaterial
        map={tex}
        transparent
        roughness={0.7}
        polygonOffset
        polygonOffsetFactor={-2}
      />
    </mesh>
  );
}

/** Cielo de tarde: degradado del horizonte al cenit, sin textura. */
function Cielo({ horizonte, cenit }: { horizonte: string; cenit: string }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          uHorizonte: { value: new THREE.Color(horizonte) },
          uCenit: { value: new THREE.Color(cenit) },
        },
        vertexShader: `
          varying float vAltura;
          void main() {
            vAltura = normalize(position).y;
            gl_Position =
              projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          uniform vec3 uHorizonte;
          uniform vec3 uCenit;
          varying float vAltura;
          void main() {
            float t = smoothstep(-0.05, 0.55, vAltura);
            gl_FragColor = vec4(mix(uHorizonte, uCenit, t), 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [horizonte, cenit],
  );
  return (
    <mesh material={material} scale={280}>
      <sphereGeometry args={[1, 32, 16]} />
    </mesh>
  );
}

/**
 * Cerros en el horizonte. Son conos aplastados a más de cien metros, así que
 * la niebla se los come casi enteros y solo queda la silueta: alcanza para
 * que la carretera no termine en una línea recta y vacía.
 */
function Cerros({ color }: { color: string }) {
  const cerros = useMemo(() => {
    // Fijos a propósito: una silueta al azar cambia en cada recarga.
    const perfil: [number, number, number, number][] = [
      // x, z, radio, alto
      [-95, -125, 55, 44],
      [-20, -150, 78, 66],
      [60, -132, 48, 38],
      [130, -150, 70, 58],
      [-165, -115, 46, 32],
      [175, -120, 52, 40],
    ];
    return perfil;
  }, []);

  return (
    <group>
      {cerros.map(([x, z, r, h], i) => (
        <mesh key={i} position={[x, h / 2 - 4, z]}>
          <coneGeometry args={[r, h, 5]} />
          <meshStandardMaterial color={color} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
}

export interface RoadColors {
  horizonte: string;
  cenit: string;
  tierra: string;
  cerros: string;
  niebla: string;
}

/** Suelo, líneas, berma y cielo. La iluminación va aparte, en la escena. */
export function RoadStage({ colors }: { colors: RoadColors }) {
  const asfalto = useAsfalto();

  return (
    <>
      <Cielo horizonte={colors.horizonte} cenit={colors.cenit} />
      <Cerros color={colors.cerros} />

      {/* Terreno hasta el horizonte, bajo la calzada */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color={colors.tierra} roughness={1} />
      </mesh>

      {/* Calzada */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[MEDIA_CALZADA * 2 + 1.2, LARGO]} />
        <meshStandardMaterial map={asfalto} roughness={0.85} />
      </mesh>

      <Linea x={-MEDIA_CALZADA} segmentada />
      <Linea x={MEDIA_CALZADA} segmentada={false} />
    </>
  );
}
