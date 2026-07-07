import type { UpgradeLevels } from '../store/upgradeCatalog';

export function getBreachCap(upgrades: UpgradeLevels): number {
  return 100 * (1 + upgrades.criticalThreshold * 0.1);
}

export interface RunConfig {
  starterNodes: number;
  baseEnemyHp: number;
  hpScalePerSecond: number;
  shardsPerTier: readonly [number, number, number];
  shardsMultiplier: number;
  killBonusShards: number;
  spawnIntervalMult: number;
  maxAliveReduction: number;
  baseEnemySpeed: number;
  enemySpeedScale: number;
  maxEnemySpeed: number;
  passiveHeatPerSec: number;
  leakProgressPenalty: number;
  leakProgressTierBonus: number;
  purgeRadius: number;
  purgeHitDamage: number;
  purgeIntervalMs: number;
}

const BASE_RUN_CONFIG = {
  starterNodes: 0,
  baseEnemyHp: 20,
  hpScalePerSecond: 0.1,
  shardsPerTier: [1, 2, 4] as const,
  baseEnemySpeed: 52.16,
  enemySpeedScale: 0.7452,
  maxEnemySpeed: 102.47,
  basePassiveHeatPerSec: 2.8,
  baseLeakProgressPenalty: 20,
  leakProgressTierBonus: 4,
  basePurgeRadius: 58,
  basePurgeHitDamage: 5,
  basePurgeIntervalMs: 1000,
};

export function getRunTimeScale(upgrades: UpgradeLevels, fluxDriveEnabled: boolean): number {
  return upgrades.fluxDrive > 0 && fluxDriveEnabled ? 2 : 1;
}

export function getRunConfig(upgrades: UpgradeLevels): RunConfig {
  const passiveHeatMult = Math.max(0.1, 1 - upgrades.coolingPower * 0.1);
  const leakImpactMult = Math.max(0.1, 1 - upgrades.heatShield * 0.1);
  const attackSpeedMult = 1 + upgrades.fireRate * 0.1;

  return {
    starterNodes: upgrades.starterNodes,
    baseEnemyHp: BASE_RUN_CONFIG.baseEnemyHp,
    hpScalePerSecond: BASE_RUN_CONFIG.hpScalePerSecond,
    shardsPerTier: BASE_RUN_CONFIG.shardsPerTier,
    shardsMultiplier: 1 + upgrades.shardYield * 0.15,
    killBonusShards: upgrades.killBonus,
    spawnIntervalMult: 1 + upgrades.spawnThrottle * 0.1,
    maxAliveReduction: upgrades.containment,
    baseEnemySpeed: BASE_RUN_CONFIG.baseEnemySpeed,
    enemySpeedScale: BASE_RUN_CONFIG.enemySpeedScale,
    maxEnemySpeed: BASE_RUN_CONFIG.maxEnemySpeed,
    passiveHeatPerSec: Math.max(0.35, BASE_RUN_CONFIG.basePassiveHeatPerSec * passiveHeatMult),
    leakProgressPenalty: Math.max(5, BASE_RUN_CONFIG.baseLeakProgressPenalty * leakImpactMult),
    leakProgressTierBonus: BASE_RUN_CONFIG.leakProgressTierBonus,
    purgeRadius:
      BASE_RUN_CONFIG.basePurgeRadius *
      (1 + upgrades.nodeReach * 0.25) *
      (1 + upgrades.purgeReach * 0.2),
    purgeHitDamage:
      (BASE_RUN_CONFIG.basePurgeHitDamage +
        upgrades.node0Boot +
        upgrades.boltDamage * 5) *
      (1 + upgrades.damageAmp * 0.1),
    purgeIntervalMs: BASE_RUN_CONFIG.basePurgeIntervalMs / attackSpeedMult,
  };
}

export function getEnemyMaxHp(
  config: RunConfig,
  tier: number,
  waveIndex: number,
  bossHpMult = 1,
): number {
  const tierMultiplier = 1 + tier * 0.5;
  const waveScale = 1 + (waveIndex - 1) * 0.12;
  return Math.ceil(
    (config.baseEnemyHp + (waveIndex - 1) * config.hpScalePerSecond * 4) *
      tierMultiplier *
      waveScale *
      bossHpMult,
  );
}

export function getEnemySpeed(
  config: RunConfig,
  tier: number,
  waveIndex: number,
  bossSpeedMult = 1,
): number {
  const tierBonus = 1 + tier * 0.1;
  const speed =
    (config.baseEnemySpeed + waveIndex * config.enemySpeedScale) * tierBonus * bossSpeedMult;
  return Math.min(config.maxEnemySpeed, speed);
}

export function getShardReward(config: RunConfig, tier: number): number {
  const base =
    config.shardsPerTier[Math.min(tier, config.shardsPerTier.length - 1)] ??
    config.shardsPerTier[0];
  return Math.floor(base * config.shardsMultiplier) + config.killBonusShards;
}

export function getLeakProgressPenalty(config: RunConfig, tier: number): number {
  return config.leakProgressPenalty + tier * config.leakProgressTierBonus;
}

export function getKillBreachRelief(upgrades: UpgradeLevels, tier: number): number {
  const level = upgrades.fluxThrottle;
  if (level <= 0) return 0;

  const tierMult = [1, 1.5, 2][Math.min(tier, 2)] ?? 1;
  const relief = level * 0.08 * tierMult;
  return Math.min(1.5, relief);
}

export function getSpawnIntervalMs(baseIntervalMs: number, config: RunConfig): number {
  if (baseIntervalMs <= 0) return baseIntervalMs;
  return Math.floor(baseIntervalMs * config.spawnIntervalMult);
}

export function getWaveMaxAlive(baseMaxAlive: number, config: RunConfig): number {
  return Math.max(1, baseMaxAlive - config.maxAliveReduction);
}
