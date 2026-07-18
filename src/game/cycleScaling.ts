import { clampCycleIndex } from '../store/cycleTypes';

/** Spawn / densité par cycle: C1 1.0, C2 1.12, C3 1.24 — indépendant de la chaleur. */
export const CYCLE_PRESSURE_STEP = 0.12;

/**
 * Soft-block inter-cycle — PV flat (20×cycle), speed composé, riposte hit = PV×fraction.
 * Intra-run : horde continue (pas de scaling par vague).
 */
export const CYCLE_HP_GROWTH_PER_LEVEL = 1.15;
export const CYCLE_SPEED_GROWTH_PER_LEVEL = 1.04;
/** Package A — chaleur passive ×1,30 par Cycle (composé) : C1 1.0, C2 1.30, C3 1.69. */
export const CYCLE_HEAT_GROWTH_PER_LEVEL = 1.3;

/**
 * Base d’éclats / kill = numéro du cycle (C1→1, C2→2, C3→3, …).
 * Indépendant du compteur de kills — puis × Salvage / Extraction / Recompile.
 */
export function getShardsPerKillForCycle(cycle: number): number {
  return Math.max(1, Math.floor(cycle));
}

export function getCyclePressureMult(cycle: number): number {
  const safeCycle = clampCycleIndex(cycle);
  return 1 + (safeCycle - 1) * CYCLE_PRESSURE_STEP;
}

export function getCycleHpGrowthMult(cycle: number): number {
  const safeCycle = clampCycleIndex(cycle);
  return CYCLE_HP_GROWTH_PER_LEVEL ** (safeCycle - 1);
}

export function getCycleSpeedGrowthMult(cycle: number): number {
  const safeCycle = clampCycleIndex(cycle);
  return CYCLE_SPEED_GROWTH_PER_LEVEL ** (safeCycle - 1);
}

export function getCycleHeatGrowthMult(cycle: number): number {
  const safeCycle = clampCycleIndex(cycle);
  return CYCLE_HEAT_GROWTH_PER_LEVEL ** (safeCycle - 1);
}

/** @deprecated Alias — prefer getCycleHeatGrowthMult */
export function getCycleHeatMult(cycle: number): number {
  return getCycleHeatGrowthMult(cycle);
}
