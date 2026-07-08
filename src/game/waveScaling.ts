/** Wave-indexed scaling (local wave 1–10 per cycle, effective index via cycleScaling). */

export const BOSS_WAVE_INDEX = 11;
export const BOSS_HP_MULT = 6.5;
export const BOSS_SPEED_MULT = 0.65;
export const BOSS_SHARD_REWARD = 4;

const WAVE_HP_MULTIPLIER: readonly number[] = [
  1.0, 1.1, 1.22, 1.35, 1.5, 1.68, 1.88, 2.12, 2.4, 2.75,
];

const WAVE_SPEED_MULTIPLIER: readonly number[] = [
  1.0, 1.04, 1.08, 1.12, 1.16, 1.2, 1.24, 1.28, 1.32, 1.35,
];

const HP_GROWTH_BEYOND_TABLE = 1.08;
const SPEED_GROWTH_BEYOND_TABLE = 1.04;
const LEAK_GROWTH_BEYOND_TABLE = 1.06;

function resolveScalingIndex(scalingWaveIndex: number): number {
  return Math.max(1, Math.floor(scalingWaveIndex));
}

function extrapolateTable(
  table: readonly number[],
  scalingIndex: number,
  growth: number,
): number {
  const wave = resolveScalingIndex(scalingIndex);
  if (wave <= table.length) return table[wave - 1] ?? 1;
  const last = table[table.length - 1] ?? 1;
  const stepsBeyond = wave - table.length;
  return last * growth ** stepsBeyond;
}

export function getWaveHpMultiplier(scalingWaveIndex: number, isBoss = false): number {
  const mult = extrapolateTable(WAVE_HP_MULTIPLIER, scalingWaveIndex, HP_GROWTH_BEYOND_TABLE);
  if (!isBoss) return mult;
  return mult * BOSS_HP_MULT;
}

export function getWaveSpeedMultiplier(scalingWaveIndex: number, isBoss = false): number {
  const mult = extrapolateTable(WAVE_SPEED_MULTIPLIER, scalingWaveIndex, SPEED_GROWTH_BEYOND_TABLE);
  if (!isBoss) return mult;
  return mult * BOSS_SPEED_MULT;
}

export function getWaveShardReward(scalingWaveIndex: number, isBoss = false): number {
  if (isBoss) return BOSS_SHARD_REWARD;
  const wave = resolveScalingIndex(scalingWaveIndex);
  const localInCycle = ((wave - 1) % 10) + 1;
  return 1 + Math.floor((localInCycle - 1) / 4);
}

export function getWaveLeakPenalty(scalingWaveIndex: number): number {
  const wave = resolveScalingIndex(scalingWaveIndex);
  if (wave <= 10) return 18 + wave * 2;
  const baseAt10 = 18 + 10 * 2;
  const stepsBeyond = wave - 10;
  return Math.round(baseAt10 * LEAK_GROWTH_BEYOND_TABLE ** stepsBeyond);
}

/** Visual size band from effective scaling index (repeats pattern within each cycle). */
export function getEnemyVisualBand(scalingWaveIndex: number): 0 | 1 | 2 {
  const wave = resolveScalingIndex(scalingWaveIndex);
  const localInCycle = ((wave - 1) % 10) + 1;
  if (localInCycle <= 4) return 0;
  if (localInCycle <= 8) return 1;
  return 2;
}
