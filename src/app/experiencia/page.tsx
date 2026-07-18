import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/shared/container";

export const metadata: Metadata = {
  title: "Experiencia",
  description: "La experiencia 3D de la Kombi de PUDÚ, próximamente.",
};

/**
 * Ruta reservada para la experiencia 3D (React Three Fiber).
 *
 * Cuando se desarrolle la escena, el canvas debe cargarse con
 * `next/dynamic` y `ssr: false` desde un componente cliente,
 * por ejemplo: `src/components/experience/scene.tsx`.
 */
export default function ExperienciaPage() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center py-24">
      <Container className="text-center">
        <Badge variant="accent" className="mb-6">
          En construcción
        </Badge>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          La Kombi está en el taller
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-muted-foreground">
          Aquí vivirá la experiencia 3D interactiva. Estamos afinando el motor
          antes de salir a la ruta.
        </p>
      </Container>
    </section>
  );
}
