import type { RunDraftLevels } from '../store/runDraftCatalog';
import type { UpgradeLevels } from '../store/upgradeCatalog';

export function getBreachCap(upgrades: UpgradeLevels): number {
  return 100 + upgrades.criticalThreshold * 10;
}

export interface RunConfig {
  maxNodes: number;
  nodeSpawnIntervalMs: number;
  spawnIntervalMs: number;
  minSpawnIntervalMs: number;
  spawnAccelRate: number;
  starterNodes: number;
  hitRadiusBonus: number;
  particleDamage: number;
  homingStrength: number;
  baseEnemyHp: number;
  hpScalePerSecond: number;
  enemyHpReduction: number;
  shardsPerTier: readonly [number, number, number];
  shardsMultiplier: number;
  baseEnemySpeed: number;
  enemySpeedScale: number;
  maxEnemySpeed: number;
  passiveHeatPerSec: number;
  leakProgressPenalty: number;
  leakProgressTierBonus: number;
  missProgressPenalty: number;
  breachCap: number;
  xpMultiplier: number;
  multishotCount: number;
  pierceCount: number;
  overclockDurationBonusMs: number;
  overclockCooldownReductionMs: number;
  playerSpeed: number;
  acquisitionRange: number;
}

const BASE_RUN_CONFIG = {
  maxNodes: 3,
  nodeSpawnIntervalMs: 4500,
  spawnIntervalMs: 1100,
  minSpawnIntervalMs: 180,
  spawnAccelRate: 5,
  starterNodes: 0,
  particleDamage: 1,
  homingStrength: 0,
  baseEnemyHp: 4,
  hpScalePerSecond: 0.15,
  shardsPerTier: [5, 10, 18] as const,
  baseEnemySpeed: 38.64,
  enemySpeedScale: 0.552,
  maxEnemySpeed: 75.9,
  basePassiveHeatPerSec: 0.8,
  baseLeakProgressPenalty: 10,
  leakProgressTierBonus: 3,
  baseMissProgressPenalty: 2,
  basePlayerSpeed: 180,
  baseAcquisitionRange: 600,
};

export function getEnemyTier(waveIndex: number): number {
  if (waveIndex <= 2) return 0;
  if (waveIndex <= 4) return 1;
  return 2;
}

export function getRunConfig(
  upgrades: UpgradeLevels,
  runDraftLevels: RunDraftLevels = {},
): RunConfig {
  const leakReduction = upgrades.heatShield * 2 + (runDraftLevels.heatShieldRun ?? 0) * 1;
  const missReduction = upgrades.heatShield;
  const passiveReduction =
    upgrades.coolingPower * 0.15 + (runDraftLevels.heatReduction ?? 0) * 0.12;

  const damageDraftMult = 1 + (runDraftLevels.damageBoost ?? 0) * 0.2;
  const fireRateDraftMult = 0.85 ** (runDraftLevels.fireRateBoost ?? 0);

  return {
    maxNodes: BASE_RUN_CONFIG.maxNodes + upgrades.nodeCapacity * 2,
    nodeSpawnIntervalMs: Math.max(
      1200,
      BASE_RUN_CONFIG.nodeSpawnIntervalMs * 0.88 ** upgrades.nodeSpawnRate,
    ),
    spawnIntervalMs:
      BASE_RUN_CONFIG.spawnIntervalMs *
      0.92 ** upgrades.fireRate *
      0.96 ** upgrades.rapidCycle *
      fireRateDraftMult,
    minSpawnIntervalMs: BASE_RUN_CONFIG.minSpawnIntervalMs,
    spawnAccelRate: Math.max(2, BASE_RUN_CONFIG.spawnAccelRate - upgrades.accelControl * 2),
    starterNodes: upgrades.starterNodes,
    hitRadiusBonus: upgrades.nodeReach * 3 + (runDraftLevels.hitRadius ?? 0) * 4,
    particleDamage: Math.max(
      1,
      Math.floor(
        (BASE_RUN_CONFIG.particleDamage + upgrades.boltDamage) *
          (1 + upgrades.damageAmp * 0.1) *
          damageDraftMult,
      ),
    ),
    homingStrength:
      BASE_RUN_CONFIG.homingStrength * (1 + (runDraftLevels.homingBoost ?? 0) * 0.4),
    baseEnemyHp: BASE_RUN_CONFIG.baseEnemyHp,
    hpScalePerSecond: BASE_RUN_CONFIG.hpScalePerSecond,
    enemyHpReduction: upgrades.nodeSpawnRate * 0.08,
    shardsPerTier: BASE_RUN_CONFIG.shardsPerTier,
    shardsMultiplier: 1 + (runDraftLevels.shardsBoost ?? 0) * 0.3,
    baseEnemySpeed: BASE_RUN_CONFIG.baseEnemySpeed,
    enemySpeedScale: BASE_RUN_CONFIG.enemySpeedScale,
    maxEnemySpeed: BASE_RUN_CONFIG.maxEnemySpeed,
    passiveHeatPerSec: Math.max(0.2, BASE_RUN_CONFIG.basePassiveHeatPerSec - passiveReduction),
    leakProgressPenalty: Math.max(3, BASE_RUN_CONFIG.baseLeakProgressPenalty - leakReduction),
    leakProgressTierBonus: BASE_RUN_CONFIG.leakProgressTierBonus,
    missProgressPenalty: Math.max(
      0,
      BASE_RUN_CONFIG.baseMissProgressPenalty - missReduction - upgrades.emissionDampener,
    ),
    breachCap: getBreachCap(upgrades),
    xpMultiplier: 1 + (runDraftLevels.xpMagnet ?? 0) * 0.25,
    multishotCount: 1 + (runDraftLevels.multishot ?? 0),
    pierceCount: 1 + (runDraftLevels.pierce ?? 0),
    overclockDurationBonusMs: (runDraftLevels.overclockDuration ?? 0) * 1000,
    overclockCooldownReductionMs:
      (runDraftLevels.overclockCooldown ?? 0) * 2000 + upgrades.fluxThrottle * 500,
    playerSpeed: BASE_RUN_CONFIG.basePlayerSpeed,
    acquisitionRange:
      BASE_RUN_CONFIG.baseAcquisitionRange * (1 + upgrades.autoAim * 0.15),
  };
}

export function getSpawnInterval(elapsedSeconds: number, config: RunConfig): number {
  return Math.max(
    config.minSpawnIntervalMs,
    config.spawnIntervalMs - elapsedSeconds * config.spawnAccelRate,
  );
}

export function getEnemyMaxHp(
  config: RunConfig,
  tier: number,
  waveIndex: number,
  bossHpMult = 1,
): number {
  const tierMultiplier = 1 + tier * 0.5;
  const waveScale = 1 + (waveIndex - 1) * 0.12;
  const hpReduction = 1 - Math.min(0.4, config.enemyHpReduction);
  return Math.ceil(
    (config.baseEnemyHp + waveIndex * config.hpScalePerSecond * 4) *
      tierMultiplier *
      waveScale *
      hpReduction *
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
  return Math.floor(base * config.shardsMultiplier);
}

export function getLeakProgressPenalty(config: RunConfig, tier: number): number {
  return config.leakProgressPenalty + tier * config.leakProgressTierBonus;
}
