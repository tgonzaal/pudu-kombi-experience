import { Inter, Sora, JetBrains_Mono } from "next/font/google";

/**
 * Sistema de tipografías del proyecto.
 *
 * - `fontSans`    → texto de lectura (Inter)
 * - `fontDisplay` → titulares y hero (Sora)
 * - `fontMono`    → código y datos (JetBrains Mono)
 *
 * Cada fuente se expone como variable CSS y se consume desde
 * Tailwind vía `font-sans`, `font-display` y `font-mono`.
 */

export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const fontDisplay = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
