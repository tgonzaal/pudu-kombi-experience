import { Mic, Network, Route, Sprout } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Container } from "@/components/shared/container";

const steps = [
  {
    icon: Route,
    step: "Antes de llegar",
    title: "Rastreamos quién está haciendo cosas",
    description:
      "Trabajamos con municipios, cámaras de comercio, liceos técnicos y contactos locales para identificar a los emprendedores de la zona. Llegamos con nombres, no a improvisar.",
    detail:
      "El trayecto también se graba: la carretera, el camino y las conversaciones a bordo son parte del relato.",
  },
  {
    icon: Mic,
    step: "En la parada",
    title: "Grabamos sus historias",
    description:
      "La Kombi se abre y se convierte en estudio. Entrevistas en formato podcast, con cámara, en el lugar donde esa persona trabaja todos los días.",
    detail:
      "Cada entrevistado se lleva su propio material editado para usar en sus redes. El contenido también es de ellos.",
  },
  {
    icon: Network,
    step: "El mismo día",
    title: "Los juntamos entre ellos",
    description:
      "Un encuentro abierto y gratuito alrededor de la Kombi: los emprendedores de la comuna se conocen, se presentan y descubren que no estaban solos.",
    detail:
      "Es la primera vez, en muchos casos, que estas personas comparten mesa. Ahí empieza el tejido.",
  },
  {
    icon: Sprout,
    step: "Cuando nos vamos",
    title: "Dejamos la red funcionando",
    description:
      "Cada grupo local queda conectado entre sí y enchufado a la red nacional de MADEINN LATAM: contactos, mentorías, oportunidades y las siguientes paradas del tour.",
    detail:
      "No es una visita. Es un nodo nuevo que sigue activo después de que la Kombi arranca.",
  },
];

export function Features() {
  return (
    <section className="border-t bg-secondary/30 py-24">
      <Container>
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Cómo funciona
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Cuatro movimientos en cada ciudad
          </h2>
          <p className="mt-5 text-lg text-pretty text-muted-foreground">
            El mismo método se repite en cada parada. Es replicable, medible y
            deja algo instalado en todas las comunas por las que pasa.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {steps.map((s) => (
            <Card key={s.title} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <s.icon className="size-5" />
                  </div>
                  <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    {s.step}
                  </span>
                </div>
                <CardTitle className="font-display text-xl">
                  {s.title}
                </CardTitle>
                <CardDescription className="leading-relaxed">
                  {s.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="border-l-2 border-primary/40 pl-4 text-sm leading-relaxed text-muted-foreground">
                  {s.detail}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
