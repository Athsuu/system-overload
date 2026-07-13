import { isCycleCleared, MAX_CYCLES } from './cycleTypes';
import { SEED_RESONANCE_FRAGMENTS_PER_LEVEL, RESIDUAL_MEMORY_SHARDS_PER_LEVEL } from './coreProtocolCatalog';
import type { CoreProtocolLevels } from './prestigeTypes';

export const RECOMPILE_BASE_SEED_FRAGMENTS = 1;

export function canRecompile(cyclesCleared: readonly number[]): boolean {
  return isCycleCleared(cyclesCleared, MAX_CYCLES);
}

export function computeSeedFragmentsGain(
  cyclesCleared: readonly number[],
  coreProtocols: CoreProtocolLevels,
): number {
  const cycleBonus = cyclesCleared.length;
  const resonanceBonus = coreProtocols.seedResonance * SEED_RESONANCE_FRAGMENTS_PER_LEVEL;
  return RECOMPILE_BASE_SEED_FRAGMENTS + cycleBonus + resonanceBonus;
}

export function computeResidualMemoryStartingShards(coreProtocols: CoreProtocolLevels): number {
  return coreProtocols.residualMemory * RESIDUAL_MEMORY_SHARDS_PER_LEVEL;
}
