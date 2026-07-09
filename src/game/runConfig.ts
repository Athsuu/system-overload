import {
  PURGE_STRIKE_DAMAGE_PER_LEVEL,
  PURGE_CADENCE_INTERVAL_MS_PER_LEVEL,
  PURGE_REACH_AOE_PERCENT_PER_LEVEL,
  THREAD_COOLANT_PASSIVE_REDUCTION_PER_LEVEL,
  KILL_BREACH_RELIEF_PER_LEVEL,
  MELTDOWN_THRESHOLD_PERCENT_PER_LEVEL,
  SHARD_SALVAGE_BONUS_PER_LEVEL,
  type UpgradeLevels,
} from '../store/upgradeCatalog';
import { getCycleEnemyHpMult, getCyclePressureMult, getScalingWaveIndex } from './cycleScaling';
import type { EnemyClass } from './enemyClass';
import { useGameStore } from '../store/useGameStore';
import {
  getWaveHpMultiplier,
  getWaveLeakPenalty,
  getWaveShardReward,
  getWaveSpeedMultiplier,
} from './waveScaling';

export const BASE_BREACH_CAP = 100;

export function getBreachCap(upgrades: UpgradeLevels): number {
  return BASE_BREACH_CAP + upgrades.meltdownThreshold * MELTDOWN_THRESHOLD_PERCENT_PER_LEVEL;
}

/** Overload affiché en % (0–100+), relatif au cap Meltdown du run. */
export function getBreachPercent(breachProgress: number, upgrades: UpgradeLevels): number {
  const breachCap = getBreachCap(upgrades);
  return breachCap > 0 ? (breachProgress / breachCap) * 100 : 0;
}

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
}

const BASE_RUN_CONFIG = {
  starterNodes: 0,
  baseEnemyHp: 20,
  baseEnemySpeed: 52.16,
  maxEnemySpeed: 102.47,
  basePassiveHeatPerSec: 2.8,
  baseLeakProgressPenalty: 20,
  basePurgeRadius: 58,
  basePurgeHitDamage: 5,
  basePurgeIntervalMs: 1000,
};

export function getRunTimeScale(_upgrades: UpgradeLevels, _fluxDriveEnabled: boolean): number {
  return 1;
}

export function getRunConfig(upgrades: UpgradeLevels): RunConfig {
  return {
    starterNodes: BASE_RUN_CONFIG.starterNodes,
    baseEnemyHp: BASE_RUN_CONFIG.baseEnemyHp,
    shardsMultiplier: 1,
    killBonusShards: upgrades.shardSalvage * SHARD_SALVAGE_BONUS_PER_LEVEL,
    spawnIntervalMult: 1,
    maxAliveReduction: 0,
    baseEnemySpeed: BASE_RUN_CONFIG.baseEnemySpeed,
    maxEnemySpeed: BASE_RUN_CONFIG.maxEnemySpeed,
    passiveHeatPerSec: Math.max(
      0,
      BASE_RUN_CONFIG.basePassiveHeatPerSec -
        upgrades.threadCoolant * THREAD_COOLANT_PASSIVE_REDUCTION_PER_LEVEL,
    ),
    leakProgressPenalty: BASE_RUN_CONFIG.baseLeakProgressPenalty,
    purgeRadius: Math.round(
      BASE_RUN_CONFIG.basePurgeRadius *
        (1 + upgrades.purgeReach * (PURGE_REACH_AOE_PERCENT_PER_LEVEL / 100)),
    ),
    purgeHitDamage:
      (upgrades.node0Boot >= 1 ? BASE_RUN_CONFIG.basePurgeHitDamage : 0) +
      upgrades.purgeStrike * PURGE_STRIKE_DAMAGE_PER_LEVEL,
    purgeIntervalMs: Math.max(
      0,
      BASE_RUN_CONFIG.basePurgeIntervalMs -
        upgrades.purgeCadence * PURGE_CADENCE_INTERVAL_MS_PER_LEVEL,
    ),
  };
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
  return upgrades.killBreachRelief * KILL_BREACH_RELIEF_PER_LEVEL;
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
