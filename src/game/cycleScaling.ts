import { clampCycleIndex, REGULAR_WAVES_PER_CYCLE } from '../store/cycleTypes';

/** Spawn / densité par cycle: C1 1.0, C2 1.12, C3 1.24 — indépendant de la chaleur. */
export const CYCLE_PRESSURE_STEP = 0.12;

/**
 * Croissance composée par cycle — remplace l'ancienne extrapolation par-vague (rééquilibrage).
 * La table de vagues 1-10 boucle désormais à chaque cycle (voir waveScaling.ts) ; toute la
 * progression inter-cycle est concentrée ici pour rester lisible et calibrable.
 */
export const CYCLE_HP_GROWTH_PER_LEVEL = 1.15;
export const CYCLE_SPEED_GROWTH_PER_LEVEL = 1.04;
/** Legacy — les fuites runtime sont un % du cap (voir LEAK_BREACH_PERCENT_OF_CAP). */
export const CYCLE_LEAK_GROWTH_PER_LEVEL = 1.08;
/** Package A — chaleur passive ×1,30 par Cycle (composé) : C1 1.0, C2 1.30, C3 1.69. */
export const CYCLE_HEAT_GROWTH_PER_LEVEL = 1.3;

/**
 * Base d’éclats / kill = numéro du cycle (C1→1, C2→2, C3→3, …).
 * Indépendant de la vague / niveau ennemi — puis × Salvage / Extraction / Recompile.
 */
export function getShardsPerKillForCycle(cycle: number): number {
  return Math.max(1, Math.floor(cycle));
}

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

export function getCycleHpGrowthMult(cycle: number): number {
  const safeCycle = clampCycleIndex(cycle);
  return CYCLE_HP_GROWTH_PER_LEVEL ** (safeCycle - 1);
}

export function getCycleSpeedGrowthMult(cycle: number): number {
  const safeCycle = clampCycleIndex(cycle);
  return CYCLE_SPEED_GROWTH_PER_LEVEL ** (safeCycle - 1);
}

export function getCycleLeakGrowthMult(cycle: number): number {
  const safeCycle = clampCycleIndex(cycle);
  return CYCLE_LEAK_GROWTH_PER_LEVEL ** (safeCycle - 1);
}

export function getCycleHeatGrowthMult(cycle: number): number {
  const safeCycle = clampCycleIndex(cycle);
  return CYCLE_HEAT_GROWTH_PER_LEVEL ** (safeCycle - 1);
}

/** @deprecated Alias — prefer getCycleHeatGrowthMult */
export function getCycleHeatMult(cycle: number): number {
  return getCycleHeatGrowthMult(cycle);
}

export { REGULAR_WAVES_PER_CYCLE };
