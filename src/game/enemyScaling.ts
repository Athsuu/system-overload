import { clampCycleIndex } from '../store/cycleTypes';

/** Rencontre boss — PV ×6 vs ennemi basique du même cycle. */
export const BOSS_ENCOUNTER_HP_MULT = 6;

/** PV trash = BASE_CYCLE_ENEMY_HP × cycle (soft-block inter-cycle). */
export const BASE_CYCLE_ENEMY_HP = 20;
const BASE_ENEMY_SPEED = 70.42;
const CYCLE_SPEED_GROWTH_PER_LEVEL = 1.04;

function clampCycle(cycle: number): number {
  return clampCycleIndex(cycle);
}

/** Niveau ennemi = numéro de cycle (plus de scaling intra-run). */
export function getEnemyLevel(cycle: number, _unusedLocalWave = 1): number {
  return clampCycle(cycle);
}

export function getEnemyHpForCycle(cycle: number, isBoss = false): number {
  const safeCycle = clampCycle(cycle);
  let hp = BASE_CYCLE_ENEMY_HP * safeCycle;
  if (isBoss) {
    hp = Math.round(hp * BOSS_ENCOUNTER_HP_MULT);
  }
  return Math.max(1, hp);
}

/** @deprecated Prefer getEnemyHpForCycle — level == cycle. */
export function getEnemyMaxHpForLevel(level: number, isBoss = false): number {
  return getEnemyHpForCycle(level, isBoss);
}

/** @deprecated Flat HP — kept for snapshot tooling. */
export function getEnemyHpMultiplier(level: number): number {
  return getEnemyHpForCycle(level, false);
}

export function getEnemySpeedForCycle(cycle: number): number {
  const safeCycle = clampCycle(cycle);
  return BASE_ENEMY_SPEED * CYCLE_SPEED_GROWTH_PER_LEVEL ** (safeCycle - 1);
}

/** @deprecated Prefer getEnemySpeedForCycle */
export function getEnemySpeedForLevel(level: number): number {
  return getEnemySpeedForCycle(level);
}
