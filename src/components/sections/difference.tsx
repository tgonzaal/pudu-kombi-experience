import { Container } from "@/components/shared/container";

const contrasts = [
  {
    common: "Un evento en un centro de eventos",
    ours: "Un evento que llega a la plaza de la comuna",
  },
  {
    common: "Contenido producido en un set",
    ours: "Contenido grabado en el territorio, en la ruta",
  },
  {
    common: "Se activa un día y termina",
    ours: "Deja una red local funcionando después",
  },
  {
    common: "La marca aparece en un banner",
    ours: "La marca viaja en el vehículo y en cada capítulo",
  },
  {
    common: "Habla de las mismas ciudades de siempre",
    ours: "Cubre comunas donde nunca llega nadie",
  },
];

export function Difference() {
  return (
    <section className="relative overflow-hidden border-y bg-foreground py-24 text-background">
      {/* Halo de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[38rem] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl"
      />

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Qué nos hace distintos
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            No es una gira.
            <br />
            Es una obra en construcción.
          </h2>
        </div>

        <div className="mx-auto mt-14 max-w-3xl space-y-3">
          {contrasts.map((c) => (
            <div
              key={c.ours}
              className="grid items-center gap-3 rounded-xl border border-background/15 bg-background/5 p-5 sm:grid-cols-[1fr_auto_1fr] sm:gap-5"
            >
              <span className="text-sm text-background/45 line-through decoration-background/30">
                {c.common}
              </span>
              <span
                aria-hidden
                className="hidden font-display text-lg font-bold text-primary sm:block"
              >
                →
              </span>
              <span className="font-display text-lg leading-snug font-semibold text-balance">
                {c.ours}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
