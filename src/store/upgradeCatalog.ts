import { getGameStrings } from '../i18n';

export type UpgradeCurrency = 'shards' | 'anchor';

/**
 * Nouveau module module tree : suivre MODULE_ADDITION_PIPELINE dans src/game/moduleEffects.ts
 * et la checklist docs/lexique-jeu.md §14.
 */
export type UpgradeId =
  | 'node0Boot'
  | 'shardSalvage'
  | 'shardYield'
  | 'shardMagnet'
  | 'purgeStrike'
  | 'eliteBreaker'
  | 'purgeCadence'
  | 'purgeReach'
  | 'purgeSplash'
  | 'latencyInjection'
  | 'threadCoolant'
  | 'killBreachRelief'
  | 'meltdownThreshold';

export type ModuleState = 'locked' | 'available' | 'unaffordable' | 'maxed' | 'reserved';

export interface UpgradeLevels {
  node0Boot: number;
  shardSalvage: number;
  shardYield: number;
  shardMagnet: number;
  purgeStrike: number;
  eliteBreaker: number;
  purgeCadence: number;
  purgeReach: number;
  purgeSplash: number;
  latencyInjection: number;
  threadCoolant: number;
  killBreachRelief: number;
  meltdownThreshold: number;
}

export interface UpgradeRequirement {
  id: UpgradeId;
  minLevel: number;
}

export interface UpgradeDefinition {
  id: UpgradeId;
  name: string;
  description: string;
  maxLevel: number;
  costByLevel: readonly number[];
  currency: UpgradeCurrency;
}

/** Boss victory — Anchor Fragment on first cycle clear only (see endRun). */
export const ANCHOR_FRAGMENTS_PER_BOSS = 1;

/** Flat shard bonus on boss victory (in addition to run kills). */
export const BOSS_VICTORY_SHARD_BONUS = 25;

export const COST_NODE0_BOOT = [5] as const;

export const SHARD_SALVAGE_MAX_LEVEL = 1;
export const SHARD_SALVAGE_BONUS_PER_LEVEL = 1;
export const COST_SHARD_SALVAGE = [100] as const;

export const SHARD_YIELD_MAX_LEVEL = 5;
/** Bonus multiplicatif sur les éclats de base par kill (+20 % / rang). */
export const SHARD_YIELD_PERCENT_PER_LEVEL = 20;

export const SHARD_MAGNET_MAX_LEVEL = 3;
/** Rayon de collecte (px) aux rangs 0–3 de l'Aimant d'éclats. */
export const SHARD_MAGNET_COLLECT_RADIUS_BY_LEVEL = [20, 44, 68, 92] as const;
/** Rayon d'attraction magnétique (px) aux rangs 0–3 — 0 = pas d'aspiration au départ. */
export const SHARD_MAGNET_MAGNET_RADIUS_BY_LEVEL = [0, 72, 128, 200] as const;
export const COST_SHARD_MAGNET = [130, 220, 350] as const;

/** prix(n) = ceil(5 × 1.18^(n−1)) for n = 1…10 */
export const PURGE_STRIKE_DAMAGE_PER_LEVEL = 3;
export const PURGE_STRIKE_MAX_LEVEL = 10;
export const PURGE_STRIKE_COST_GROWTH = 1.18;
export const PURGE_STRIKE_COST_BASE = 5;

function buildShardCostCurve(base: number, growth: number, levels: number): readonly number[] {
  return Array.from({ length: levels }, (_, index) => Math.ceil(base * growth ** index));
}

export const COST_SHARD_YIELD = buildShardCostCurve(110, 1.28, SHARD_YIELD_MAX_LEVEL);

export const COST_PURGE_STRIKE = buildShardCostCurve(
  PURGE_STRIKE_COST_BASE,
  PURGE_STRIKE_COST_GROWTH,
  PURGE_STRIKE_MAX_LEVEL,
);

export const ELITE_BREAKER_MAX_LEVEL = 3;
/** Bonus dégâts purge vs processus lourds (élite) aux rangs 1 / 2 / 3. */
export const ELITE_BREAKER_DAMAGE_PERCENT_BY_LEVEL = [25, 50, 75] as const;
export const COST_ELITE_BREAKER = [150, 250, 400] as const;

export const PURGE_SPLASH_MAX_LEVEL = 3;
/** Extension du rayon d'éclaboussure au-delà de la zone principale (%) aux rangs 1 / 2 / 3. */
export const PURGE_SPLASH_RADIUS_BONUS_PERCENT_BY_LEVEL = [50, 75, 100] as const;
/** Dégâts d'éclaboussure (% des dégâts purge) aux rangs 1 / 2 / 3 — hors zone directe. */
export const PURGE_SPLASH_DAMAGE_PERCENT_BY_LEVEL = [15, 30, 45] as const;
export const COST_PURGE_SPLASH = COST_ELITE_BREAKER;

export const COST_LATENCY_INJECTION = [140, 240, 380] as const;

export const PURGE_CADENCE_MAX_LEVEL = 10;
export const PURGE_CADENCE_PERCENT_PER_LEVEL = 2.5;
export const PURGE_CADENCE_INTERVAL_MS_PER_LEVEL = 25;

export const PURGE_REACH_MAX_LEVEL = 10;
export const PURGE_REACH_AOE_PERCENT_PER_LEVEL = 2.5;

/** Shared cost curve for Purge Cadence & Purge Reach (base 10, ×1.22). */
export const PURGE_SUPPORT_COST_BASE = 10;
export const PURGE_SUPPORT_COST_GROWTH = 1.22;

export const COST_PURGE_CADENCE = buildShardCostCurve(
  PURGE_SUPPORT_COST_BASE,
  PURGE_SUPPORT_COST_GROWTH,
  PURGE_CADENCE_MAX_LEVEL,
);

export const COST_PURGE_REACH = buildShardCostCurve(
  PURGE_SUPPORT_COST_BASE,
  PURGE_SUPPORT_COST_GROWTH,
  PURGE_REACH_MAX_LEVEL,
);

export const THREAD_COOLANT_MAX_LEVEL = 10;
export const THREAD_COOLANT_PASSIVE_REDUCTION_PER_LEVEL = 0.14;
export const COST_THREAD_COOLANT = COST_PURGE_STRIKE;

export const KILL_BREACH_RELIEF_MAX_LEVEL = 10;
export const KILL_BREACH_RELIEF_PER_LEVEL = 0.1;
export const KILL_BREACH_RELIEF_COST_BASE = 10;
export const KILL_BREACH_RELIEF_COST_GROWTH = 1.18;

export const COST_KILL_BREACH_RELIEF = buildShardCostCurve(
  KILL_BREACH_RELIEF_COST_BASE,
  KILL_BREACH_RELIEF_COST_GROWTH,
  KILL_BREACH_RELIEF_MAX_LEVEL,
);

export const MELTDOWN_THRESHOLD_MAX_LEVEL = 10;
export const MELTDOWN_THRESHOLD_PERCENT_PER_LEVEL = 8;
export const MELTDOWN_THRESHOLD_COST_BASE = 15;
export const MELTDOWN_THRESHOLD_COST_GROWTH = 1.22;

export const COST_MELTDOWN_THRESHOLD = buildShardCostCurve(
  MELTDOWN_THRESHOLD_COST_BASE,
  MELTDOWN_THRESHOLD_COST_GROWTH,
  MELTDOWN_THRESHOLD_MAX_LEVEL,
);

export const DEFAULT_UPGRADES: UpgradeLevels = {
  node0Boot: 1,
  shardSalvage: 0,
  shardYield: 0,
  shardMagnet: 0,
  purgeStrike: 0,
  eliteBreaker: 0,
  purgeCadence: 0,
  purgeReach: 0,
  purgeSplash: 0,
  latencyInjection: 0,
  threadCoolant: 0,
  killBreachRelief: 0,
  meltdownThreshold: 0,
};

interface UpgradeCatalogEntry {
  id: UpgradeId;
  maxLevel: number;
  costByLevel: readonly number[];
  currency: UpgradeCurrency;
}

export const UPGRADE_CATALOG: UpgradeCatalogEntry[] = [
  {
    id: 'node0Boot',
    maxLevel: 1,
    costByLevel: COST_NODE0_BOOT,
    currency: 'shards',
  },
  {
    id: 'shardSalvage',
    maxLevel: SHARD_SALVAGE_MAX_LEVEL,
    costByLevel: COST_SHARD_SALVAGE,
    currency: 'shards',
  },
  {
    id: 'shardYield',
    maxLevel: SHARD_YIELD_MAX_LEVEL,
    costByLevel: COST_SHARD_YIELD,
    currency: 'shards',
  },
  {
    id: 'shardMagnet',
    maxLevel: SHARD_MAGNET_MAX_LEVEL,
    costByLevel: COST_SHARD_MAGNET,
    currency: 'shards',
  },
  {
    id: 'purgeStrike',
    maxLevel: PURGE_STRIKE_MAX_LEVEL,
    costByLevel: COST_PURGE_STRIKE,
    currency: 'shards',
  },
  {
    id: 'eliteBreaker',
    maxLevel: ELITE_BREAKER_MAX_LEVEL,
    costByLevel: COST_ELITE_BREAKER,
    currency: 'shards',
  },
  {
    id: 'purgeCadence',
    maxLevel: PURGE_CADENCE_MAX_LEVEL,
    costByLevel: COST_PURGE_CADENCE,
    currency: 'shards',
  },
  {
    id: 'purgeReach',
    maxLevel: PURGE_REACH_MAX_LEVEL,
    costByLevel: COST_PURGE_REACH,
    currency: 'shards',
  },
  {
    id: 'purgeSplash',
    maxLevel: PURGE_SPLASH_MAX_LEVEL,
    costByLevel: COST_PURGE_SPLASH,
    currency: 'shards',
  },
  {
    id: 'latencyInjection',
    maxLevel: 3,
    costByLevel: COST_LATENCY_INJECTION,
    currency: 'shards',
  },
  {
    id: 'threadCoolant',
    maxLevel: THREAD_COOLANT_MAX_LEVEL,
    costByLevel: COST_THREAD_COOLANT,
    currency: 'shards',
  },
  {
    id: 'killBreachRelief',
    maxLevel: KILL_BREACH_RELIEF_MAX_LEVEL,
    costByLevel: COST_KILL_BREACH_RELIEF,
    currency: 'shards',
  },
  {
    id: 'meltdownThreshold',
    maxLevel: MELTDOWN_THRESHOLD_MAX_LEVEL,
    costByLevel: COST_MELTDOWN_THRESHOLD,
    currency: 'shards',
  },
];

export function isOverclockUnlocked(_upgrades: UpgradeLevels): boolean {
  return false;
}

export function getUpgradeDefinition(id: UpgradeId): UpgradeDefinition {
  const entry = UPGRADE_CATALOG.find((item) => item.id === id);
  if (!entry) throw new Error(`Unknown upgrade: ${id}`);
  const text = getGameStrings().upgrades[id];
  return {
    ...entry,
    name: text.name,
    description: text.description,
  };
}

export function getUpgradeCurrency(id: UpgradeId): UpgradeCurrency {
  return getUpgradeDefinition(id).currency;
}

export function requireMax(id: UpgradeId): UpgradeRequirement[] {
  const definition = getUpgradeDefinition(id);
  return [{ id, minLevel: definition.maxLevel }];
}

export function requireLevel(id: UpgradeId, minLevel: number): UpgradeRequirement[] {
  return [{ id, minLevel }];
}

export function getUpgradeCost(definition: UpgradeDefinition, level: number): number {
  if (level >= definition.maxLevel) return 0;
  return definition.costByLevel[level] ?? definition.costByLevel[definition.costByLevel.length - 1];
}

export function isModuleUnlocked(
  _id: UpgradeId,
  upgrades: UpgradeLevels,
  requirements: UpgradeRequirement[] | undefined,
): boolean {
  if (!requirements || requirements.length === 0) return true;
  return requirements.every((requirement) => upgrades[requirement.id] >= requirement.minLevel);
}

export function getModuleState(
  id: UpgradeId,
  bankShards: number,
  bankAnchorFragments: number,
  upgrades: UpgradeLevels,
  requirements: UpgradeRequirement[] | undefined,
): ModuleState {
  const definition = getUpgradeDefinition(id);
  const level = upgrades[id];

  if (!isModuleUnlocked(id, upgrades, requirements)) return 'locked';
  if (level >= definition.maxLevel) return 'maxed';

  const cost = getUpgradeCost(definition, level);
  const balance = definition.currency === 'anchor' ? bankAnchorFragments : bankShards;
  return balance >= cost ? 'available' : 'unaffordable';
}
