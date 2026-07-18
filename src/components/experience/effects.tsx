"use client";

import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";

/** Postprocesado: bloom sutil sobre LEDs/pantallas y viñeta cinematográfica. */
export function Effects() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom
        mipmapBlur
        intensity={0.7}
        luminanceThreshold={1}
        luminanceSmoothing={0.3}
      />
      <Vignette offset={0.18} darkness={0.38} />
    </EffectComposer>
  );
}
