/**
 * Modo instantáneo (`?instant` en la URL): las animaciones saltan a su
 * estado final. Útil para tests automatizados y capturas, donde
 * `requestAnimationFrame` puede estar pausado.
 */
export function isInstantMode() {
  return (
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("instant")
  );
}
