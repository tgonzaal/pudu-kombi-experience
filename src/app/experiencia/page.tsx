import type { Metadata } from "next";
import { ExperienceShell } from "@/components/experience/experience-shell";

export const metadata: Metadata = {
  title: "Experiencia",
  description:
    "Recorre la Kombi de PUDÚ en 3D: rota, acércate y abre sus puertas para descubrir el estudio creativo móvil.",
};

export default function ExperienciaPage() {
  return <ExperienceShell />;
}
