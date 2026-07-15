/**
 * @deprecated Import from enemyScaling.ts — thin re-export for legacy imports.
 */
export {
  BOSS_WAVE_INDEX,
  BOSS_ENCOUNTER_HP_MULT,
  getEnemyLevel,
  getEnemyHpMultiplier,
  getEnemyMaxHpForLevel,
  getEnemySpeedForLevel,
  getLeakFractionForLevel,
  getLeakPenaltyForLevel,
  getShardsPerKillForLevel,
} from './enemyScaling';

import {
  getEnemyHpMultiplier,
  getEnemySpeedForLevel,
  getLeakPenaltyForLevel,
  getShardsPerKillForLevel,
} from './enemyScaling';

/** @deprecated Use getEnemyHpMultiplier(level) / baseEnemyHp */
export function getWaveHpMultiplier(enemyLevel: number): number {
  return getEnemyHpMultiplier(enemyLevel) / 20;
}

/** @deprecated Use getEnemySpeedForLevel */
export function getWaveSpeedMultiplier(enemyLevel: number): number {
  return getEnemySpeedForLevel(enemyLevel) / 52.16;
}

/** @deprecated Use getShardsPerKillForLevel */
export function getWaveShardReward(enemyLevel: number): number {
  return getShardsPerKillForLevel(enemyLevel);
}

/** @deprecated Package A — fuites runtime = % du cap Meltdown (`LEAK_BREACH_PERCENT_OF_CAP`). */
export function getWaveLeakPenalty(enemyLevel: number, breachCap = 100): number {
  return getLeakPenaltyForLevel(enemyLevel, breachCap);
}
