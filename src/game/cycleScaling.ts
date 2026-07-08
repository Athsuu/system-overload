import { clampCycleIndex, REGULAR_WAVES_PER_CYCLE } from '../store/cycleTypes';

/** Breach / Overload pressure per cycle: C1 1.0, C2 1.12, C3 1.24 */
export const CYCLE_PRESSURE_STEP = 0.12;

/** Enemy HP tier bonus per cycle: C1 1.0, C2 1.1, C3 1.2 */
export const CYCLE_ENEMY_HP_STEP = 0.1;

/** Maps hub cycle + local wave (1–11) to a continuous scaling index. */
export function getScalingWaveIndex(cycle: number, localWave: number): number {
  const safeCycle = Math.max(1, Math.floor(cycle));
  const safeWave = Math.max(1, Math.floor(localWave));
  return (safeCycle - 1) * REGULAR_WAVES_PER_CYCLE + safeWave;
}

export function getCyclePressureMult(cycle: number): number {
  const safeCycle = clampCycleIndex(cycle);
  return 1 + (safeCycle - 1) * CYCLE_PRESSURE_STEP;
}

export function getCycleEnemyHpMult(cycle: number): number {
  const safeCycle = clampCycleIndex(cycle);
  return 1 + (safeCycle - 1) * CYCLE_ENEMY_HP_STEP;
}
