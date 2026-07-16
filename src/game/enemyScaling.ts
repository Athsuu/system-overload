import { getScalingWaveIndex } from './cycleScaling';
import { REGULAR_WAVES_PER_CYCLE } from '../store/cycleTypes';

export const BOSS_WAVE_INDEX = 11;

/** Rencontre boss — PV ×6 vs ennemi basique du même niveau. */
export const BOSS_ENCOUNTER_HP_MULT = 6;

const BASE_ENEMY_HP = 20;
const BASE_ENEMY_SPEED = 52.16;

const HP_SEGMENT_A_END = 10;
const HP_SEGMENT_B_END = 35;
const HP_SEGMENT_A_EXP = 2.25;
const HP_SEGMENT_A_DIVISOR = 9;
const HP_SEGMENT_B_GROWTH = 1.065;
const HP_SEGMENT_C_GROWTH = 1.035;

const SPEED_SEGMENT_A_EXP = 1.035;
const SPEED_SEGMENT_A_DIVISOR = 9;
const SPEED_SEGMENT_B_GROWTH = 1.025;

const LEAK_FRACTION_BASE = 0.11;
const LEAK_FRACTION_PER_LEVEL = 0.001;

function clampLevel(level: number): number {
  return Math.max(1, Math.floor(level));
}

/** Niveau ennemi continu — alias explicite de getScalingWaveIndex. */
export function getEnemyLevel(cycle: number, localWave: number): number {
  return getScalingWaveIndex(cycle, localWave);
}

function hpAtSegmentAEnd(): number {
  return Math.round(BASE_ENEMY_HP * HP_SEGMENT_A_EXP ** ((HP_SEGMENT_A_END - 1) / HP_SEGMENT_A_DIVISOR));
}

function hpAtSegmentBEnd(): number {
  const anchor = hpAtSegmentAEnd();
  return Math.round(anchor * HP_SEGMENT_B_GROWTH ** (HP_SEGMENT_B_END - HP_SEGMENT_A_END));
}

/** Multiplicateur PV (base 20) pour un niveau — courbe PO agressive-agréable, 3 segments. */
export function getEnemyHpMultiplier(level: number): number {
  const safeLevel = clampLevel(level);

  if (safeLevel <= HP_SEGMENT_A_END) {
    return BASE_ENEMY_HP * HP_SEGMENT_A_EXP ** ((safeLevel - 1) / HP_SEGMENT_A_DIVISOR);
  }

  if (safeLevel <= HP_SEGMENT_B_END) {
    const anchor = hpAtSegmentAEnd();
    return anchor * HP_SEGMENT_B_GROWTH ** (safeLevel - HP_SEGMENT_A_END);
  }

  const anchor = hpAtSegmentBEnd();
  return anchor * HP_SEGMENT_C_GROWTH ** (safeLevel - HP_SEGMENT_B_END);
}

export function getEnemyMaxHpForLevel(level: number, isBoss = false): number {
  let hp = Math.round(getEnemyHpMultiplier(level));
  if (isBoss) {
    hp = Math.round(hp * BOSS_ENCOUNTER_HP_MULT);
  }
  return Math.max(1, hp);
}

function speedAtSegmentAEnd(): number {
  return BASE_ENEMY_SPEED * SPEED_SEGMENT_A_EXP ** ((HP_SEGMENT_A_END - 1) / SPEED_SEGMENT_A_DIVISOR);
}

export function getEnemySpeedForLevel(level: number): number {
  const safeLevel = clampLevel(level);

  if (safeLevel <= HP_SEGMENT_A_END) {
    return BASE_ENEMY_SPEED * SPEED_SEGMENT_A_EXP ** ((safeLevel - 1) / SPEED_SEGMENT_A_DIVISOR);
  }

  const anchor = speedAtSegmentAEnd();
  return anchor * SPEED_SEGMENT_B_GROWTH ** (safeLevel - HP_SEGMENT_A_END);
}

export function getLeakFractionForLevel(level: number): number {
  const safeLevel = clampLevel(level);
  return LEAK_FRACTION_BASE + (safeLevel - 1) * LEAK_FRACTION_PER_LEVEL;
}

export function getLeakPenaltyForLevel(level: number, breachCap: number): number {
  return Math.round(breachCap * getLeakFractionForLevel(level));
}

/** @deprecated Use getEnemyLevel — kept for gradual migration. */
export { getScalingWaveIndex, REGULAR_WAVES_PER_CYCLE };
