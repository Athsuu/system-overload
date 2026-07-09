import type { UpgradeLevels } from '../store/upgradeCatalog';
import type { EnemyClass } from './enemyClass';
import { getCycleEnemyHpMult, getCyclePressureMult, getScalingWaveIndex } from './cycleScaling';
import { useGameStore } from '../store/useGameStore';
import {
  computeBreachCap,
  computeKillBreachRelief,
  computeRunConfig,
  type RunConfig,
} from './moduleEffects';
import {
  getWaveHpMultiplier,
  getWaveLeakPenalty,
  getWaveShardReward,
  getWaveSpeedMultiplier,
} from './waveScaling';

export {
  BASE_BREACH_CAP,
  RUN_STAT_BASE,
  MODULE_ADDITION_PIPELINE,
  MODULE_EFFECT_REGISTRY,
  computePurgeAoeProfile,
  getEliteBreakerDamageBonusPercent,
  getPurgeReachBonusPercent,
  getPurgeSplashDamagePercent,
  getPurgeSplashRadius,
  getPurgeSplashRadiusBonusPercent,
  getShardYieldBonusPercent,
  getShardYieldMultiplier,
  resolvePurgeSplashDamage,
  resolvePurgeHitDamage,
  type PurgeAoeProfile,
  type RunConfig,
  type ModuleEffectRegistryEntry,
  type ModuleEffectTarget,
} from './moduleEffects';

export function getBreachCap(upgrades: UpgradeLevels): number {
  return computeBreachCap(upgrades);
}

/** Overload affiché en % (0–100+), relatif au cap Meltdown du run. */
export function getBreachPercent(breachProgress: number, upgrades: UpgradeLevels): number {
  const breachCap = getBreachCap(upgrades);
  return breachCap > 0 ? (breachProgress / breachCap) * 100 : 0;
}

/** Aligné sur le HUD (arrondi à l'entier) pour éviter un blocage visuel à 100 % sans Meltdown. */
export function isMeltdownReached(breachProgress: number, upgrades: UpgradeLevels): boolean {
  if (breachProgress <= 0) return false;
  const breachCap = getBreachCap(upgrades);
  if (breachCap <= 0) return false;
  if (breachProgress >= breachCap - 1e-6) return true;
  return Math.round(getBreachPercent(breachProgress, upgrades)) >= 100;
}

export function getRunTimeScale(_upgrades: UpgradeLevels, _fluxDriveEnabled: boolean): number {
  return 1;
}

export function getRunConfig(upgrades: UpgradeLevels): RunConfig {
  return computeRunConfig(upgrades);
}

export function resolveActiveCycle(): number {
  return useGameStore.getState().activeCycle || 1;
}

export function resolveScalingWaveIndex(localWaveIndex: number): number {
  return getScalingWaveIndex(resolveActiveCycle(), localWaveIndex);
}

export function getEffectivePassiveHeatPerSec(config: RunConfig): number {
  return config.passiveHeatPerSec * getCyclePressureMult(resolveActiveCycle());
}

export function getEnemyMaxHp(
  config: RunConfig,
  localWaveIndex: number,
  enemyClass: EnemyClass = 'normal',
): number {
  const cycle = resolveActiveCycle();
  const scalingIndex = getScalingWaveIndex(cycle, localWaveIndex);
  const hp =
    config.baseEnemyHp *
    getWaveHpMultiplier(scalingIndex, enemyClass) *
    getCycleEnemyHpMult(cycle);
  return Math.round(hp);
}

export function getEnemySpeed(
  config: RunConfig,
  localWaveIndex: number,
  enemyClass: EnemyClass = 'normal',
): number {
  const scalingIndex = resolveScalingWaveIndex(localWaveIndex);
  const speed = config.baseEnemySpeed * getWaveSpeedMultiplier(scalingIndex, enemyClass);
  return Math.min(config.maxEnemySpeed, speed);
}

export function getShardReward(
  config: RunConfig,
  localWaveIndex: number,
  enemyClass: EnemyClass = 'normal',
): number {
  const scalingIndex = resolveScalingWaveIndex(localWaveIndex);
  const base = getWaveShardReward(scalingIndex, enemyClass);
  return Math.floor(base * config.shardsMultiplier) + config.killBonusShards;
}

export function getLeakProgressPenalty(_config: RunConfig, localWaveIndex: number): number {
  const cycle = resolveActiveCycle();
  const scalingIndex = getScalingWaveIndex(cycle, localWaveIndex);
  return Math.round(getWaveLeakPenalty(scalingIndex) * getCyclePressureMult(cycle));
}

export function getKillBreachRelief(upgrades: UpgradeLevels, _waveIndex: number): number {
  return computeKillBreachRelief(upgrades);
}

export function getSpawnIntervalMs(baseIntervalMs: number, config: RunConfig): number {
  if (baseIntervalMs <= 0) return baseIntervalMs;
  return Math.floor(baseIntervalMs * config.spawnIntervalMult);
}

export function getWaveMaxAlive(baseMaxAlive: number, config: RunConfig): number {
  return Math.max(1, baseMaxAlive - config.maxAliveReduction);
}

const MIN_SPAWN_INTERVAL_MS = 200;

export function getCycleSpawnQuota(baseCount: number): number {
  return Math.max(1, Math.ceil(baseCount * getCyclePressureMult(resolveActiveCycle())));
}

export function getCycleSpawnIntervalMs(baseIntervalMs: number, config: RunConfig): number {
  const intervalMs = getSpawnIntervalMs(baseIntervalMs, config);
  if (intervalMs <= 0) return intervalMs;
  const cycleInterval = Math.floor(intervalMs / getCyclePressureMult(resolveActiveCycle()));
  return Math.max(MIN_SPAWN_INTERVAL_MS, cycleInterval);
}

export function getCycleWaveMaxAlive(baseMaxAlive: number, config: RunConfig): number {
  const maxAlive = getWaveMaxAlive(baseMaxAlive, config);
  return Math.max(1, Math.ceil(maxAlive * getCyclePressureMult(resolveActiveCycle())));
}
