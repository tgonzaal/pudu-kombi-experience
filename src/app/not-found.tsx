import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center py-24">
      <Container className="text-center">
        <p className="font-mono text-sm font-semibold text-primary">404</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Te saliste de la ruta
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-muted-foreground">
          La página que buscas no existe o fue movida.
        </p>
        <Button size="lg" className="mt-10" asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </Container>
    </section>
  );
}
