"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Devuelve `true` solo después de montar en cliente.
 * Útil para evitar mismatches de hidratación (tema, media queries, etc.).
 */
export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
