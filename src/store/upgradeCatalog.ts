import { getGameStrings } from '../i18n';

export type UpgradeCurrency = 'shards' | 'anchor';

export type UpgradeId =
  | 'node0Boot'
  | 'starterNodes'
  | 'nodeReach'
  | 'coolingPower'
  | 'heatShield'
  | 'criticalThreshold'
  | 'fluxThrottle'
  | 'purgeReach'
  | 'boltDamage'
  | 'damageAmp'
  | 'fireRate'
  | 'killBonus'
  | 'shardYield'
  | 'spawnThrottle'
  | 'containment'
  | 'fluxDrive'
  | 'overclock';

export type SkillState = 'locked' | 'available' | 'unaffordable' | 'maxed' | 'reserved';

export interface UpgradeLevels {
  node0Boot: number;
  starterNodes: number;
  nodeReach: number;
  coolingPower: number;
  heatShield: number;
  criticalThreshold: number;
  fluxThrottle: number;
  purgeReach: number;
  boltDamage: number;
  damageAmp: number;
  fireRate: number;
  killBonus: number;
  shardYield: number;
  spawnThrottle: number;
  containment: number;
  fluxDrive: number;
  overclock: number;
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
export const COST_STARTER_5 = [8, 15, 25, 40, 60] as const;
export const COST_STARTER_3 = [10, 25, 50] as const;
export const COST_STANDARD_3 = [20, 45, 90] as const;
export const COST_STANDARD_2 = [25, 55] as const;
export const COST_PREMIUM_3 = [80, 180, 350] as const;
export const COST_PREMIUM_2 = [120, 280] as const;
export const COST_PREMIUM_LONG_3 = [100, 220, 400] as const;
export const COST_CAPSTONE_SHARD = [300] as const;
export const COST_CAPSTONE_ANCHOR = [1] as const;
export const COST_CAPSTONE_ANCHOR_2 = [2] as const;
export const COST_OVERCLOCK = [1] as const;

export const DEFAULT_UPGRADES: UpgradeLevels = {
  node0Boot: 0,
  starterNodes: 0,
  nodeReach: 0,
  coolingPower: 0,
  heatShield: 0,
  criticalThreshold: 0,
  fluxThrottle: 0,
  purgeReach: 0,
  boltDamage: 0,
  damageAmp: 0,
  fireRate: 0,
  killBonus: 0,
  shardYield: 0,
  spawnThrottle: 0,
  containment: 0,
  fluxDrive: 0,
  overclock: 0,
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
    id: 'fireRate',
    maxLevel: 5,
    costByLevel: COST_STARTER_5,
    currency: 'shards',
  },
  {
    id: 'boltDamage',
    maxLevel: 5,
    costByLevel: COST_STARTER_5,
    currency: 'shards',
  },
  {
    id: 'damageAmp',
    maxLevel: 3,
    costByLevel: COST_STANDARD_3,
    currency: 'shards',
  },
  {
    id: 'coolingPower',
    maxLevel: 5,
    costByLevel: COST_STARTER_5,
    currency: 'shards',
  },
  {
    id: 'heatShield',
    maxLevel: 2,
    costByLevel: COST_STANDARD_2,
    currency: 'shards',
  },
  {
    id: 'fluxThrottle',
    maxLevel: 5,
    costByLevel: COST_STARTER_5,
    currency: 'shards',
  },
  {
    id: 'criticalThreshold',
    maxLevel: 1,
    costByLevel: COST_CAPSTONE_ANCHOR_2,
    currency: 'anchor',
  },
  {
    id: 'overclock',
    maxLevel: 1,
    costByLevel: COST_OVERCLOCK,
    currency: 'anchor',
  },
  {
    id: 'nodeReach',
    maxLevel: 3,
    costByLevel: COST_STARTER_3,
    currency: 'shards',
  },
  {
    id: 'purgeReach',
    maxLevel: 1,
    costByLevel: COST_CAPSTONE_ANCHOR,
    currency: 'anchor',
  },
  {
    id: 'fluxDrive',
    maxLevel: 1,
    costByLevel: COST_CAPSTONE_ANCHOR_2,
    currency: 'anchor',
  },
  {
    id: 'killBonus',
    maxLevel: 3,
    costByLevel: COST_PREMIUM_3,
    currency: 'shards',
  },
  {
    id: 'shardYield',
    maxLevel: 3,
    costByLevel: COST_PREMIUM_3,
    currency: 'shards',
  },
  {
    id: 'starterNodes',
    maxLevel: 2,
    costByLevel: COST_PREMIUM_2,
    currency: 'shards',
  },
  {
    id: 'spawnThrottle',
    maxLevel: 3,
    costByLevel: COST_PREMIUM_LONG_3,
    currency: 'shards',
  },
  {
    id: 'containment',
    maxLevel: 1,
    costByLevel: COST_CAPSTONE_ANCHOR,
    currency: 'anchor',
  },
];

export function isOverclockUnlocked(upgrades: UpgradeLevels): boolean {
  return upgrades.overclock >= 1;
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
