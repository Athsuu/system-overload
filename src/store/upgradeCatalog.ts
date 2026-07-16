import { getGameStrings } from '../i18n';

export type UpgradeCurrency = 'shards' | 'anchor';

/**
 * Nouveau module module tree : suivre MODULE_ADDITION_PIPELINE dans src/game/moduleEffects.ts
 * et la checklist docs/lexique-jeu.md §14.
 */
export type UpgradeId =
  | 'node0Boot'
  | 'shardSalvage'
  | 'shardMagnet'
  | 'victoryShardBonus'
  | 'purgeStrike'
  | 'purgeCadence'
  | 'purgeReach'
  | 'purgeSplash'
  | 'purgeCrit'
  | 'latencyInjection'
  | 'threadCoolant'
  | 'killBreachRelief'
  | 'meltdownThreshold'
  | 'overclock'
  | 'fluxDrive'
  | 'breachDissipation'
  | 'leakSealing'
  | 'purgeAmplifier';

export type ModuleState = 'locked' | 'available' | 'unaffordable' | 'maxed' | 'reserved';

/** Hardware Supercharge — module ID → ancré (présent) et ON/OFF (valeur). */
export type AnchoredNodes = Partial<Record<UpgradeId, boolean>>;

export interface UpgradeLevels {
  node0Boot: number;
  shardSalvage: number;
  shardMagnet: number;
  victoryShardBonus: number;
  purgeStrike: number;
  purgeCadence: number;
  purgeReach: number;
  purgeSplash: number;
  purgeCrit: number;
  latencyInjection: number;
  threadCoolant: number;
  killBreachRelief: number;
  meltdownThreshold: number;
  overclock: number;
  fluxDrive: number;
  breachDissipation: number;
  leakSealing: number;
  purgeAmplifier: number;
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

/** Node-0 Boot : baseline gratuit — niveau 1 dès le départ, jamais achetable (pas de coût). */
export const NODE0_BOOT_BASELINE_LEVEL = 1;

/** Multiplicateur de rendement d'éclats : +25 % additif par rang (max +125 % au rang 5). */
export const SHARD_SALVAGE_YIELD_PERCENT_PER_LEVEL = 25;
export const SHARD_SALVAGE_MAX_LEVEL = 5;
export const SHARD_SALVAGE_COST_BASE = 5;
export const SHARD_SALVAGE_COST_GROWTH = 1.12;

export const SHARD_MAGNET_MAX_LEVEL = 3;
/** Rayon de collecte (px) aux rangs 0–3 de l'Aimant d'éclats. */
export const SHARD_MAGNET_COLLECT_RADIUS_BY_LEVEL = [20, 44, 68, 92] as const;
/** Rayon d'attraction magnétique (px) aux rangs 0–3 — 0 = pas d'aspiration au départ. */
export const SHARD_MAGNET_MAGNET_RADIUS_BY_LEVEL = [0, 72, 128, 200] as const;
export const COST_SHARD_MAGNET = [130, 220, 350] as const;

export const VICTORY_SHARD_BONUS_MAX_LEVEL = 3;
/** Éclats bonus à Breach Contained aux rangs 1 / 2 / 3 (s'ajoute au flat boss). */
export const VICTORY_SHARD_BONUS_FLAT_BY_LEVEL = [8, 16, 24] as const;
export const COST_VICTORY_SHARD_BONUS = [100, 180, 280] as const;

/** Frappe de purge — flat uniquement ; les % viennent du prestige (Boot Reinforcement, Recompile). */
export const PURGE_STRIKE_DAMAGE_PER_LEVEL = 5;
export const PURGE_STRIKE_MAX_LEVEL = 10;
export const PURGE_STRIKE_COST_GROWTH = 1.18;
export const PURGE_STRIKE_COST_BASE = 5;

function buildShardCostCurve(base: number, growth: number, levels: number): readonly number[] {
  return Array.from({ length: levels }, (_, index) => Math.ceil(base * growth ** index));
}

export const COST_SHARD_SALVAGE = buildShardCostCurve(
  SHARD_SALVAGE_COST_BASE,
  SHARD_SALVAGE_COST_GROWTH,
  SHARD_SALVAGE_MAX_LEVEL,
);

export const COST_PURGE_STRIKE = buildShardCostCurve(
  PURGE_STRIKE_COST_BASE,
  PURGE_STRIKE_COST_GROWTH,
  PURGE_STRIKE_MAX_LEVEL,
);

export const PURGE_SPLASH_MAX_LEVEL = 3;
/** Extension du rayon d'éclaboussure au-delà de la zone principale (%) — +40 % vs courbe précédente. */
export const PURGE_SPLASH_RADIUS_BONUS_PERCENT_BY_LEVEL = [70, 105, 140] as const;
/** Dégâts d'éclaboussure (% des dégâts purge) — rang 3 = 100 % (mêmes dégâts que la purge). */
export const PURGE_SPLASH_DAMAGE_PERCENT_BY_LEVEL = [40, 70, 100] as const;
export const COST_PURGE_SPLASH = [150, 250, 400] as const;

export const COST_LATENCY_INJECTION = [140, 240, 380] as const;
export const LATENCY_INJECTION_MAX_LEVEL = 3;

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

/** Critique de purge — +2 % chance / rang (s’ajoute à la base 8 %), multi ×2 inchangé. */
export const PURGE_CRIT_MAX_LEVEL = 5;
export const PURGE_CRIT_CHANCE_PERCENT_PER_LEVEL = 2;
export const PURGE_CRIT_COST_BASE = 25;
export const PURGE_CRIT_COST_GROWTH = 1.22;
export const COST_PURGE_CRIT = buildShardCostCurve(
  PURGE_CRIT_COST_BASE,
  PURGE_CRIT_COST_GROWTH,
  PURGE_CRIT_MAX_LEVEL,
);

export const THREAD_COOLANT_MAX_LEVEL = 10;
/** Package A — réduction douce : base 2,8 − 0,08/rang → ~2,0/s au max (plancher 1,8). */
export const THREAD_COOLANT_PASSIVE_REDUCTION_PER_LEVEL = 0.08;
export const THREAD_COOLANT_COST_BASE = 10;
export const THREAD_COOLANT_COST_GROWTH = 1.2;

export const COST_THREAD_COOLANT = buildShardCostCurve(
  THREAD_COOLANT_COST_BASE,
  THREAD_COOLANT_COST_GROWTH,
  THREAD_COOLANT_MAX_LEVEL,
);

/** Package A — moins de rangs ; −0,25 % Breach / kill / rang → −1,25 % au max. */
export const KILL_BREACH_RELIEF_MAX_LEVEL = 5;
export const KILL_BREACH_RELIEF_PER_LEVEL = 0.5;
export const KILL_BREACH_RELIEF_COST_BASE = 10;
export const KILL_BREACH_RELIEF_COST_GROWTH = 1.18;

export const COST_KILL_BREACH_RELIEF = buildShardCostCurve(
  KILL_BREACH_RELIEF_COST_BASE,
  KILL_BREACH_RELIEF_COST_GROWTH,
  KILL_BREACH_RELIEF_MAX_LEVEL,
);

/** Cap Breach : +8 % additif par rang → 180 % au rang 10. */
export const MELTDOWN_THRESHOLD_CAP_PERCENT_PER_LEVEL = 8;
export const MELTDOWN_THRESHOLD_MAX_LEVEL = 10;
export const MELTDOWN_THRESHOLD_COST_BASE = 5;
export const MELTDOWN_THRESHOLD_COST_GROWTH = 1.16;

export const COST_MELTDOWN_THRESHOLD = buildShardCostCurve(
  MELTDOWN_THRESHOLD_COST_BASE,
  MELTDOWN_THRESHOLD_COST_GROWTH,
  MELTDOWN_THRESHOLD_MAX_LEVEL,
);

export const OVERCLOCK_MAX_LEVEL = 1;
export const COST_OVERCLOCK = [200] as const;

export const FLUX_DRIVE_MAX_LEVEL = 1;
export const COST_FLUX_DRIVE = [280] as const;
/** Flux Drive time scale once installed and toggled on — matches LORE.fluxDrive ("double la vitesse"). */
export const FLUX_DRIVE_TIME_SCALE = 2;
/** Hardware Supercharge sur Flux Drive : ×3 au lieu du ×2 générique (évite un ×4 déséquilibré). */
export const FLUX_DRIVE_TIME_SCALE_ANCHORED = 3;

export const BREACH_DISSIPATION_MAX_LEVEL = 3;
/** Drain Breach passif / s aux rangs 1 / 2 / 3 (tous cycles). */
export const BREACH_DISSIPATION_PER_SEC_BY_LEVEL = [0.1, 0.2, 0.3] as const;
export const COST_BREACH_DISSIPATION = [200, 320, 500] as const;

export const LEAK_SEALING_MAX_LEVEL = 3;
/** Réduction pénalité de fuite (%) aux rangs 1 / 2 / 3. */
export const LEAK_SEALING_PENALTY_REDUCTION_PERCENT_BY_LEVEL = [10, 20, 30] as const;
export const COST_LEAK_SEALING = [180, 300, 480] as const;

export const PURGE_AMPLIFIER_MAX_LEVEL = 3;
/** Bonus flat dégâts purge aux rangs 1 / 2 / 3 (tous cycles). */
export const PURGE_AMPLIFIER_DAMAGE_FLAT_BY_LEVEL = [10, 20, 30] as const;
export const COST_PURGE_AMPLIFIER = [200, 320, 500] as const;

export const DEFAULT_UPGRADES: UpgradeLevels = {
  node0Boot: 1,
  shardSalvage: 0,
  shardMagnet: 0,
  victoryShardBonus: 0,
  purgeStrike: 0,
  purgeCadence: 0,
  purgeReach: 0,
  purgeSplash: 0,
  purgeCrit: 0,
  latencyInjection: 0,
  threadCoolant: 0,
  killBreachRelief: 0,
  meltdownThreshold: 0,
  overclock: 0,
  fluxDrive: 0,
  breachDissipation: 0,
  leakSealing: 0,
  purgeAmplifier: 0,
};

export interface UpgradeCatalogEntry {
  id: UpgradeId;
  maxLevel: number;
  costByLevel: readonly number[];
  currency: UpgradeCurrency;
}

export const UPGRADE_CATALOG: UpgradeCatalogEntry[] = [
  {
    id: 'node0Boot',
    maxLevel: NODE0_BOOT_BASELINE_LEVEL,
    costByLevel: [],
    currency: 'shards',
  },
  {
    id: 'shardSalvage',
    maxLevel: SHARD_SALVAGE_MAX_LEVEL,
    costByLevel: COST_SHARD_SALVAGE,
    currency: 'shards',
  },
  {
    id: 'victoryShardBonus',
    maxLevel: VICTORY_SHARD_BONUS_MAX_LEVEL,
    costByLevel: COST_VICTORY_SHARD_BONUS,
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
    id: 'purgeCadence',
    maxLevel: PURGE_CADENCE_MAX_LEVEL,
    costByLevel: COST_PURGE_CADENCE,
    currency: 'shards',
  },
  {
    id: 'purgeCrit',
    maxLevel: PURGE_CRIT_MAX_LEVEL,
    costByLevel: COST_PURGE_CRIT,
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
    maxLevel: LATENCY_INJECTION_MAX_LEVEL,
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
  {
    id: 'overclock',
    maxLevel: OVERCLOCK_MAX_LEVEL,
    costByLevel: COST_OVERCLOCK,
    currency: 'shards',
  },
  {
    id: 'fluxDrive',
    maxLevel: FLUX_DRIVE_MAX_LEVEL,
    costByLevel: COST_FLUX_DRIVE,
    currency: 'shards',
  },
  {
    id: 'breachDissipation',
    maxLevel: BREACH_DISSIPATION_MAX_LEVEL,
    costByLevel: COST_BREACH_DISSIPATION,
    currency: 'shards',
  },
  {
    id: 'leakSealing',
    maxLevel: LEAK_SEALING_MAX_LEVEL,
    costByLevel: COST_LEAK_SEALING,
    currency: 'shards',
  },
  {
    id: 'purgeAmplifier',
    maxLevel: PURGE_AMPLIFIER_MAX_LEVEL,
    costByLevel: COST_PURGE_AMPLIFIER,
    currency: 'shards',
  },
];

function getCatalogEntry(id: UpgradeId): UpgradeCatalogEntry | undefined {
  return UPGRADE_CATALOG.find((item) => item.id === id);
}

/** Données économie pures — sans i18n. */
export function getUpgradeCatalogEntry(id: UpgradeId): UpgradeCatalogEntry | undefined {
  return getCatalogEntry(id);
}

function resolveUpgradeText(id: UpgradeId): { name: string; description: string } {
  let name: string = id;
  let description = '';
  try {
    const text = getGameStrings().upgrades[id];
    if (text) {
      name = text.name || name;
      description = text.description || '';
    } else {
      console.warn(`[upgradeCatalog] Missing i18n entry for upgrade: ${id}`);
    }
  } catch (error) {
    console.warn(`[upgradeCatalog] i18n unavailable for upgrade ${id}`, error);
  }
  return { name, description };
}

/** Catalogue + textes i18n — pour l'UI. Retourne null si l'id est inconnu. */
export function getUpgradeDisplay(id: UpgradeId): UpgradeDefinition | null {
  const entry = getCatalogEntry(id);
  if (!entry) {
    console.error(`[upgradeCatalog] Unknown upgrade id: ${id}`);
    return null;
  }
  const text = resolveUpgradeText(id);
  return { ...entry, ...text };
}

export function getUpgradeLevel(upgrades: UpgradeLevels, id: UpgradeId): number {
  const raw = upgrades[id];
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return 0;
  return Math.max(0, Math.floor(raw));
}

export function clampUpgradeLevel(id: UpgradeId, level: number): number {
  const entry = getCatalogEntry(id);
  const floored = Math.max(0, Math.floor(level));
  if (!entry) {
    console.warn(`[upgradeCatalog] clampUpgradeLevel: unknown id ${id}`);
    return floored;
  }
  return Math.min(entry.maxLevel, floored);
}

/** Normalise les niveaux sauvegardés — source unique pour persistence et dev tools. */
export function sanitizeUpgradeLevels(raw: Partial<UpgradeLevels> | undefined): UpgradeLevels {
  const upgrades = { ...DEFAULT_UPGRADES };
  if (!raw) return upgrades;

  for (const entry of UPGRADE_CATALOG) {
    const level = raw[entry.id];
    if (typeof level === 'number' && Number.isFinite(level)) {
      upgrades[entry.id] = clampUpgradeLevel(entry.id, level);
    }
  }

  return upgrades;
}

export function isUpgradeMaxed(
  definition: Pick<UpgradeDefinition, 'id' | 'maxLevel'>,
  level: number,
): boolean {
  return getUpgradeLevel({ ...DEFAULT_UPGRADES, [definition.id]: level }, definition.id) >= definition.maxLevel;
}

/** Hardware Supercharge — coût en Anchor Fragments pour surcharger n'importe quel module éligible. */
export const ANCHOR_SUPERCHARGE_COST = 1;

/** Éligible au Hardware Supercharge : tout module acheté en Éclats hex, y compris Overclock et Flux Drive. */
export function isAnchorSuperchargeEligible(id: UpgradeId): boolean {
  const entry = getCatalogEntry(id);
  return entry?.currency === 'shards';
}

export function isOverclockUnlocked(upgrades: UpgradeLevels): boolean {
  return upgrades.overclock >= 1;
}

export function isFluxDriveUnlocked(upgrades: UpgradeLevels): boolean {
  return upgrades.fluxDrive >= 1;
}

/**
 * Données catalogue + i18n.
 * Lance une erreur si l'id est inconnu — les appels doivent passer par des UpgradeId valides.
 * Pour un rendu UI tolérant, utiliser getUpgradeDisplay().
 */
export function getUpgradeDefinition(id: UpgradeId): UpgradeDefinition {
  const display = getUpgradeDisplay(id);
  if (!display) {
    throw new Error(`[upgradeCatalog] Unknown upgrade id: ${id}`);
  }
  return display;
}

export function getUpgradeCurrency(id: UpgradeId): UpgradeCurrency {
  const entry = getCatalogEntry(id);
  if (!entry) {
    console.error(`[upgradeCatalog] getUpgradeCurrency: unknown id ${id}`);
    return 'shards';
  }
  return entry.currency;
}

export function requireMax(id: UpgradeId): UpgradeRequirement[] {
  const entry = getCatalogEntry(id);
  if (!entry) {
    console.error(`[upgradeCatalog] requireMax: unknown id ${id}`);
    return [];
  }
  return [{ id, minLevel: entry.maxLevel }];
}

export function requireLevel(id: UpgradeId, minLevel: number): UpgradeRequirement[] {
  return [{ id, minLevel }];
}

export function getUpgradeCost(
  definition: Pick<UpgradeDefinition, 'id' | 'maxLevel' | 'costByLevel'>,
  level: number,
): number {
  const safeLevel = Math.max(0, Math.floor(level));
  if (isUpgradeMaxed(definition, safeLevel)) return 0;

  let cost: number;
  if (definition.costByLevel.length > 0) {
    cost =
      definition.costByLevel[safeLevel] ??
      definition.costByLevel[definition.costByLevel.length - 1] ??
      0;
  } else {
    console.error(
      `[upgradeCatalog] No cost curve for "${definition.id}" at level ${safeLevel}`,
    );
    cost = 0;
  }

  if (!Number.isFinite(cost) || cost < 1) {
    console.warn(
      `[upgradeCatalog] Invalid cost for "${definition.id}" L${safeLevel}: ${cost} — purchase blocked`,
    );
    return 0;
  }

  return Math.ceil(cost);
}

export function isModuleUnlocked(
  _id: UpgradeId,
  upgrades: UpgradeLevels,
  requirements: UpgradeRequirement[] | undefined,
): boolean {
  if (!requirements || requirements.length === 0) return true;
  return requirements.every((requirement) => {
    const requiredLevel = Number.isFinite(requirement.minLevel)
      ? requirement.minLevel
      : 1;
    return getUpgradeLevel(upgrades, requirement.id) >= requiredLevel;
  });
}

export function getModuleState(
  id: UpgradeId,
  bankShards: number,
  bankAnchorFragments: number,
  upgrades: UpgradeLevels,
  requirements: UpgradeRequirement[] | undefined,
): ModuleState {
  const entry = getCatalogEntry(id);
  if (!entry) {
    console.error(`[upgradeCatalog] getModuleState: unknown id ${id}`);
    return 'locked';
  }

  const level = getUpgradeLevel(upgrades, id);

  if (!isModuleUnlocked(id, upgrades, requirements)) return 'locked';
  if (isUpgradeMaxed(entry, level)) return 'maxed';

  const cost = getUpgradeCost(entry, level);
  if (cost <= 0) return 'unaffordable';

  const balance = entry.currency === 'anchor' ? bankAnchorFragments : bankShards;
  return balance >= cost ? 'available' : 'unaffordable';
}
