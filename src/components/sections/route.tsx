import { Container } from "@/components/shared/container";

/** `hub`: ciudades donde ya existe ecosistema emprendedor. */
const firstRoute = [
  { name: "Concepción", hub: true },
  { name: "Cabrero", hub: false },
  { name: "Los Ángeles", hub: true },
  { name: "Nacimiento", hub: false },
  { name: "Angol", hub: false },
  { name: "Victoria", hub: false },
  { name: "Temuco", hub: false },
  { name: "Villarrica", hub: false },
  { name: "Panguipulli", hub: false },
  { name: "Valdivia", hub: true },
];

const zones = [
  {
    zone: "Norte",
    span: "Arica a Coquimbo",
    body: "Ciudades mineras y agrícolas con emprendimiento de servicios muy sólido y casi nula cobertura mediática.",
  },
  {
    zone: "Centro",
    span: "Valparaíso a Maule",
    body: "Valles, comunas costeras y ciudades intermedias que viven a la sombra de la capital pese a tener industria propia.",
  },
  {
    zone: "Sur",
    span: "Ñuble a Los Lagos",
    body: "El corazón del proyecto: alimentos, oficios, turismo y manufactura repartidos en decenas de comunas sin conexión entre sí.",
  },
  {
    zone: "Austral",
    span: "Aysén y Magallanes",
    body: "Distancias enormes y aislamiento real. Donde llegar con un estudio móvil tiene el mayor impacto simbólico y práctico.",
  },
];

export function RouteSection() {
  return (
    <section className="border-t py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            La ruta
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Chile entero, no solo las capitales
          </h2>
          <p className="mt-5 text-lg text-pretty text-muted-foreground">
            El tour se arma por tramos: entre una ciudad grande y otra hay
            decenas de comunas que nunca reciben este tipo de proyectos. Esas
            son las paradas. Empezamos por el sur y desde ahí el trazado se
            extiende al resto del país.
          </p>
        </div>

        {/* Primera ruta */}
        <div className="mt-14 rounded-xl border bg-card p-8 sm:p-10">
          <div className="text-center">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Primera ruta
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold">
              De Concepción a Valdivia
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Son seiscientos kilómetros que casi todos hacen de corrido. Entre
              medio hay comunas enteras que nunca reciben un proyecto así.
              Nosotros paramos en todas.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-3">
            {firstRoute.map((stop, i) => (
              <span key={stop.name} className="flex items-center gap-2">
                <span
                  className={
                    stop.hub
                      ? "rounded-full border border-accent bg-accent/25 px-3 py-1 font-display text-sm font-semibold"
                      : "rounded-full border bg-secondary/60 px-3 py-1 font-display text-sm font-semibold"
                  }
                >
                  {stop.name}
                </span>
                {i < firstRoute.length - 1 && (
                  <span aria-hidden className="text-primary/60">
                    —
                  </span>
                )}
              </span>
            ))}
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <span
              aria-hidden
              className="size-3 shrink-0 rounded-full border border-accent bg-accent/60"
            />
            Ciudades donde ya existe ecosistema emprendedor: ahí conectamos con
            lo que hay. En el resto, lo construimos.
          </p>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Cada parada: entrevistas, un encuentro abierto y una red local
            activada. La lista final se ajusta con los contactos de cada comuna.
          </p>
        </div>

        <p className="mt-16 text-center text-xs font-semibold tracking-widest text-primary uppercase">
          Y después, el resto de Chile
        </p>

        <div className="mt-6 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {zones.map((z) => (
            <div key={z.zone} className="bg-card p-6">
              <p className="font-display text-xl font-bold text-primary">
                {z.zone}
              </p>
              <p className="mt-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {z.span}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {z.body}
              </p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-muted-foreground">
          Cada tramo nuevo suma comunas intermedias y cada parada deja un grupo
          local conectado. El mapa de la red crece con cada kilómetro.
        </p>
      </Container>
    </section>
  );
}
