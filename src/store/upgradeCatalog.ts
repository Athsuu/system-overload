import { getGameStrings } from '../i18n';

export type UpgradeCurrency = 'shards' | 'anchor';

export type UpgradeId = 'node0Boot' | 'purgeStrike' | 'threadCoolant' | 'killBreachRelief';

export type SkillState = 'locked' | 'available' | 'unaffordable' | 'maxed' | 'reserved';

export interface UpgradeLevels {
  node0Boot: number;
  purgeStrike: number;
  threadCoolant: number;
  killBreachRelief: number;
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

/** Boss victory — Anchor Fragments credited in endRun. */
export const ANCHOR_FRAGMENTS_PER_BOSS = 1;

/** Flat shard bonus on boss victory (in addition to run kills). */
export const BOSS_VICTORY_SHARD_BONUS = 25;

export const COST_NODE0_BOOT = [5] as const;

/** prix(n) = ceil(5 × 1.18^(n−1)) for n = 1…10 */
export const PURGE_STRIKE_DAMAGE_PER_LEVEL = 3;
export const PURGE_STRIKE_MAX_LEVEL = 10;
export const PURGE_STRIKE_COST_GROWTH = 1.18;
export const PURGE_STRIKE_COST_BASE = 5;

function buildShardCostCurve(base: number, growth: number, levels: number): readonly number[] {
  return Array.from({ length: levels }, (_, index) => Math.ceil(base * growth ** index));
}

export const COST_PURGE_STRIKE = buildShardCostCurve(
  PURGE_STRIKE_COST_BASE,
  PURGE_STRIKE_COST_GROWTH,
  PURGE_STRIKE_MAX_LEVEL,
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

export const DEFAULT_UPGRADES: UpgradeLevels = {
  node0Boot: 1,
  purgeStrike: 0,
  threadCoolant: 0,
  killBreachRelief: 0,
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
    id: 'purgeStrike',
    maxLevel: PURGE_STRIKE_MAX_LEVEL,
    costByLevel: COST_PURGE_STRIKE,
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

export function isSkillUnlocked(
  _id: UpgradeId,
  upgrades: UpgradeLevels,
  requirements: UpgradeRequirement[] | undefined,
): boolean {
  if (!requirements || requirements.length === 0) return true;
  return requirements.every((requirement) => upgrades[requirement.id] >= requirement.minLevel);
}

export function getSkillState(
  id: UpgradeId,
  bankShards: number,
  bankAnchorFragments: number,
  upgrades: UpgradeLevels,
  requirements: UpgradeRequirement[] | undefined,
): SkillState {
  const definition = getUpgradeDefinition(id);
  const level = upgrades[id];

  if (!isSkillUnlocked(id, upgrades, requirements)) return 'locked';
  if (level >= definition.maxLevel) return 'maxed';

  const cost = getUpgradeCost(definition, level);
  const balance = definition.currency === 'anchor' ? bankAnchorFragments : bankShards;
  return balance >= cost ? 'available' : 'unaffordable';
}
