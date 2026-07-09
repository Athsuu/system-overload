export type EnemyClass = 'normal' | 'elite';

export const ENEMY_HEX_RADIUS: Record<EnemyClass, number> = {
  normal: 54.925,
  elite: 92.95,
};

export function getEnemyHexRadius(enemyClass: EnemyClass): number {
  return ENEMY_HEX_RADIUS[enemyClass];
}

export function getEnemyClassFromBossWave(isBossWave?: boolean): EnemyClass {
  return isBossWave ? 'elite' : 'normal';
}
