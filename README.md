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

## Experiencia 3D (próximo paso)

La ruta `/experiencia` está reservada. Al construir la escena:

1. Crear `src/components/experience/scene.tsx` como componente cliente.
2. Cargar el canvas con `next/dynamic` y `ssr: false`.
3. `three` ya está en `transpilePackages` en `next.config.ts`.

## Deploy en Vercel

El proyecto funciona sin configuración extra:

```bash
vercel
```

O conecta el repositorio de GitHub en [vercel.com/new](https://vercel.com/new). Copia `.env.example` a `.env.local` para variables locales.
