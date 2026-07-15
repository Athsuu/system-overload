/** Visuel / collision — boss Breach Anchor plus grand qu'un processus normal. */
export const ENEMY_HEX_RADIUS_NORMAL = 54.925;
export const ENEMY_HEX_RADIUS_BOSS = 92.95;

export function getEnemyHexRadius(isBossEncounter: boolean): number {
  return isBossEncounter ? ENEMY_HEX_RADIUS_BOSS : ENEMY_HEX_RADIUS_NORMAL;
}
