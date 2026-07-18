/**
 * Configuración central del sitio.
 * Un solo lugar para nombre, descripción, URLs y navegación.
 */

export const siteConfig = {
  name: "PUDÚ Kombi Experience",
  shortName: "PUDÚ",
  description:
    "Una experiencia inmersiva a bordo de la Kombi de PUDÚ. Recorre el sur de Chile en un viaje interactivo 3D.",
  url: "https://pudu-kombi.vercel.app",
  locale: "es-CL",
  links: {
    instagram: "https://instagram.com/pudu",
    github: "https://github.com/pudu",
  },
  nav: [
    { title: "Inicio", href: "/" },
    { title: "Experiencia", href: "/experiencia" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
