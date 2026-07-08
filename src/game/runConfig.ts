import type { UpgradeLevels } from '../store/upgradeCatalog';
import {
  PURGE_STRIKE_DAMAGE_PER_LEVEL,
  THREAD_COOLANT_PASSIVE_REDUCTION_PER_LEVEL,
  KILL_BREACH_RELIEF_PER_LEVEL,
} from '../store/upgradeCatalog';
import {
  getWaveHpMultiplier,
  getWaveLeakPenalty,
  getWaveShardReward,
  getWaveSpeedMultiplier,
} from './waveScaling';

export function getBreachCap(_upgrades: UpgradeLevels): number {
  return 100;
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
    killBonusShards: 0,
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
    purgeRadius: BASE_RUN_CONFIG.basePurgeRadius,
    purgeHitDamage:
      (upgrades.node0Boot >= 1 ? BASE_RUN_CONFIG.basePurgeHitDamage : 0) +
      upgrades.purgeStrike * PURGE_STRIKE_DAMAGE_PER_LEVEL,
    purgeIntervalMs: BASE_RUN_CONFIG.basePurgeIntervalMs,
  };
}

export function getEnemyMaxHp(
  config: RunConfig,
  waveIndex: number,
  isBoss = false,
): number {
  return Math.round(config.baseEnemyHp * getWaveHpMultiplier(waveIndex, isBoss));
}

export function getEnemySpeed(
  config: RunConfig,
  waveIndex: number,
  isBoss = false,
): number {
  const speed = config.baseEnemySpeed * getWaveSpeedMultiplier(waveIndex, isBoss);
  return Math.min(config.maxEnemySpeed, speed);
}

export function getShardReward(
  config: RunConfig,
  waveIndex: number,
  isBoss = false,
): number {
  const base = getWaveShardReward(waveIndex, isBoss);
  return Math.floor(base * config.shardsMultiplier) + config.killBonusShards;
}

export function getLeakProgressPenalty(_config: RunConfig, waveIndex: number): number {
  return getWaveLeakPenalty(waveIndex);
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
