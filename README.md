# PUDÚ Kombi Experience

Experiencia web inmersiva a bordo de la Kombi de PUDÚ. Base profesional lista para escalar con la experiencia 3D.

## Stack

- **Next.js 15** (App Router, Turbopack) + **React 19** + **TypeScript**
- **TailwindCSS v4** — tokens de diseño en CSS variables, tema claro/oscuro
- **shadcn/ui** — componentes UI (estilo new-york, listos para `npx shadcn add`)
- **React Three Fiber + Three.js + Drei** — instalados, reservados para la experiencia 3D
- **GSAP + Framer Motion** — animación
- **next-themes** — modo claro/oscuro con preferencia del sistema
- **ESLint 9 + Prettier** (con plugin de Tailwind)

## Empezar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

| Script                 | Descripción                          |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Servidor de desarrollo con Turbopack |
| `npm run build`        | Build de producción                  |
| `npm run start`        | Servir el build de producción        |
| `npm run lint`         | ESLint                               |
| `npm run lint:fix`     | ESLint con autofix                   |
| `npm run format`       | Formatear con Prettier               |
| `npm run format:check` | Verificar formato                    |
| `npm run type-check`   | Verificación de tipos (tsc)          |

## Estructura

```
src/
├── app/                  # Rutas (App Router)
│   ├── layout.tsx        # Layout raíz: fuentes, tema, header/footer
│   ├── page.tsx          # Landing
│   ├── experiencia/      # Ruta reservada para la experiencia 3D
│   └── not-found.tsx     # 404
├── components/
│   ├── ui/               # Primitivas shadcn/ui (button, card, badge…)
│   ├── layout/           # Header, footer, theme toggle
│   ├── sections/         # Secciones de página (hero, features)
│   ├── shared/           # Reutilizables (Container)
│   └── providers/        # ThemeProvider
├── config/               # siteConfig (nombre, nav, URLs)
├── hooks/                # useMounted, useMediaQuery
├── lib/                  # utils (cn), fonts
└── types/                # Tipos compartidos
```

## Tipografías

- **Sora** (`font-display`) — titulares
- **Inter** (`font-sans`) — texto
- **JetBrains Mono** (`font-mono`) — código

Cargadas con `next/font` (self-hosted, sin FOUT) en [src/lib/fonts.ts](src/lib/fonts.ts).

## Tema claro / oscuro

`next-themes` con `attribute="class"` + variante `dark` de Tailwind v4. Los tokens viven en [src/app/globals.css](src/app/globals.css) (`:root` y `.dark`). El toggle está en el header.

## Visor 3D (`/kombi`)

Visor tipo configurador automotriz de una **Volkswagen Type 2 T2 Bay
Window** real. El visor no genera geometría propia: carga un modelo
GLB/GLTF profesional para garantizar fidelidad absoluta al vehículo.

**Interacción (única y deliberadamente simple):** rotación 360° con el
mouse, zoom, auto-rotación lenta (toggle), y reinicio de cámara. Sin
puertas, hotspots ni animaciones mecánicas — la Kombi se contempla
como en una sala de exhibición (fondo estudio, iluminación HDRI por
lightformers, sombras suaves).

### Integrar el modelo

1. **Consigue un GLB profesional de la T2 Bay Window** en un
   marketplace (Sketchfab, TurboSquid, CGTrader…). Verifica la
   licencia para uso web/comercial; ten presente que la marca y el
   emblema VW pertenecen a Volkswagen AG y un uso comercial puede
   requerir autorización adicional.
2. **Aplica la identidad PUDÚ** (idealmente horneada en las texturas
   del modelo con Blender, usando la imagen de referencia): pintura
   verde `#14603c`, logotipo del pudú y texto «PUDÚ · Ecosistema en
   Movimiento» en los laterales.
3. **Optimiza el archivo** con gltf-transform (Draco + texturas):

   ```bash
   npx @gltf-transform/cli optimize kombi-original.glb kombi.glb \
     --compress draco --texture-compress webp --texture-size 2048
   ```

4. **Colócalo en** `public/models/kombi.glb`. El visor lo detecta,
   lo normaliza al largo real (4,505 m), lo apoya en el piso y
   activa sombras. Sin el archivo, muestra instrucciones en pantalla.

Configuración en [src/components/viewer/config.ts](src/components/viewer/config.ts):
ruta del modelo, escala, y un modo opcional (`APPLY_PUDU_PAINT`) que
reemplaza los materiales de carrocería por pintura PBR verde con
clearcoat si tu GLB viene sin livery.

El decoder **Draco se sirve localmente** desde `public/draco/` (sin
CDN). El canvas se divide en su propio chunk (`next/dynamic`,
`ssr: false`) y la pantalla de carga muestra el progreso real de
descarga del GLB.

## Experiencia 3D

La ruta `/experiencia` contiene la Kombi PUDÚ modelada 100 % por código
(sin assets externos) con React Three Fiber:

- **Escena**: iluminación de estudio tipo HDRI (`Environment` + lightformers),
  sombras, niebla y postprocesado (bloom + viñeta).
- **Kombi**: materiales PBR (pintura verde con clearcoat, cromo, vidrio),
  gráfica de marca generada en canvas y un interior de estudio para
  grabar podcasts (escritorio, micrófonos, pantalla ON AIR, paneles
  acústicos, tiras LED).
- **Partes móviles** animadas con GSAP: puerta del conductor, del
  copiloto, corrediza (solo lado derecho), portón trasero y tapa del
  motor. Se abren desde el panel de control o haciendo clic en ellas.
- **Cámara**: intro cinematográfica, órbita libre con inercia, zoom y
  paneo (`OrbitControls`), auto-rotación hasta la primera interacción.
- **Carga**: pantalla de carga de marca; el canvas se importa con
  `next/dynamic` (`ssr: false`) y se divide en su propio chunk.

Estructura en `src/components/experience/`: `experience-shell.tsx`
(UI + estado), `scene.tsx` (Canvas), `experience.tsx` (luces/cámara/efectos)
y `kombi/` (carrocería, puertas, interior, materiales, texturas).

> Tip: agrega `?instant` a la URL para saltar las animaciones al estado
> final (útil en tests automatizados y capturas).

## Deploy en Vercel

El proyecto funciona sin configuración extra:

```bash
vercel
```

O conecta el repositorio de GitHub en [vercel.com/new](https://vercel.com/new). Copia `.env.example` a `.env.local` para variables locales.
