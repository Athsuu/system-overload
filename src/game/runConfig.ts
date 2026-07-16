import {
  FLUX_DRIVE_TIME_SCALE,
  FLUX_DRIVE_TIME_SCALE_ANCHORED,
  isFluxDriveUnlocked,
  type AnchoredNodes,
  type UpgradeLevels,
} from '../store/upgradeCatalog';
import { applyDevRunConfigOverrides } from '../dev/devRunConfigOverrides';
import { getAnchorMultiplier, isNodeAnchorActive } from './anchorSupercharge';
import { getCycleHeatGrowthMult, getCyclePressureMult, getShardsPerKillForCycle } from './cycleScaling';
import { useGameStore } from '../store/useGameStore';
import {
  computeBreachCap,
  computeKillBreachRelief,
  computeRunConfig,
  getLeakSealingReductionPercent,
  RUN_STAT_BASE,
  type RunConfig,
} from './moduleEffects';
import {
  getEnemyLevel,
  getEnemyMaxHpForLevel,
  getEnemySpeedForLevel,
} from './enemyScaling';

/** Package A — chaque fuite inflige 20 % du seuil Meltdown actuel. */
export const LEAK_BREACH_PERCENT_OF_CAP = 20;

export {
  BASE_BREACH_CAP,
  RUN_STAT_BASE,
  MODULE_ADDITION_PIPELINE,
  MODULE_EFFECT_REGISTRY,
  computePurgeAoeProfile,
  computeVictoryShardBonus,
  getBreachDissipationPerSec,
  getLeakSealingReductionPercent,
  getPurgeAmplifierDamageFlat,
  getPurgeAmplifierDamageBonusPercent,
  getLatencySlowMultiplier,
  getPurgeReachBonusPercent,
  getPurgeSplashDamagePercent,
  getPurgeSplashRadius,
  getPurgeSplashRadiusBonusPercent,
  resolvePurgeSplashDamage,
  type PurgeAoeProfile,
  type RunConfig,
  type ModuleEffectRegistryEntry,
  type ModuleEffectTarget,
} from './moduleEffects';

export { getEnemyLevel } from './enemyScaling';

export function getBreachCap(upgrades: UpgradeLevels): number {
  return computeBreachCap(upgrades, useGameStore.getState().anchoredNodes);
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

export function getRunTimeScale(
  upgrades: UpgradeLevels,
  fluxDriveEnabled: boolean,
  anchoredNodes: AnchoredNodes = {},
): number {
  if (!isFluxDriveUnlocked(upgrades) || !fluxDriveEnabled) return 1;
  return isNodeAnchorActive(anchoredNodes, 'fluxDrive')
    ? FLUX_DRIVE_TIME_SCALE_ANCHORED
    : FLUX_DRIVE_TIME_SCALE;
}

export function getRunConfig(upgrades: UpgradeLevels): RunConfig {
  const state = useGameStore.getState();
  return applyDevRunConfigOverrides(
    computeRunConfig(upgrades, state.coreProtocols, state.anchoredNodes),
  );
}

export function resolveActiveCycle(): number {
  return useGameStore.getState().activeCycle || 1;
}

/**
 * Cycle pour stats hub / chaleur affichée :
 * en run → cycle actif ; hors run → cycle sélectionné (Start Run).
 */
export function resolveRelevantCycle(): number {
  const state = useGameStore.getState();
  if (state.gameState === 'PLAYING' || state.gameState === 'PAUSED') {
    return state.activeCycle || 1;
  }
  return state.selectedCycle || 1;
}

export function resolveEnemyLevel(localWaveIndex: number, cycle?: number): number {
  return getEnemyLevel(cycle ?? resolveActiveCycle(), localWaveIndex);
}

export function getEffectivePassiveHeatPerSec(config: RunConfig, cycle?: number): number {
  return config.passiveHeatPerSec * getCycleHeatGrowthMult(cycle ?? resolveRelevantCycle());
}

export function getEnemyMaxHp(
  config: RunConfig,
  localWaveIndex: number,
  isBossEncounter = false,
  cycle?: number,
): number {
  const level = resolveEnemyLevel(localWaveIndex, cycle);
  const scaledHp = getEnemyMaxHpForLevel(level, isBossEncounter);
  const baseRatio = config.baseEnemyHp / RUN_STAT_BASE.baseEnemyHp;
  return Math.max(1, Math.round(scaledHp * baseRatio));
}

export function getEnemySpeed(
  config: RunConfig,
  localWaveIndex: number,
  cycle?: number,
): number {
  const level = resolveEnemyLevel(localWaveIndex, cycle);
  const scaledSpeed = getEnemySpeedForLevel(level);
  const baseRatio = config.baseEnemySpeed / RUN_STAT_BASE.baseEnemySpeed;
  return Math.min(config.maxEnemySpeed, scaledSpeed * baseRatio);
}

/** Espérance d’éclats / kill (UI, balance) — sans tirage. */
export function getExpectedShardReward(
  config: RunConfig,
  _localWaveIndex: number,
  cycle?: number,
): number {
  const base = getShardsPerKillForCycle(cycle ?? resolveRelevantCycle());
  return base * config.shardsMultiplier + config.killBonusShards;
}

/**
 * Drop réel / kill : la partie entière est garantie, la fraction = chance d’un éclat en plus.
 * Ex. ×1,39 → 1 garanti + 39 % de chance d’un 2ᵉ (au lieu d’attendre ×2.0 via Math.floor).
 * Base = numéro du cycle (pas le niveau ennemi).
 */
export function getShardReward(
  config: RunConfig,
  _localWaveIndex: number,
  cycle?: number,
): number {
  const base = getShardsPerKillForCycle(cycle ?? resolveRelevantCycle());
  const expected = base * config.shardsMultiplier;
  const guaranteed = Math.floor(expected);
  const fractionalChance = expected - guaranteed;
  const rolled = guaranteed + (fractionalChance > 0 && Math.random() < fractionalChance ? 1 : 0);
  return rolled + config.killBonusShards;
}

export function getLeakProgressPenalty(_config: RunConfig, _localWaveIndex: number): number {
  const state = useGameStore.getState();
  const upgrades = state.upgrades;
  const cap = getBreachCap(upgrades);
  let penalty = Math.round(cap * (LEAK_BREACH_PERCENT_OF_CAP / 100));
  const reductionPercent = getLeakSealingReductionPercent(
    upgrades.leakSealing,
    getAnchorMultiplier(state.anchoredNodes, 'leakSealing'),
  );
  if (reductionPercent <= 0) return penalty;
  return Math.round(penalty * (1 - reductionPercent / 100));
}

export function getKillBreachRelief(upgrades: UpgradeLevels, _waveIndex: number): number {
  return computeKillBreachRelief(upgrades, useGameStore.getState().anchoredNodes);
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
