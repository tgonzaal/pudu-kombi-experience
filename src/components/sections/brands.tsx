import { Container } from "@/components/shared/container";

const benefits = [
  {
    title: "Presencia rodante",
    body: "La Kombi es un medio en sí misma. Circula, se estaciona, la fotografían y aparece en cada pieza de contenido del tour.",
  },
  {
    title: "Territorio real",
    body: "Tu marca no aparece hablando de regiones: aparece estando ahí, en comunas donde la competencia no tiene presencia.",
  },
  {
    title: "Contenido con vida propia",
    body: "Capítulos, clips y documental que se siguen viendo después del viaje. No es una activación que caduca el lunes.",
  },
  {
    title: "Una meta clara y acotada",
    body: "Tres viajes durante el primer semestre de 2027. Un plan con fechas, rutas y entregables definidos desde el día uno.",
  },
];

const numbers = [
  { value: "3", label: "viajes el primer semestre de 2027" },
  { value: "30+", label: "comunas en total" },
  { value: "+60", label: "emprendedores entrevistados" },
];

export function Brands() {
  return (
    <section className="border-t py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Para marcas
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Tu marca viaja en la Kombi
          </h2>
          <p className="mt-5 text-lg text-pretty text-muted-foreground">
            Buscamos socios que quieran estar en el origen de esto, no auspiciar
            un logo en una pantalla. La marca acompaña el viaje completo: el
            vehículo, los encuentros y todo el contenido que nace del camino.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-xl border bg-card p-6">
              <h3 className="font-display text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {b.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 rounded-xl border bg-secondary/40 p-8 text-center sm:grid-cols-3">
          {numbers.map((n) => (
            <div key={n.label}>
              <p className="font-display text-4xl font-bold text-primary">
                {n.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{n.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center text-center">
          <h3 className="max-w-xl font-display text-2xl font-bold text-balance">
            Hagamos que la primera ruta salga en 2027
          </h3>
          <p className="mt-3 max-w-lg text-muted-foreground">
            Tenemos la Kombi, el equipo y el método. Nos falta quien quiera
            poner su nombre en el camino.
          </p>
        </div>
      </Container>
    </section>
  );
}
