/**
 * Wave-indexed scaling (local wave 1–10, table bouclée à chaque cycle).
 * Toute la croissance inter-cycle vit dans cycleScaling.ts (getCycleHpGrowthMult / SpeedGrowthMult / LeakGrowthMult) —
 * la table locale ne s'extrapole plus au-delà de la vague 10, elle se répète (rééquilibrage).
 */

import { getCycleHpGrowthMult, getCycleLeakGrowthMult, getCycleSpeedGrowthMult } from './cycleScaling';
import type { EnemyClass } from './enemyClass';

export const BOSS_WAVE_INDEX = 11;
export const ELITE_HP_MULT = 6.5;
export const ELITE_SPEED_MULT = 0.65;
export const ELITE_SHARD_REWARD = 4;

/** Adoucie vagues 7-10 après retour terrain (rééquilibrage) — vague 10 : 2.75 → 2.25. */
const WAVE_HP_MULTIPLIER: readonly number[] = [
  1.0, 1.1, 1.2, 1.3, 1.42, 1.55, 1.7, 1.87, 2.05, 2.25,
];

const WAVE_SPEED_MULTIPLIER: readonly number[] = [
  1.0, 1.04, 1.08, 1.12, 1.16, 1.2, 1.24, 1.28, 1.32, 1.35,
];

function resolveScalingIndex(scalingWaveIndex: number): number {
  return Math.max(1, Math.floor(scalingWaveIndex));
}

/** Décompose un index continu en (cycle, vague locale 1–10) — inverse de getScalingWaveIndex. */
function resolveCycleAndLocalWave(scalingWaveIndex: number): { cycle: number; localWave: number } {
  const wave = resolveScalingIndex(scalingWaveIndex);
  const cycle = Math.floor((wave - 1) / 10) + 1;
  const localWave = ((wave - 1) % 10) + 1;
  return { cycle, localWave };
}

function loopedTableValue(table: readonly number[], localWave: number): number {
  return table[localWave - 1] ?? 1;
}

export function getWaveHpMultiplier(scalingWaveIndex: number, enemyClass: EnemyClass = 'normal'): number {
  const { cycle, localWave } = resolveCycleAndLocalWave(scalingWaveIndex);
  const mult = loopedTableValue(WAVE_HP_MULTIPLIER, localWave) * getCycleHpGrowthMult(cycle);
  if (enemyClass !== 'elite') return mult;
  return mult * ELITE_HP_MULT;
}

export function getWaveSpeedMultiplier(scalingWaveIndex: number, enemyClass: EnemyClass = 'normal'): number {
  const { cycle, localWave } = resolveCycleAndLocalWave(scalingWaveIndex);
  const mult = loopedTableValue(WAVE_SPEED_MULTIPLIER, localWave) * getCycleSpeedGrowthMult(cycle);
  if (enemyClass !== 'elite') return mult;
  return mult * ELITE_SPEED_MULT;
}

export function getWaveShardReward(scalingWaveIndex: number, enemyClass: EnemyClass = 'normal'): number {
  if (enemyClass === 'elite') return ELITE_SHARD_REWARD;
  const { localWave } = resolveCycleAndLocalWave(scalingWaveIndex);
  return 1 + Math.floor((localWave - 1) / 4);
}

export function getWaveLeakPenalty(scalingWaveIndex: number): number {
  const { cycle, localWave } = resolveCycleAndLocalWave(scalingWaveIndex);
  return Math.round((18 + localWave * 2) * getCycleLeakGrowthMult(cycle));
}
