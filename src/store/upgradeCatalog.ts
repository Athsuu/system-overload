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
  | 'meltdownThreshold'
  | 'overclock'
  | 'fluxDrive';

export type ModuleState = 'locked' | 'available' | 'unaffordable' | 'maxed' | 'reserved';

/** Hardware Supercharge — module ID → ancré (présent) et ON/OFF (valeur). */
export type AnchoredNodes = Partial<Record<UpgradeId, boolean>>;

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
  overclock: number;
  fluxDrive: number;
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
  costFormula?: (level: number) => number;
  currency: UpgradeCurrency;
}

/** Boss victory — Anchor Fragment on first cycle clear only (see endRun). */
export const ANCHOR_FRAGMENTS_PER_BOSS = 1;

/** Flat shard bonus on boss victory (in addition to run kills). */
export const BOSS_VICTORY_SHARD_BONUS = 25;

/** Node-0 Boot : baseline gratuit — niveau 1 dès le départ, jamais achetable (pas de coût). */
export const NODE0_BOOT_BASELINE_LEVEL = 1;

/** Soft Cap économique : plus de plafond de rang, coût qui grimpe en formule (voir softCapCost). */
/** Multiplicateur de rendement d'éclats composé par rang (remplace l'ancien flat +1/rang — voir rééquilibrage). */
export const SHARD_SALVAGE_YIELD_GROWTH_PER_LEVEL = 1.18;
export const SHARD_SALVAGE_COST_BASE = 5;
/** Coût assoupli par rapport au SOFT_CAP_COST_GROWTH partagé (1.15) — reste achetable à haut niveau vu le coût de base élevé. */
export const SHARD_SALVAGE_COST_GROWTH = 1.12;

export const SHARD_YIELD_MAX_LEVEL = 5;
/** Bonus multiplicatif sur les éclats de base par kill (+20 % / rang). */
export const SHARD_YIELD_PERCENT_PER_LEVEL = 20;

export const SHARD_MAGNET_MAX_LEVEL = 3;
/** Rayon de collecte (px) aux rangs 0–3 de l'Aimant d'éclats. */
export const SHARD_MAGNET_COLLECT_RADIUS_BY_LEVEL = [20, 44, 68, 92] as const;
/** Rayon d'attraction magnétique (px) aux rangs 0–3 — 0 = pas d'aspiration au départ. */
export const SHARD_MAGNET_MAGNET_RADIUS_BY_LEVEL = [0, 72, 128, 200] as const;
export const COST_SHARD_MAGNET = [130, 220, 350] as const;

/** Frappe de purge — soft cap (base 5, growth propre). */
export const PURGE_STRIKE_DAMAGE_PER_LEVEL = 2;
/** Multiplicateur composé appliqué à la base (5 + flat) par rang. */
export const PURGE_STRIKE_DAMAGE_GROWTH_PER_LEVEL = 1.015;
export const PURGE_STRIKE_MAX_LEVEL = 10;
export const PURGE_STRIKE_COST_GROWTH = 1.18;
export const PURGE_STRIKE_COST_BASE = 5;

function buildShardCostCurve(base: number, growth: number, levels: number): readonly number[] {
  return Array.from({ length: levels }, (_, index) => Math.ceil(base * growth ** index));
}

/** Soft Cap économique — sentinel pour modules sans plafond de rang. */
export const UNLIMITED_MAX_LEVEL = Number.POSITIVE_INFINITY;

/** IDs sans plafond — coût via costFormula uniquement. */
export const UNLIMITED_UPGRADE_IDS = ['shardSalvage', 'purgeStrike', 'meltdownThreshold'] as const satisfies readonly UpgradeId[];

/** Soft Cap économique — coût qui grimpe à l'infini : base × growth^niveau (growth par défaut 1.15). */
export const SOFT_CAP_COST_GROWTH = 1.15;

function softCapCost(base: number, growth: number = SOFT_CAP_COST_GROWTH): (level: number) => number {
  return (level: number) => Math.ceil(base * Math.pow(growth, level));
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

export const THREAD_COOLANT_MAX_LEVEL = 10;
export const THREAD_COOLANT_PASSIVE_REDUCTION_PER_LEVEL = 0.14;
export const THREAD_COOLANT_COST_BASE = 10;
export const THREAD_COOLANT_COST_GROWTH = 1.2;

export const COST_THREAD_COOLANT = buildShardCostCurve(
  THREAD_COOLANT_COST_BASE,
  THREAD_COOLANT_COST_GROWTH,
  THREAD_COOLANT_MAX_LEVEL,
);

export const KILL_BREACH_RELIEF_MAX_LEVEL = 10;
export const KILL_BREACH_RELIEF_PER_LEVEL = 0.1;
export const KILL_BREACH_RELIEF_COST_BASE = 10;
export const KILL_BREACH_RELIEF_COST_GROWTH = 1.18;

export const COST_KILL_BREACH_RELIEF = buildShardCostCurve(
  KILL_BREACH_RELIEF_COST_BASE,
  KILL_BREACH_RELIEF_COST_GROWTH,
  KILL_BREACH_RELIEF_MAX_LEVEL,
);

/** Multiplicateur de cap Breach composé par rang (remplace l'ancien flat +8/rang — voir rééquilibrage). */
export const MELTDOWN_THRESHOLD_CAP_GROWTH_PER_LEVEL = 1.05;
export const MELTDOWN_THRESHOLD_COST_BASE = 5;
export const MELTDOWN_THRESHOLD_COST_GROWTH = 1.16;

export const OVERCLOCK_MAX_LEVEL = 1;
export const COST_OVERCLOCK = [200] as const;

export const FLUX_DRIVE_MAX_LEVEL = 1;
export const COST_FLUX_DRIVE = [280] as const;
/** Flux Drive time scale once installed and toggled on — matches LORE.fluxDrive ("double la vitesse"). */
export const FLUX_DRIVE_TIME_SCALE = 2;
/** Hardware Supercharge sur Flux Drive : ×3 au lieu du ×2 générique (évite un ×4 déséquilibré). */
export const FLUX_DRIVE_TIME_SCALE_ANCHORED = 3;

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
  overclock: 0,
  fluxDrive: 0,
};

export interface UpgradeCatalogEntry {
  id: UpgradeId;
  maxLevel: number;
  costByLevel: readonly number[];
  costFormula?: (level: number) => number;
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
    maxLevel: UNLIMITED_MAX_LEVEL,
    costByLevel: [],
    costFormula: softCapCost(SHARD_SALVAGE_COST_BASE, SHARD_SALVAGE_COST_GROWTH),
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
    maxLevel: UNLIMITED_MAX_LEVEL,
    costByLevel: [],
    costFormula: softCapCost(PURGE_STRIKE_COST_BASE, PURGE_STRIKE_COST_GROWTH),
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
    maxLevel: UNLIMITED_MAX_LEVEL,
    costByLevel: [],
    costFormula: softCapCost(MELTDOWN_THRESHOLD_COST_BASE, MELTDOWN_THRESHOLD_COST_GROWTH),
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

/** Module sans plafond de rang (Soft Cap économique). */
export function isUnlimitedUpgrade(definition: Pick<UpgradeDefinition, 'maxLevel'>): boolean {
  return !Number.isFinite(definition.maxLevel);
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
  if (isUnlimitedUpgrade(entry)) return floored;
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
  if (isUnlimitedUpgrade(definition)) return false;
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
  if (isUnlimitedUpgrade(entry)) {
    console.warn(
      `[upgradeCatalog] requireMax("${id}") on uncapped module — falling back to requireLevel(id, 1)`,
    );
    return [{ id, minLevel: 1 }];
  }
  return [{ id, minLevel: entry.maxLevel }];
}

export function requireLevel(id: UpgradeId, minLevel: number): UpgradeRequirement[] {
  return [{ id, minLevel }];
}

export function getUpgradeCost(
  definition: Pick<UpgradeDefinition, 'id' | 'maxLevel' | 'costByLevel' | 'costFormula'>,
  level: number,
): number {
  const safeLevel = Math.max(0, Math.floor(level));
  if (isUpgradeMaxed(definition, safeLevel)) return 0;

  let cost: number;
  if (definition.costFormula) {
    cost = definition.costFormula(safeLevel);
  } else if (definition.costByLevel.length > 0) {
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
