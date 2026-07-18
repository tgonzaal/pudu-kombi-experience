import { Compass, Mountain, Sparkles } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Container } from "@/components/shared/container";

const features = [
  {
    icon: Compass,
    title: "Viaje interactivo",
    description:
      "Maneja el recorrido a tu ritmo: cada tramo de la ruta esconde un rincón del sur por descubrir.",
  },
  {
    icon: Mountain,
    title: "Paisajes del sur",
    description:
      "Bosques, volcanes, lagos y niebla. Los escenarios están inspirados en la Patagonia y la Araucanía.",
  },
  {
    icon: Sparkles,
    title: "Experiencia inmersiva",
    description:
      "Gráficos 3D en tiempo real, sonido ambiente y animaciones que hacen del viaje algo memorable.",
  },
];

export function Features() {
  return (
    <section id="sobre" className="py-24">
      <Container>
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Un viaje distinto
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            La Kombi de PUDÚ no es un sitio web más: es una invitación a
            recorrer.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </div>
                <CardTitle className="font-display">{feature.title}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
