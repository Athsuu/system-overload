import { getGameStrings } from '../i18n';
import type { CoreProtocolId, CoreProtocolLevels } from './prestigeTypes';

export type CoreProtocolState = 'available' | 'unaffordable';

export interface CoreProtocolDefinition {
  id: CoreProtocolId;
  name: string;
  description: string;
  costBase: number;
  costGrowth: number;
}

/** Hex Shards granted on Recompile per Residual Memory rank. */
export const RESIDUAL_MEMORY_SHARDS_PER_LEVEL = 150;

/** Purge hit damage multiplier bonus per Boot Reinforcement rank (%, applied to total purgeHitDamage). */
export const BOOT_REINFORCEMENT_DAMAGE_PERCENT_PER_LEVEL = 15;

/** Passive Overload decay factor per Thermal Baseline rank — heat *= this per rank (exponential falloff). */
export const THERMAL_BASELINE_DECAY_FACTOR_PER_LEVEL = 0.9;

/** Global shard gain multiplier bonus per Extraction Protocol rank. */
export const EXTRACTION_PROTOCOL_PERCENT_PER_LEVEL = 15;

/** Seed Fragments gain bonus per Recompile per Seed Resonance rank (%, additive stacking). */
export const SEED_RESONANCE_PERCENT_PER_LEVEL = 25;

export const CORE_PROTOCOL_CATALOG: CoreProtocolDefinition[] = [
  {
    id: 'residualMemory',
    costBase: 2,
    costGrowth: 1.25,
    get name() {
      return getGameStrings().seedProtocols.protocols.residualMemory.name;
    },
    get description() {
      return getGameStrings().seedProtocols.protocols.residualMemory.description;
    },
  },
  {
    id: 'bootReinforcement',
    costBase: 1,
    costGrowth: 1.35,
    get name() {
      return getGameStrings().seedProtocols.protocols.bootReinforcement.name;
    },
    get description() {
      return getGameStrings().seedProtocols.protocols.bootReinforcement.description;
    },
  },
  {
    id: 'thermalBaseline',
    costBase: 2,
    costGrowth: 1.30,
    get name() {
      return getGameStrings().seedProtocols.protocols.thermalBaseline.name;
    },
    get description() {
      return getGameStrings().seedProtocols.protocols.thermalBaseline.description;
    },
  },
  {
    id: 'extractionProtocol',
    costBase: 3,
    costGrowth: 1.28,
    get name() {
      return getGameStrings().seedProtocols.protocols.extractionProtocol.name;
    },
    get description() {
      return getGameStrings().seedProtocols.protocols.extractionProtocol.description;
    },
  },
  {
    id: 'seedResonance',
    costBase: 4,
    costGrowth: 1.40,
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
  return Math.ceil(definition.costBase * definition.costGrowth ** level);
}

export function getCoreProtocolState(
  id: CoreProtocolId,
  seedFragments: number,
  levels: CoreProtocolLevels,
): CoreProtocolState {
  const definition = getCoreProtocolDefinition(id);
  const level = levels[id];
  const cost = getCoreProtocolCost(definition, level);
  return seedFragments < cost ? 'unaffordable' : 'available';
}

export function sanitizeCoreProtocols(raw: Partial<CoreProtocolLevels> | undefined): CoreProtocolLevels {
  const levels = { ...DEFAULT_CORE_PROTOCOLS_FOR_SANITIZE };
  if (!raw) return levels;

  for (const definition of CORE_PROTOCOL_CATALOG) {
    const value = raw[definition.id];
    if (typeof value === 'number' && Number.isFinite(value)) {
      levels[definition.id] = Math.max(0, Math.floor(value));
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
