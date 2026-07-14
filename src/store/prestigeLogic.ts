import { isCycleCleared } from './cycleTypes';
import { SEED_RESONANCE_PERCENT_PER_LEVEL, RESIDUAL_MEMORY_SHARDS_PER_LEVEL } from './coreProtocolCatalog';
import type { CoreProtocolLevels } from './prestigeTypes';

export const RECOMPILE_BASE_SEED_FRAGMENTS = 1;

/** Cycle clear required to unlock Recompile — fixed regardless of how far cycle progression extends. */
export const RECOMPILE_TRIGGER_CYCLE = 3;

/** Multiplicateur permanent (dégâts + éclats) par Profondeur de Recompilation — ressenti dès la run suivante, sans rien devoir acheter (rééquilibrage). */
export const RECOMPILE_DEPTH_POWER_GROWTH_PER_LEVEL = 1.08;

/** Exposant superlinéaire appliqué au nombre de cycles clear pour le gain de Fragments de Graine (rééquilibrage). */
export const SEED_FRAGMENTS_CYCLE_EXPONENT = 1.6;
export const SEED_FRAGMENTS_CYCLE_DIVISOR = 4;

export function canRecompile(cyclesCleared: readonly number[]): boolean {
  return isCycleCleared(cyclesCleared, RECOMPILE_TRIGGER_CYCLE);
}

export function getRecompileDepthMultiplier(recompileDepth: number): number {
  return RECOMPILE_DEPTH_POWER_GROWTH_PER_LEVEL ** Math.max(0, recompileDepth);
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
