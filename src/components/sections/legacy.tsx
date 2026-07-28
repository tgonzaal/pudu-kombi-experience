import { Container } from "@/components/shared/container";

const outputs = [
  {
    format: "Podcast en YouTube",
    body: "Un capítulo por emprendedor, grabado dentro de la Kombi. El archivo largo, el que queda para siempre y se puede buscar.",
  },
  {
    format: "Clips para redes",
    body: "Verticales para Instagram y TikTok con los mejores momentos de cada entrevista y del camino. Volumen constante durante todo el tour.",
  },
  {
    format: "Documental del viaje",
    body: "La ruta completa como una sola historia: el trayecto, las paradas, la gente que se fue sumando y lo que quedó atrás.",
  },
];

export function Legacy() {
  return (
    <>
      {/* Documentación */}
      <section className="border-t bg-secondary/30 py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Lo que se documenta
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Todo queda grabado
            </h2>
            <p className="mt-5 text-lg text-pretty text-muted-foreground">
              El viaje no se cuenta después: se transmite mientras ocurre. Cada
              entrevista, cada encuentro y cada tramo de carretera se convierte
              en material publicado, con una narrativa que avanza semana a
              semana.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {outputs.map((o) => (
              <div key={o.format} className="rounded-xl border bg-card p-6">
                <h3 className="font-display text-lg font-semibold">
                  {o.format}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {o.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* El legado */}
      <section className="border-t py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Lo que queda
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Que crezca el bosque que cuida al pudú
            </h2>
            <div className="mt-6 space-y-5 text-lg text-pretty text-muted-foreground">
              <p className="leading-relaxed">
                El pudú es el ciervo más pequeño del mundo y vive escondido en
                el bosque nativo del sur. Solo, a la intemperie, no sobrevive:
                depende por completo del ecosistema que lo rodea. Un
                emprendedor aislado en una comuna chica está exactamente en la
                misma posición.
              </p>
              <p className="leading-relaxed">
                Por eso venimos a plantar bosque: a dejar en cada ciudad un
                grupo de personas que se conocen, se recomiendan, se compran
                entre ellas y se sostienen cuando las cosas se ponen difíciles.
              </p>
              <p className="leading-relaxed font-medium text-foreground">
                La Kombi pasa una vez. La red que deja se queda para siempre.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
