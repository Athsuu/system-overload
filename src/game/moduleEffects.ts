/**
 * Registre canonique module → effets gameplay.
 * Ajouter un module : MODULE_EFFECT_REGISTRY + compute* ci-dessous, puis suivre docs/lexique-jeu.md §14.
 */

import {
  KILL_BREACH_RELIEF_PER_LEVEL,
  MELTDOWN_THRESHOLD_CAP_GROWTH_PER_LEVEL,
  PURGE_CADENCE_INTERVAL_MS_PER_LEVEL,
  PURGE_REACH_AOE_PERCENT_PER_LEVEL,
  PURGE_SPLASH_DAMAGE_PERCENT_BY_LEVEL,
  PURGE_SPLASH_RADIUS_BONUS_PERCENT_BY_LEVEL,
  PURGE_STRIKE_DAMAGE_GROWTH_PER_LEVEL,
  PURGE_STRIKE_DAMAGE_PER_LEVEL,
  ELITE_BREAKER_DAMAGE_PERCENT_BY_LEVEL,
  SHARD_SALVAGE_YIELD_GROWTH_PER_LEVEL,
  SHARD_YIELD_PERCENT_PER_LEVEL,
  THREAD_COOLANT_PASSIVE_REDUCTION_PER_LEVEL,
  type AnchoredNodes,
  type UpgradeId,
  type UpgradeLevels,
} from '../store/upgradeCatalog';
import type { CoreProtocolLevels } from '../store/prestigeTypes';
import {
  BOOT_REINFORCEMENT_DAMAGE_PERCENT_PER_LEVEL,
  EXTRACTION_PROTOCOL_PERCENT_PER_LEVEL,
  THERMAL_BASELINE_DECAY_FACTOR_PER_LEVEL,
} from '../store/coreProtocolCatalog';
import { getRecompileDepthMultiplier } from '../store/prestigeLogic';
import { getAnchorHeatMultiplier, getAnchorMultiplier } from './anchorSupercharge';
import type { EnemyClass } from './enemyClass';
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
  /** Préparation coup critique — pas encore modifiable par un module (voir game/juice/criticalHit.ts). */
  criticalChance: number;
  criticalMultiplier: number;
}

/** Bases de run non modifiées par les modules (pour l'instant). */
export const RUN_STAT_BASE = {
  starterNodes: 0,
  baseEnemyHp: 20,
  baseEnemySpeed: 52.16,
  maxEnemySpeed: 102.47,
  basePassiveHeatPerSec: 1.5,
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
  | 'purge.eliteDamageBonus'
  | 'runConfig.purgeIntervalMs'
  | 'runConfig.purgeRadius'
  | 'purge.splashRadius'
  | 'purge.splashDamage'
  | 'runConfig.passiveHeatPerSec'
  | 'purge.latencySlow'
  | 'breach.cap'
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
    summaryFr: 'Multiplicateur composé sur le rendement d’Éclats hex par kill (×1.18^rang, illimité)',
  },
  {
    upgradeId: 'shardYield',
    targets: ['runConfig.shardsMultiplier'],
    summaryFr: 'Bonus % sur les éclats de base par kill (rendement d’extraction)',
  },
  {
    upgradeId: 'shardMagnet',
    targets: ['loot.hexShardRadii'],
    summaryFr: 'Rayon de collecte et aspiration des Éclats hex au sol',
  },
  {
    upgradeId: 'purgeStrike',
    targets: ['runConfig.purgeHitDamage'],
    summaryFr: 'Bonus de dégâts Purge Strike',
  },
  {
    upgradeId: 'eliteBreaker',
    targets: ['purge.eliteDamageBonus'],
    summaryFr: 'Bonus de dégâts purge vs processus lourds (élite)',
  },
  {
    upgradeId: 'purgeCadence',
    targets: ['runConfig.purgeIntervalMs'],
    summaryFr: 'Cadence de purge plus rapide',
  },
  {
    upgradeId: 'purgeReach',
    targets: ['runConfig.purgeRadius'],
    summaryFr: 'Zone de purge plus large',
  },
  {
    upgradeId: 'purgeSplash',
    targets: ['purge.splashRadius', 'purge.splashDamage'],
    summaryFr: 'Éclaboussure : extension % de la zone principale + dégâts réduits hors zone directe',
  },
  {
    upgradeId: 'latencyInjection',
    targets: ['purge.latencySlow'],
    summaryFr: 'Ralentit les processus corrompus dans la zone de purge',
  },
  {
    upgradeId: 'threadCoolant',
    targets: ['runConfig.passiveHeatPerSec'],
    summaryFr: 'Réduit la montée passive d’Overload',
  },
  {
    upgradeId: 'killBreachRelief',
    targets: ['breach.killRelief'],
    summaryFr: 'Soulagement Breach à chaque kill',
  },
  {
    upgradeId: 'meltdownThreshold',
    targets: ['breach.cap'],
    summaryFr: 'Augmente le seuil Meltdown (cap Breach %)',
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
];

/** Fichiers à toucher pour un nouveau module module tree (checklist agent). */
export const MODULE_ADDITION_PIPELINE = [
  'src/store/upgradeCatalog.ts — id, coûts, constantes d’effet',
  'src/store/moduleTree.ts — nœud, position hex, branche, prérequis',
  'src/game/moduleEffects.ts — MODULE_EFFECT_REGISTRY + compute*',
  'src/i18n/locales/en.ts + fr.ts + types.ts — nom et description',
  'src/ui/upgradeTooltipStats.ts — lignes de stats au survol',
  'docs/lexique-jeu.md — §4 et §14',
  'Optionnel : src/game/loot/ si le module touche le loot',
  'Optionnel : moteur Pixi dédié si mécanique active (Overclock, etc.)',
  'Optionnel : docs/dialogues.md si ARCH en parle',
] as const;

/** Plancher cadence purge — évite intervalle 0 ms ou négatif si niveaux / constantes augmentent. */
export const MIN_PURGE_INTERVAL_MS = 150;

/** Plancher Overload passive — la Brèche ne doit pas s'arrêter totalement au max Thread Coolant. */
export const MIN_PASSIVE_HEAT_PER_SEC = 0.5;

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

export function getShardYieldBonusPercent(yieldLevel: number): number {
  return flatPerLevel(yieldLevel, SHARD_YIELD_PERCENT_PER_LEVEL);
}

export function getShardYieldMultiplier(yieldLevel: number): number {
  return 1 + getShardYieldBonusPercent(yieldLevel) / 100;
}

export function getEliteBreakerDamageBonusPercent(level: number, anchorMultiplier = 1): number {
  if (level <= 0) return 0;
  const index = Math.min(level, ELITE_BREAKER_DAMAGE_PERCENT_BY_LEVEL.length) - 1;
  return ELITE_BREAKER_DAMAGE_PERCENT_BY_LEVEL[index] * anchorMultiplier;
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

export function resolvePurgeHitDamage(
  basePurgeHitDamage: number,
  enemyClass: EnemyClass,
  eliteBreakerLevel: number,
  anchorMultiplier = 1,
): number {
  if (enemyClass !== 'elite' || eliteBreakerLevel <= 0) return basePurgeHitDamage;
  const bonusPercent = getEliteBreakerDamageBonusPercent(eliteBreakerLevel, anchorMultiplier);
  return Math.round(basePurgeHitDamage * (1 + bonusPercent / 100));
}

export function computeRunConfig(
  upgrades: UpgradeLevels,
  coreProtocols: CoreProtocolLevels = {
    residualMemory: 0,
    bootReinforcement: 0,
    thermalBaseline: 0,
    extractionProtocol: 0,
    seedResonance: 0,
  },
  anchoredNodes: AnchoredNodes = NO_ANCHORED_NODES,
  recompileDepth = 0,
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
  const shardYieldBonusPercent =
    getShardYieldBonusPercent(upgrades.shardYield) * getAnchorMultiplier(anchoredNodes, 'shardYield');
  const shardSalvageMultiplier =
    SHARD_SALVAGE_YIELD_GROWTH_PER_LEVEL **
    (upgrades.shardSalvage * getAnchorMultiplier(anchoredNodes, 'shardSalvage'));
  const recompileDepthMultiplier = getRecompileDepthMultiplier(recompileDepth);
  const purgeStrikeGrowthMultiplier = PURGE_STRIKE_DAMAGE_GROWTH_PER_LEVEL ** upgrades.purgeStrike;

  return {
    starterNodes: RUN_STAT_BASE.starterNodes,
    baseEnemyHp: RUN_STAT_BASE.baseEnemyHp,
    shardsMultiplier:
      (1 + shardYieldBonusPercent / 100) * shardSalvageMultiplier * extractionBonus * recompileDepthMultiplier,
    // Récupération d'éclats ne donne plus de bonus flat — voir shardsMultiplier (rééquilibrage).
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
        )) *
        purgeStrikeGrowthMultiplier *
        bootReinforcementMultiplier *
        recompileDepthMultiplier,
    ),
    purgeIntervalMs: subtractPerLevel(
      RUN_STAT_BASE.basePurgeIntervalMs,
      upgrades.purgeCadence,
      PURGE_CADENCE_INTERVAL_MS_PER_LEVEL * getAnchorMultiplier(anchoredNodes, 'purgeCadence'),
      MIN_PURGE_INTERVAL_MS,
    ),
    criticalChance: BASE_CRITICAL_CHANCE,
    criticalMultiplier: BASE_CRITICAL_MULTIPLIER,
  };
}

export function computeBreachCap(
  upgrades: UpgradeLevels,
  anchoredNodes: AnchoredNodes = NO_ANCHORED_NODES,
): number {
  const anchorMultiplier = getAnchorMultiplier(anchoredNodes, 'meltdownThreshold');
  return Math.round(
    BASE_BREACH_CAP *
      MELTDOWN_THRESHOLD_CAP_GROWTH_PER_LEVEL ** (upgrades.meltdownThreshold * anchorMultiplier),
  );
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
