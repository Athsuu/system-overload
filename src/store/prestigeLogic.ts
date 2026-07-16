import { isCycleCleared } from './cycleTypes';
import { SEED_RESONANCE_PERCENT_PER_LEVEL, RESIDUAL_MEMORY_SHARDS_PER_LEVEL } from './coreProtocolCatalog';
import type { CoreProtocolLevels } from './prestigeTypes';

export const RECOMPILE_BASE_SEED_FRAGMENTS = 1;

/** Cycle clear required to unlock Recompile — Cycle 2 first clear. */
export const RECOMPILE_TRIGGER_CYCLE = 2;

/** Exposant superlinéaire appliqué au nombre de cycles clear pour le gain de Fragments de Graine (rééquilibrage). */
export const SEED_FRAGMENTS_CYCLE_EXPONENT = 1.6;
export const SEED_FRAGMENTS_CYCLE_DIVISOR = 4;

export function canRecompile(cyclesCleared: readonly number[]): boolean {
  return isCycleCleared(cyclesCleared, RECOMPILE_TRIGGER_CYCLE);
}

export function computeSeedFragmentsGain(
  cyclesCleared: readonly number[],
  coreProtocols: CoreProtocolLevels,
): number {
  const n = cyclesCleared.length;
  const superlinearBonus = Math.floor(n ** SEED_FRAGMENTS_CYCLE_EXPONENT / SEED_FRAGMENTS_CYCLE_DIVISOR);
  const preResonance = RECOMPILE_BASE_SEED_FRAGMENTS + n + superlinearBonus;
  const resonanceMultiplier = 1 + (coreProtocols.seedResonance * SEED_RESONANCE_PERCENT_PER_LEVEL) / 100;
  return Math.round(preResonance * resonanceMultiplier);
}

export function computeResidualMemoryStartingShards(coreProtocols: CoreProtocolLevels): number {
  return coreProtocols.residualMemory * RESIDUAL_MEMORY_SHARDS_PER_LEVEL;
}
