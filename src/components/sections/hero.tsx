"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Fondo decorativo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent"
      />

      <Container className="relative flex flex-col items-center text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
        >
          <Badge variant="accent" className="mb-6">
            PUDÚ by MADEINN LATAM · Kombi Tour 2026
          </Badge>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="visible"
          custom={0.1}
          variants={fadeUp}
          className="max-w-3xl font-display text-4xl font-bold tracking-tight text-balance sm:text-6xl"
        >
          Un estudio de podcast que recorre Chile{" "}
          <span className="text-primary">tejiendo ecosistemas</span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          custom={0.2}
          variants={fadeUp}
          className="mt-6 max-w-xl text-lg text-pretty text-muted-foreground"
        >
          Hay gente emprendiendo en cada rincón del país, pero la red que los
          sostiene todavía no llega a todas partes. La Kombi va a buscarlos
          donde están: entrevista, conecta y deja red instalada en cada ciudad
          que visita.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          custom={0.3}
          variants={fadeUp}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Button size="lg" asChild>
            <Link href="/kombi">
              Ver la Kombi
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#propuesta">Ver la propuesta</Link>
          </Button>
        </motion.div>
      </Container>
    </section>
  );
}
