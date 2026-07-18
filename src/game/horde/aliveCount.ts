/** Compteur vivants pour le menu dev (sync basse fréquence hors hot path UI). */
export const hordeAliveCountRef = { current: 0 };

export function resetHordeAliveCount(): void {
  hordeAliveCountRef.current = 0;
}
