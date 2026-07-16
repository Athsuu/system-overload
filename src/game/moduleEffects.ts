/**
 * Registre canonique module → effets gameplay.
 * Ajouter un module : MODULE_EFFECT_REGISTRY + compute* ci-dessous, puis suivre docs/lexique-jeu.md §14.
 */

import {
  BREACH_DISSIPATION_PER_SEC_BY_LEVEL,
  LEAK_SEALING_PENALTY_REDUCTION_PERCENT_BY_LEVEL,
  PURGE_AMPLIFIER_DAMAGE_FLAT_BY_LEVEL,
  KILL_BREACH_RELIEF_PER_LEVEL,
  MELTDOWN_THRESHOLD_CAP_PERCENT_PER_LEVEL,
  PURGE_CADENCE_INTERVAL_MS_PER_LEVEL,
  PURGE_CRIT_CHANCE_PERCENT_PER_LEVEL,
  PURGE_REACH_AOE_PERCENT_PER_LEVEL,
  PURGE_SPLASH_DAMAGE_PERCENT_BY_LEVEL,
  PURGE_SPLASH_RADIUS_BONUS_PERCENT_BY_LEVEL,
  PURGE_STRIKE_DAMAGE_PER_LEVEL,
  SHARD_SALVAGE_YIELD_PERCENT_PER_LEVEL,
  THREAD_COOLANT_PASSIVE_REDUCTION_PER_LEVEL,
  VICTORY_SHARD_BONUS_FLAT_BY_LEVEL,
  type AnchoredNodes,
  type UpgradeId,
  type UpgradeLevels,
} from '../store/upgradeCatalog';
import type { CoreProtocolLevels } from '../store/prestigeTypes';
import { DEFAULT_CORE_PROTOCOLS } from '../store/prestigeTypes';
import {
  BOOT_REINFORCEMENT_DAMAGE_PERCENT_PER_LEVEL,
  EXPLOSIVE_PURGE_BASE_DAMAGE_RATIO,
  EXPLOSIVE_PURGE_BASE_RADIUS_PX,
  EXPLOSIVE_PURGE_DAMAGE_RATIO_PER_LEVEL,
  EXPLOSIVE_PURGE_RADIUS_PER_LEVEL_PX,
  EXTRACTION_PROTOCOL_PERCENT_PER_LEVEL,
  THERMAL_BASELINE_DECAY_FACTOR_PER_LEVEL,
} from '../store/coreProtocolCatalog';
import { getAnchorHeatMultiplier, getAnchorMultiplier } from './anchorSupercharge';
import { BASE_CRITICAL_CHANCE, BASE_CRITICAL_MULTIPLIER } from './juice/criticalHit';

const NO_ANCHORED_NODES: AnchoredNodes = {};

export const BASE_BREACH_CAP = 100;

export interface RunConfig {
  starterNodes: number;
  baseEnemyHp: number;
  shardsMultiplier: number;
  killBonusShards: number;
  spawnIntervalMult: number;
  maxAliveReduction: number;
  baseEnemySpeed: number;
  maxEnemySpeed: number;
  passiveHeatPerSec: number;
  leakProgressPenalty: number;
  purgeRadius: number;
  purgeHitDamage: number;
  purgeIntervalMs: number;
  /** Coup critique — base + modules (ex. Critique de purge). */
  criticalChance: number;
  criticalMultiplier: number;
  /** Prestige — Purge explosive unlock. */
  explosivePurgeEnabled: boolean;
  explosivePurgeRadiusPx: number;
  /** Fraction of purgeHitDamage dealt by on-kill explosions. */
  explosivePurgeDamageRatio: number;
  /** Max re-explosion depth from explosion kills (0 = no chain). */
  explosivePurgeChainDepth: number;
}

/** Bases de run non modifiées par les modules (pour l'instant). */
export const RUN_STAT_BASE = {
  starterNodes: 0,
  baseEnemyHp: 20,
  baseEnemySpeed: 52.16,
  maxEnemySpeed: 102.47,
  /** Package A — pression Overload : base 2,8 / s (ex-1,5). */
  basePassiveHeatPerSec: 2.8,
  /** Réserve legacy RunConfig ; la fuite runtime utilise LEAK_BREACH_PERCENT_OF_CAP. */
  baseLeakProgressPenalty: 20,
  basePurgeRadius: 72,
  basePurgeHitDamage: 5,
  basePurgeIntervalMs: 1000,
  shardsMultiplier: 1,
  spawnIntervalMult: 1,
  maxAliveReduction: 0,
} as const;

/** Stat gameplay touchée par un module — aide l'agent à brancher le bon fichier. */
export type ModuleEffectTarget =
  | 'runConfig.killBonusShards'
  | 'runConfig.shardsMultiplier'
  | 'runConfig.purgeHitDamage'
  | 'runConfig.purgeIntervalMs'
  | 'runConfig.purgeRadius'
  | 'runConfig.criticalChance'
  | 'purge.splashRadius'
  | 'purge.splashDamage'
  | 'runConfig.passiveHeatPerSec'
  | 'purge.latencySlow'
  | 'breach.cap'
  | 'breach.dissipation'
  | 'breach.leakReduction'
  | 'breach.killRelief'
  | 'loot.hexShardRadii'
  | 'overclock.unlock'
  | 'runConfig.timeScale';

export interface ModuleEffectRegistryEntry {
  upgradeId: UpgradeId;
  targets: ModuleEffectTarget[];
  summaryFr: string;
}

/**
 * Inventaire des effets actifs — synchroniser avec le lexique (§4) à chaque ajout.
 * Les modules sans entrée ici n'ont pas d'effet runtime documenté.
 */
export const MODULE_EFFECT_REGISTRY: ModuleEffectRegistryEntry[] = [
  {
    upgradeId: 'node0Boot',
    targets: ['runConfig.purgeHitDamage'],
    summaryFr: 'Active les dégâts de base de la zone de purge',
  },
  {
    upgradeId: 'shardSalvage',
    targets: ['runConfig.shardsMultiplier'],
    summaryFr: '+25 % rendement Éclats hex / rang (max +125 % au rang 5) — fraction = chance d’un éclat en plus',
  },
  {
    upgradeId: 'victoryShardBonus',
    targets: ['runConfig.killBonusShards'],
    summaryFr: 'Éclats bonus à Breach Contained (victoire boss)',
  },
  {
    upgradeId: 'shardMagnet',
    targets: ['loot.hexShardRadii'],
    summaryFr: 'Rayon de collecte et aspiration des Éclats hex au sol',
  },
  {
    upgradeId: 'purgeStrike',
    targets: ['runConfig.purgeHitDamage'],
    summaryFr: 'Bonus flat de dégâts Purge Strike (+5/rang, max 10)',
  },
  {
    upgradeId: 'purgeCadence',
    targets: ['runConfig.purgeIntervalMs'],
    summaryFr: 'Cadence de purge plus rapide',
  },
  {
    upgradeId: 'purgeCrit',
    targets: ['runConfig.criticalChance'],
    summaryFr: '+2 % chance de critique / rang (base 8 %, max 18 % au rang 5) — multi ×2',
  },
  {
    upgradeId: 'purgeReach',
    targets: ['runConfig.purgeRadius'],
    summaryFr: 'Zone de purge plus large',
  },
  {
    upgradeId: 'purgeSplash',
    targets: ['purge.splashRadius', 'purge.splashDamage'],
    summaryFr: 'Éclaboussure : +70 / +105 / +140 % rayon vs zone principale ; dégâts 40 / 70 / 100 % (rang 3 = purge)',
  },
  {
    upgradeId: 'latencyInjection',
    targets: ['purge.latencySlow'],
    summaryFr: 'Ralentit les processus corrompus dans la zone de purge',
  },
  {
    upgradeId: 'threadCoolant',
    targets: ['runConfig.passiveHeatPerSec'],
    summaryFr: 'Réduit la chaleur passive (−0,08/s par rang, plancher 1,8/s)',
  },
  {
    upgradeId: 'killBreachRelief',
    targets: ['breach.killRelief'],
    summaryFr: 'Soulagement Overload à chaque kill (−0,5 % / rang → −2,5 % au rang 5)',
  },
  {
    upgradeId: 'meltdownThreshold',
    targets: ['breach.cap'],
    summaryFr: 'Augmente le seuil Meltdown (+8 % / rang → 180 % au rang 10)',
  },
  {
    upgradeId: 'overclock',
    targets: ['overclock.unlock'],
    summaryFr: 'Débloque le bouton Overclock (Espace / HUD)',
  },
  {
    upgradeId: 'fluxDrive',
    targets: ['runConfig.timeScale'],
    summaryFr: 'Débloque le toggle Flux Drive (×2 vitesse de simulation)',
  },
  {
    upgradeId: 'breachDissipation',
    targets: ['breach.dissipation'],
    summaryFr: 'Drain passif de la jauge Breach (−0,10 / −0,20 / −0,30 par s, tous cycles)',
  },
  {
    upgradeId: 'leakSealing',
    targets: ['breach.leakReduction'],
    summaryFr: 'Réduit la pénalité Breach par fuite (−10 / −20 / −30 %)',
  },
  {
    upgradeId: 'purgeAmplifier',
    targets: ['runConfig.purgeHitDamage'],
    summaryFr: 'Bonus flat dégâts purge (+10 / +20 / +30, tous cycles)',
  },
];

/** Fichiers à toucher pour un nouveau module module tree (checklist agent). */
export const MODULE_ADDITION_PIPELINE = [
  'src/store/upgradeCatalog.ts — id, coûts, constantes d’effet',
  'src/store/moduleTree.ts — nœud, position hex, branche, prérequis',
  'src/game/moduleEffects.ts — MODULE_EFFECT_REGISTRY + compute*',
  'src/i18n/locales/en.ts + fr.ts + types.ts — nom et description',
  'src/ui/module-tree/upgradeTooltipStats.ts — lignes de stats au survol',
  'docs/lexique-jeu.md — §4 et §14',
  'Optionnel : src/game/loot/ si le module touche le loot',
  'Optionnel : moteur Pixi dédié si mécanique active (Overclock, etc.)',
  'Optionnel : docs/dialogues.md si ARCH en parle',
] as const;

/** Plancher cadence purge — évite intervalle 0 ms ou négatif si niveaux / constantes augmentent. */
export const MIN_PURGE_INTERVAL_MS = 150;

/**
 * Plancher Overload passive (Package A) — Coolant ne peut plus éteindre la jauge.
 * Avec base 2,8 et −0,08 / rang, le plancher cadre surtout les Ancrages.
 */
export const MIN_PASSIVE_HEAT_PER_SEC = 1.8;

function flatPerLevel(level: number, perLevel: number): number {
  return level * perLevel;
}

function subtractPerLevel(base: number, level: number, perLevel: number, floor = 0): number {
  return Math.max(floor, base - flatPerLevel(level, perLevel));
}

function scaleRadiusByPercent(base: number, level: number, percentPerLevel: number): number {
  return Math.round(base * (1 + flatPerLevel(level, percentPerLevel) / 100));
}

/** Profil AOE purge — zone principale + éclaboussure dérivée du même scale. */
export interface PurgeAoeProfile {
  mainRadius: number;
  splashRadius: number;
  reachBonusPercent: number;
  splashRadiusBonusPercent: number;
}

export function getPurgeReachBonusPercent(reachLevel: number): number {
  return flatPerLevel(reachLevel, PURGE_REACH_AOE_PERCENT_PER_LEVEL);
}

export function computePurgeAoeProfile(
  upgrades: UpgradeLevels,
  anchoredNodes: AnchoredNodes = NO_ANCHORED_NODES,
): PurgeAoeProfile {
  const reachMultiplier = getAnchorMultiplier(anchoredNodes, 'purgeReach');
  const splashMultiplier = getAnchorMultiplier(anchoredNodes, 'purgeSplash');
  const reachBonusPercent = getPurgeReachBonusPercent(upgrades.purgeReach) * reachMultiplier;
  const mainRadius = scaleRadiusByPercent(
    RUN_STAT_BASE.basePurgeRadius,
    upgrades.purgeReach,
    PURGE_REACH_AOE_PERCENT_PER_LEVEL * reachMultiplier,
  );
  const splashRadiusBonusPercent = getPurgeSplashRadiusBonusPercent(upgrades.purgeSplash, splashMultiplier);
  const splashRadius = getPurgeSplashRadius(mainRadius, upgrades.purgeSplash, splashMultiplier);
  return { mainRadius, splashRadius, reachBonusPercent, splashRadiusBonusPercent };
}

export function computeVictoryShardBonus(
  upgrades: UpgradeLevels,
  anchoredNodes: AnchoredNodes = NO_ANCHORED_NODES,
): number {
  const level = upgrades.victoryShardBonus;
  if (level <= 0) return 0;
  const anchorMultiplier = getAnchorMultiplier(anchoredNodes, 'victoryShardBonus');
  const index = Math.min(level, VICTORY_SHARD_BONUS_FLAT_BY_LEVEL.length) - 1;
  return Math.round(VICTORY_SHARD_BONUS_FLAT_BY_LEVEL[index] * anchorMultiplier);
}

export function getBreachDissipationPerSec(level: number, anchorMultiplier = 1): number {
  if (level <= 0) return 0;
  const index = Math.min(level, BREACH_DISSIPATION_PER_SEC_BY_LEVEL.length) - 1;
  return BREACH_DISSIPATION_PER_SEC_BY_LEVEL[index] * anchorMultiplier;
}

export function getLeakSealingReductionPercent(level: number, anchorMultiplier = 1): number {
  if (level <= 0) return 0;
  const index = Math.min(level, LEAK_SEALING_PENALTY_REDUCTION_PERCENT_BY_LEVEL.length) - 1;
  return LEAK_SEALING_PENALTY_REDUCTION_PERCENT_BY_LEVEL[index] * anchorMultiplier;
}

export function getPurgeAmplifierDamageFlat(level: number, anchorMultiplier = 1): number {
  if (level <= 0) return 0;
  const index = Math.min(level, PURGE_AMPLIFIER_DAMAGE_FLAT_BY_LEVEL.length) - 1;
  return PURGE_AMPLIFIER_DAMAGE_FLAT_BY_LEVEL[index] * anchorMultiplier;
}

/** @deprecated Prefer getPurgeAmplifierDamageFlat — Amplificateur est flat, plus en %. */
export function getPurgeAmplifierDamageBonusPercent(level: number, anchorMultiplier = 1): number {
  return getPurgeAmplifierDamageFlat(level, anchorMultiplier);
}

export function getLatencySlowMultiplier(level: number, anchorMultiplier = 1): number {
  if (level <= 0) return 1;
  return Math.max(0.1, 1 - level * 0.10 * anchorMultiplier);
}

export function getPurgeSplashRadiusBonusPercent(splashLevel: number, anchorMultiplier = 1): number {
  if (splashLevel <= 0) return 0;
  const index = Math.min(splashLevel, PURGE_SPLASH_RADIUS_BONUS_PERCENT_BY_LEVEL.length) - 1;
  return PURGE_SPLASH_RADIUS_BONUS_PERCENT_BY_LEVEL[index] * anchorMultiplier;
}

export function getPurgeSplashRadius(mainRadius: number, splashLevel: number, anchorMultiplier = 1): number {
  const bonusPercent = getPurgeSplashRadiusBonusPercent(splashLevel, anchorMultiplier);
  if (bonusPercent <= 0) return mainRadius;
  return Math.round(mainRadius * (1 + bonusPercent / 100));
}

export function getPurgeSplashDamagePercent(level: number, anchorMultiplier = 1): number {
  if (level <= 0) return 0;
  const index = Math.min(level, PURGE_SPLASH_DAMAGE_PERCENT_BY_LEVEL.length) - 1;
  return PURGE_SPLASH_DAMAGE_PERCENT_BY_LEVEL[index] * anchorMultiplier;
}

export function resolvePurgeSplashDamage(
  basePurgeHitDamage: number,
  splashLevel: number,
  anchorMultiplier = 1,
): number {
  const percent = getPurgeSplashDamagePercent(splashLevel, anchorMultiplier);
  if (percent <= 0) return 0;
  return Math.max(1, Math.round(basePurgeHitDamage * (percent / 100)));
}

export function computeRunConfig(
  upgrades: UpgradeLevels,
  coreProtocols: CoreProtocolLevels = { ...DEFAULT_CORE_PROTOCOLS },
  anchoredNodes: AnchoredNodes = NO_ANCHORED_NODES,
): RunConfig {
  const aoe = computePurgeAoeProfile(upgrades, anchoredNodes);
  const thermalBaselineDecay = THERMAL_BASELINE_DECAY_FACTOR_PER_LEVEL ** coreProtocols.thermalBaseline;
  const basePassiveAfterModules = subtractPerLevel(
    RUN_STAT_BASE.basePassiveHeatPerSec,
    upgrades.threadCoolant,
    THREAD_COOLANT_PASSIVE_REDUCTION_PER_LEVEL * getAnchorMultiplier(anchoredNodes, 'threadCoolant'),
    MIN_PASSIVE_HEAT_PER_SEC,
  );
  const passiveHeatPerSec = Math.max(
    MIN_PASSIVE_HEAT_PER_SEC,
    basePassiveAfterModules * thermalBaselineDecay * getAnchorHeatMultiplier(anchoredNodes),
  );
  const extractionBonus =
    1 + (coreProtocols.extractionProtocol * EXTRACTION_PROTOCOL_PERCENT_PER_LEVEL) / 100;
  const bootReinforcementMultiplier =
    1 + (coreProtocols.bootReinforcement * BOOT_REINFORCEMENT_DAMAGE_PERCENT_PER_LEVEL) / 100;
  const shardSalvageMultiplier =
    1 +
    (SHARD_SALVAGE_YIELD_PERCENT_PER_LEVEL / 100) *
      upgrades.shardSalvage *
      getAnchorMultiplier(anchoredNodes, 'shardSalvage');
  const purgeAmplifierFlat = getPurgeAmplifierDamageFlat(
    upgrades.purgeAmplifier,
    getAnchorMultiplier(anchoredNodes, 'purgeAmplifier'),
  );
  const explosivePurgeEnabled = coreProtocols.explosivePurge >= 1;
  const explosivePurgeRadiusPx =
    EXPLOSIVE_PURGE_BASE_RADIUS_PX +
    coreProtocols.explosivePurgeRadius * EXPLOSIVE_PURGE_RADIUS_PER_LEVEL_PX;
  const explosivePurgeDamageRatio =
    EXPLOSIVE_PURGE_BASE_DAMAGE_RATIO +
    coreProtocols.explosivePurgeDamage * EXPLOSIVE_PURGE_DAMAGE_RATIO_PER_LEVEL;

  return {
    starterNodes: RUN_STAT_BASE.starterNodes,
    baseEnemyHp: RUN_STAT_BASE.baseEnemyHp,
    shardsMultiplier: shardSalvageMultiplier * extractionBonus,
    killBonusShards: 0,
    spawnIntervalMult: RUN_STAT_BASE.spawnIntervalMult,
    maxAliveReduction: RUN_STAT_BASE.maxAliveReduction,
    baseEnemySpeed: RUN_STAT_BASE.baseEnemySpeed,
    maxEnemySpeed: RUN_STAT_BASE.maxEnemySpeed,
    passiveHeatPerSec,
    leakProgressPenalty: RUN_STAT_BASE.baseLeakProgressPenalty,
    purgeRadius: aoe.mainRadius,
    purgeHitDamage: Math.round(
      ((upgrades.node0Boot >= 1
        ? RUN_STAT_BASE.basePurgeHitDamage * getAnchorMultiplier(anchoredNodes, 'node0Boot')
        : 0) +
        flatPerLevel(
          upgrades.purgeStrike,
          PURGE_STRIKE_DAMAGE_PER_LEVEL * getAnchorMultiplier(anchoredNodes, 'purgeStrike'),
        ) +
        purgeAmplifierFlat) *
        bootReinforcementMultiplier,
    ),
    purgeIntervalMs: subtractPerLevel(
      RUN_STAT_BASE.basePurgeIntervalMs,
      upgrades.purgeCadence,
      PURGE_CADENCE_INTERVAL_MS_PER_LEVEL * getAnchorMultiplier(anchoredNodes, 'purgeCadence'),
      MIN_PURGE_INTERVAL_MS,
    ),
    criticalChance: computeCriticalChance(upgrades, anchoredNodes),
    criticalMultiplier: BASE_CRITICAL_MULTIPLIER,
    explosivePurgeEnabled,
    explosivePurgeRadiusPx,
    explosivePurgeDamageRatio,
    explosivePurgeChainDepth: coreProtocols.explosivePurgeChain,
  };
}

export function getPurgeCritChanceBonusPercent(
  level: number,
  anchorMultiplier = 1,
): number {
  return flatPerLevel(level, PURGE_CRIT_CHANCE_PERCENT_PER_LEVEL * anchorMultiplier);
}

export function computeCriticalChance(
  upgrades: UpgradeLevels,
  anchoredNodes: AnchoredNodes = NO_ANCHORED_NODES,
): number {
  const bonusPercent = getPurgeCritChanceBonusPercent(
    upgrades.purgeCrit,
    getAnchorMultiplier(anchoredNodes, 'purgeCrit'),
  );
  return BASE_CRITICAL_CHANCE + bonusPercent / 100;
}

export function computeBreachCap(
  upgrades: UpgradeLevels,
  anchoredNodes: AnchoredNodes = NO_ANCHORED_NODES,
): number {
  const anchorMultiplier = getAnchorMultiplier(anchoredNodes, 'meltdownThreshold');
  const bonusPercent =
    MELTDOWN_THRESHOLD_CAP_PERCENT_PER_LEVEL * upgrades.meltdownThreshold * anchorMultiplier;
  return Math.round(BASE_BREACH_CAP * (1 + bonusPercent / 100));
}

export function computeKillBreachRelief(
  upgrades: UpgradeLevels,
  anchoredNodes: AnchoredNodes = NO_ANCHORED_NODES,
): number {
  return flatPerLevel(
    upgrades.killBreachRelief,
    KILL_BREACH_RELIEF_PER_LEVEL * getAnchorMultiplier(anchoredNodes, 'killBreachRelief'),
  );
}

export function getModuleEffectEntry(upgradeId: UpgradeId): ModuleEffectRegistryEntry | undefined {
  return MODULE_EFFECT_REGISTRY.find((entry) => entry.upgradeId === upgradeId);
}
