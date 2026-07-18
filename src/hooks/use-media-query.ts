"use client";

import { useEffect, useState } from "react";

/**
 * Hook reactivo para media queries.
 * Ej: `const isDesktop = useMediaQuery("(min-width: 768px)")`
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
