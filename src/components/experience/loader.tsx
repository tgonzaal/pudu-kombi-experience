"use client";

import { AnimatePresence, motion } from "framer-motion";

/** Pantalla de carga de marca mientras se compila la escena WebGL. */
export function LoadingScreen({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-[#0d3b26]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeOut" } }}
        >
          <motion.p
            className="font-display text-5xl font-extrabold tracking-tight text-[#f4f0e6] sm:text-6xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            PUDÚ
          </motion.p>
          <motion.p
            className="text-sm font-medium tracking-[0.35em] text-[#f4f0e6]/70 uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Kombi Experience
          </motion.p>

          {/* Barra de progreso indeterminada, estilo ruta */}
          <div className="mt-2 h-1 w-48 overflow-hidden rounded-full bg-[#f4f0e6]/15">
            <motion.div
              className="h-full w-1/3 rounded-full bg-[#6fcf97]"
              animate={{ x: ["-100%", "300%"] }}
              transition={{
                duration: 1.3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <p className="text-xs text-[#f4f0e6]/50">Preparando la Kombi…</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
