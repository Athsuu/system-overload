import { getGameStrings } from '../i18n';
import type { CoreProtocolId, CoreProtocolLevels } from './prestigeTypes';

export type CoreProtocolState = 'available' | 'unaffordable' | 'maxed';

export interface CoreProtocolDefinition {
  id: CoreProtocolId;
  name: string;
  description: string;
  maxLevel: number;
  costByLevel: readonly number[];
}

/** Hex Shards granted on Recompile per Residual Memory rank. */
export const RESIDUAL_MEMORY_SHARDS_PER_LEVEL = 50;

/** Flat purge hit damage bonus per Boot Reinforcement rank (strengthens Node-0 Boot baseline). */
export const BOOT_REINFORCEMENT_DAMAGE_PER_LEVEL = 5;

/** Passive Overload reduction per Thermal Baseline rank (% of base passive heat). */
export const THERMAL_BASELINE_REDUCTION_PERCENT_PER_LEVEL = 5;

/** Global shard gain multiplier bonus per Extraction Protocol rank. */
export const EXTRACTION_PROTOCOL_PERCENT_PER_LEVEL = 10;

/** Extra Seed Fragments per Recompile per Seed Resonance rank. */
export const SEED_RESONANCE_FRAGMENTS_PER_LEVEL = 1;

export const CORE_PROTOCOL_CATALOG: CoreProtocolDefinition[] = [
  {
    id: 'residualMemory',
    maxLevel: 3,
    costByLevel: [2, 3, 5],
    get name() {
      return getGameStrings().seedProtocols.protocols.residualMemory.name;
    },
    get description() {
      return getGameStrings().seedProtocols.protocols.residualMemory.description;
    },
  },
  {
    id: 'bootReinforcement',
    maxLevel: 1,
    costByLevel: [1],
    get name() {
      return getGameStrings().seedProtocols.protocols.bootReinforcement.name;
    },
    get description() {
      return getGameStrings().seedProtocols.protocols.bootReinforcement.description;
    },
  },
  {
    id: 'thermalBaseline',
    maxLevel: 3,
    costByLevel: [2, 4, 6],
    get name() {
      return getGameStrings().seedProtocols.protocols.thermalBaseline.name;
    },
    get description() {
      return getGameStrings().seedProtocols.protocols.thermalBaseline.description;
    },
  },
  {
    id: 'extractionProtocol',
    maxLevel: 3,
    costByLevel: [3, 5, 8],
    get name() {
      return getGameStrings().seedProtocols.protocols.extractionProtocol.name;
    },
    get description() {
      return getGameStrings().seedProtocols.protocols.extractionProtocol.description;
    },
  },
  {
    id: 'seedResonance',
    maxLevel: 2,
    costByLevel: [4, 7],
    get name() {
      return getGameStrings().seedProtocols.protocols.seedResonance.name;
    },
    get description() {
      return getGameStrings().seedProtocols.protocols.seedResonance.description;
    },
  },
];

export function getCoreProtocolDefinition(id: CoreProtocolId): CoreProtocolDefinition {
  const definition = CORE_PROTOCOL_CATALOG.find((entry) => entry.id === id);
  if (!definition) throw new Error(`Unknown core protocol: ${id}`);
  return definition;
}

export function getCoreProtocolCost(definition: CoreProtocolDefinition, level: number): number {
  return definition.costByLevel[level] ?? definition.costByLevel[definition.costByLevel.length - 1] ?? 0;
}

export function getCoreProtocolState(
  id: CoreProtocolId,
  seedFragments: number,
  levels: CoreProtocolLevels,
): CoreProtocolState {
  const definition = getCoreProtocolDefinition(id);
  const level = levels[id];
  if (level >= definition.maxLevel) return 'maxed';
  const cost = getCoreProtocolCost(definition, level);
  if (seedFragments < cost) return 'unaffordable';
  return 'available';
}

export function sanitizeCoreProtocols(raw: Partial<CoreProtocolLevels> | undefined): CoreProtocolLevels {
  const levels = { ...DEFAULT_CORE_PROTOCOLS_FOR_SANITIZE };
  if (!raw) return levels;

  for (const definition of CORE_PROTOCOL_CATALOG) {
    const value = raw[definition.id];
    if (typeof value === 'number' && Number.isFinite(value)) {
      levels[definition.id] = Math.max(0, Math.min(definition.maxLevel, Math.floor(value)));
    }
  }

  return levels;
}

const DEFAULT_CORE_PROTOCOLS_FOR_SANITIZE = {
  residualMemory: 0,
  bootReinforcement: 0,
  thermalBaseline: 0,
  extractionProtocol: 0,
  seedResonance: 0,
} satisfies CoreProtocolLevels;
