import { Container } from "@/components/shared/container";

const problems = [
  {
    title: "El ecosistema está centralizado",
    body: "Las aceleradoras, los fondos, las charlas y las redes de contacto se concentran en un puñado de capitales regionales. Quien emprende a dos horas de ahí queda fuera del mapa.",
  },
  {
    title: "Emprender solo desgasta",
    body: "En ciudades intermedias hay proyectos buenísimos que nunca conocieron a otro emprendedor de su propia comuna. Sin pares no hay comparación, sin comparación no hay ambición.",
  },
  {
    title: "La innovación no tiene dirección fija",
    body: "Las buenas ideas aparecen en cualquier ciudad, no en las que salen en las noticias. Queremos demostrarlo grabando esas historias donde ocurren, porque nada motiva más a alguien que ver a un vecino lográndolo.",
  },
];

export function Why() {
  return (
    <section id="propuesta" className="border-t py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Por qué hacemos esto
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            No falta talento. Falta tejido.
          </h2>
          <p className="mt-5 text-lg text-pretty text-muted-foreground">
            En Chile se emprende en todas partes, pero casi siempre en solitario.
            El problema no es que no haya gente haciendo cosas: es que están
            haciéndolas sin saber que hay alguien más, a treinta kilómetros,
            peleando exactamente lo mismo.
          </p>
        </div>

        <div className="mt-14 grid gap-10 sm:grid-cols-3">
          {problems.map((p, i) => (
            <div key={p.title}>
              <div className="mb-4 flex items-center gap-3">
                <span className="font-display text-sm font-bold text-primary">
                  0{i + 1}
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <h3 className="font-display text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {p.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-xl border bg-secondary/40 p-8 sm:p-10">
          <div className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-center">
            <h3 className="font-display text-2xl font-bold text-balance">
              ¿Y por qué una Kombi?
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">
                Porque para llegar a esos lugares hay que ir. No sirve un
                formulario, ni un webinar, ni esperar a que viajen a la capital
                a un evento que no pueden costear. El estudio tiene que moverse.
              </p>
              <p className="leading-relaxed">
                Y porque una Kombi no pasa desapercibida. ¿Quién no se queda
                mirando una Kombi cuando pasa? Genera cariño, curiosidad y
                conversación antes de que alguien baje de ella. Esa atención es
                justamente lo que queremos: que la gente se acerque sola.
              </p>
              <p className="leading-relaxed">
                Además entra a cualquier plaza, se instala en cualquier pueblo y
                no necesita infraestructura previa. Es un estudio de podcast, un
                escenario y una invitación al mismo tiempo.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
