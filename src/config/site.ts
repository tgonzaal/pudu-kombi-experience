/**
 * Configuración central del sitio.
 * Un solo lugar para nombre, descripción, URLs y navegación.
 */

export const siteConfig = {
  name: "PUDÚ Kombi Experience",
  shortName: "PUDÚ",
  description:
    "Un estudio de podcast sobre ruedas que recorre Chile conectando emprendedores donde no hay ecosistema. Cada parada, un capítulo. Cada capítulo, una red que queda.",
  url: "https://kombipudu.vercel.app",
  locale: "es-CL",
  links: {
    instagram: "https://instagram.com/pudu",
    github: "https://github.com/pudu",
  },
  nav: [
    { title: "Inicio", href: "/" },
    { title: "La Kombi", href: "/kombi" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
