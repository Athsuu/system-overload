/**
 * Pont canvas ↔ DOM pour les particules qui volent vers le badge Hex Shards (UI React).
 * Le canvas remplit tout le viewport (`resizeTo={window}`) donc les coordonnées client DOM
 * sont directement utilisables comme coordonnées canvas (pas de mise à l'échelle nécessaire).
 * Mis à jour par `ui/hub/CurrencyBadge.tsx` (mount + resize), lu chaque frame par le moteur Pixi —
 * jamais de lecture DOM dans la boucle de jeu.
 */
export const badgeTargetRef = {
  x: 0,
  y: 0,
  ready: false,
};

export function setBadgeTarget(x: number, y: number): void {
  badgeTargetRef.x = x;
  badgeTargetRef.y = y;
  badgeTargetRef.ready = true;
}
