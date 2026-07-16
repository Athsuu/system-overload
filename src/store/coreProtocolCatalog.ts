import { getGameStrings } from '../i18n';
import { DEFAULT_CORE_PROTOCOLS, type CoreProtocolId, type CoreProtocolKind, type CoreProtocolLevels } from './prestigeTypes';

export type CoreProtocolState = 'available' | 'unaffordable' | 'maxed' | 'locked';

export interface CoreProtocolDefinition {
  id: CoreProtocolId;
  kind: CoreProtocolKind;
  /** null = uncapped (Fondamentaux). */
  maxLevel: number | null;
  /** Parent unlock required for branch nodes. */
  parentId: CoreProtocolId | null;
  costBase: number;
  costGrowth: number;
  name: string;
  description: string;
}

/** Hex Shards granted on Recompile per Residual Memory rank. */
export const RESIDUAL_MEMORY_SHARDS_PER_LEVEL = 200;

/** Purge hit damage multiplier bonus per Boot Reinforcement rank (%, applied to total purgeHitDamage). */
export const BOOT_REINFORCEMENT_DAMAGE_PERCENT_PER_LEVEL = 15;

/** Passive Overload decay factor per Thermal Baseline rank — heat *= this per rank (exponential falloff). */
export const THERMAL_BASELINE_DECAY_FACTOR_PER_LEVEL = 0.9;

/** Global shard gain multiplier bonus per Extraction Protocol rank. */
export const EXTRACTION_PROTOCOL_PERCENT_PER_LEVEL = 15;

/** Seed Fragments gain bonus per Recompile per Seed Resonance rank (%, additive stacking). */
export const SEED_RESONANCE_PERCENT_PER_LEVEL = 25;

/** Base on-kill explosion radius (px) when Explosive Purge unlock is owned. */
export const EXPLOSIVE_PURGE_BASE_RADIUS_PX = 80;
/** Extra explosion radius per Explosive Purge Radius rank. */
export const EXPLOSIVE_PURGE_RADIUS_PER_LEVEL_PX = 30;
/** Base explosion damage as fraction of purgeHitDamage. */
export const EXPLOSIVE_PURGE_BASE_DAMAGE_RATIO = 0.4;
/** Extra damage ratio per Explosive Purge Damage rank. */
export const EXPLOSIVE_PURGE_DAMAGE_RATIO_PER_LEVEL = 0.15;

export const CORE_PROTOCOL_CATALOG: CoreProtocolDefinition[] = [
  {
    id: 'residualMemory',
    kind: 'fundamental',
    maxLevel: null,
    parentId: null,
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
    kind: 'fundamental',
    maxLevel: null,
    parentId: null,
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
    kind: 'fundamental',
    maxLevel: null,
    parentId: null,
    costBase: 2,
    costGrowth: 1.3,
    get name() {
      return getGameStrings().seedProtocols.protocols.thermalBaseline.name;
    },
    get description() {
      return getGameStrings().seedProtocols.protocols.thermalBaseline.description;
    },
  },
  {
    id: 'extractionProtocol',
    kind: 'fundamental',
    maxLevel: null,
    parentId: null,
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
    kind: 'fundamental',
    maxLevel: null,
    parentId: null,
    costBase: 4,
    costGrowth: 1.4,
    get name() {
      return getGameStrings().seedProtocols.protocols.seedResonance.name;
    },
    get description() {
      return getGameStrings().seedProtocols.protocols.seedResonance.description;
    },
  },
  {
    id: 'explosivePurge',
    kind: 'skillUnlock',
    maxLevel: 1,
    parentId: null,
    costBase: 2,
    costGrowth: 1,
    get name() {
      return getGameStrings().seedProtocols.protocols.explosivePurge.name;
    },
    get description() {
      return getGameStrings().seedProtocols.protocols.explosivePurge.description;
    },
  },
  {
    id: 'explosivePurgeRadius',
    kind: 'skillBranchNode',
    maxLevel: 3,
    parentId: 'explosivePurge',
    costBase: 2,
    costGrowth: 1.3,
    get name() {
      return getGameStrings().seedProtocols.protocols.explosivePurgeRadius.name;
    },
    get description() {
      return getGameStrings().seedProtocols.protocols.explosivePurgeRadius.description;
    },
  },
  {
    id: 'explosivePurgeDamage',
    kind: 'skillBranchNode',
    maxLevel: 3,
    parentId: 'explosivePurge',
    costBase: 3,
    costGrowth: 1.3,
    get name() {
      return getGameStrings().seedProtocols.protocols.explosivePurgeDamage.name;
    },
    get description() {
      return getGameStrings().seedProtocols.protocols.explosivePurgeDamage.description;
    },
  },
  {
    id: 'explosivePurgeChain',
    kind: 'skillBranchNode',
    maxLevel: 3,
    parentId: 'explosivePurge',
    costBase: 3,
    costGrowth: 1.3,
    get name() {
      return getGameStrings().seedProtocols.protocols.explosivePurgeChain.name;
    },
    get description() {
      return getGameStrings().seedProtocols.protocols.explosivePurgeChain.description;
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

export function isCoreProtocolMaxed(definition: CoreProtocolDefinition, level: number): boolean {
  return definition.maxLevel !== null && level >= definition.maxLevel;
}

export function getCoreProtocolState(
  id: CoreProtocolId,
  seedFragments: number,
  levels: CoreProtocolLevels,
): CoreProtocolState {
  const definition = getCoreProtocolDefinition(id);
  const level = levels[id];

  if (definition.parentId !== null && levels[definition.parentId] < 1) {
    return 'locked';
  }
  if (isCoreProtocolMaxed(definition, level)) {
    return 'maxed';
  }

  const cost = getCoreProtocolCost(definition, level);
  return seedFragments < cost ? 'unaffordable' : 'available';
}

export function getFundamentalProtocolIds(): CoreProtocolId[] {
  return CORE_PROTOCOL_CATALOG.filter((entry) => entry.kind === 'fundamental').map((entry) => entry.id);
}

export function getSkillUnlockIds(): CoreProtocolId[] {
  return CORE_PROTOCOL_CATALOG.filter((entry) => entry.kind === 'skillUnlock').map((entry) => entry.id);
}

export function getBranchNodeIds(parentId: CoreProtocolId): CoreProtocolId[] {
  return CORE_PROTOCOL_CATALOG.filter(
    (entry) => entry.kind === 'skillBranchNode' && entry.parentId === parentId,
  ).map((entry) => entry.id);
}

export function sanitizeCoreProtocols(raw: Partial<CoreProtocolLevels> | undefined): CoreProtocolLevels {
  const levels = { ...DEFAULT_CORE_PROTOCOLS };
  if (!raw) return levels;

  for (const definition of CORE_PROTOCOL_CATALOG) {
    const value = raw[definition.id];
    if (typeof value === 'number' && Number.isFinite(value)) {
      const floored = Math.max(0, Math.floor(value));
      levels[definition.id] =
        definition.maxLevel !== null ? Math.min(definition.maxLevel, floored) : floored;
    }
  }

  return levels;
}
