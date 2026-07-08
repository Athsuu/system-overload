/** Wave-indexed scaling tables (regular waves 1–10, boss wave 11). */

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

function clampWaveIndex(waveIndex: number): number {
  return Math.max(1, Math.min(10, Math.floor(waveIndex)));
}

export function getWaveHpMultiplier(waveIndex: number, isBoss = false): number {
  const mult = WAVE_HP_MULTIPLIER[clampWaveIndex(waveIndex) - 1] ?? 1;
  if (!isBoss) return mult;
  return mult * BOSS_HP_MULT;
}

export function getWaveSpeedMultiplier(waveIndex: number, isBoss = false): number {
  const mult = WAVE_SPEED_MULTIPLIER[clampWaveIndex(waveIndex) - 1] ?? 1;
  if (!isBoss) return mult;
  return mult * BOSS_SPEED_MULT;
}

export function getWaveShardReward(waveIndex: number, isBoss = false): number {
  if (isBoss) return BOSS_SHARD_REWARD;
  return 1 + Math.floor((clampWaveIndex(waveIndex) - 1) / 4);
}

export function getWaveLeakPenalty(waveIndex: number): number {
  return 18 + clampWaveIndex(waveIndex) * 2;
}

/** Visual size band: 0 = small (waves 1–4), 1 = medium (5–8), 2 = large (9–10). */
export function getEnemyVisualBand(waveIndex: number): 0 | 1 | 2 {
  const wave = clampWaveIndex(waveIndex);
  if (wave <= 4) return 0;
  if (wave <= 8) return 1;
  return 2;
}
