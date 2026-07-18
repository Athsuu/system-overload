import type { CoreProtocolLevels } from '../store/prestigeTypes';
import { isFluxDriveUnlocked } from '../store/prestigeUnlocks';
import {
  HIT_HEAT_PER_MAX_HP,
  LEAK_ARMOR_SOFTEN,
  FLUX_DRIVE_TIME_SCALE,
  FLUX_DRIVE_TIME_SCALE_ANCHORED,
  type AnchoredNodes,
  type UpgradeLevels,
} from '../store/upgradeCatalog';
import {
  applyDevRunConfigOverrides,
  getDevRunConfigOverrides,
} from '../dev/devRunConfigOverrides';
import { getAnchorMultiplier, isNodeAnchorActive } from './anchorSupercharge';
import { getCycleHeatGrowthMult, getShardsPerKillForCycle } from './cycleScaling';
import { useGameStore } from '../store/useGameStore';
import {
  computeBreachCap,
  computeKillBreachRelief,
  computeRunConfig,
  getLeakArmor,
  RUN_STAT_BASE,
  type RunConfig,
} from './moduleEffects';
import { getEnemyHpForCycle, getEnemySpeedForCycle } from './enemyScaling';
import { clampCycleIndex } from '../store/cycleTypes';

export {
  BASE_BREACH_CAP,
  RUN_STAT_BASE,
  MODULE_ADDITION_PIPELINE,
  MODULE_EFFECT_REGISTRY,
  computePurgeAoeProfile,
  getLeakArmor,
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

/** Brut riposte trash du cycle (UI / balance) — trash = maxHp de référence. */
export function getRawHitHeatForCycle(cycle: number): number {
  const safeCycle = clampCycleIndex(cycle);
  return getRawHitHeatForEnemy(getTrashReferenceHp(safeCycle), safeCycle);
}

/** PV trash du cycle (référence — trash = facteur 1 si maxHp identique). */
function getTrashReferenceHp(cycle: number): number {
  const state = useGameStore.getState();
  const config = getRunConfig(state.upgrades);
  return getEnemyMaxHp(config, false, cycle);
}

/** Brut riposte thermique = PV max × fraction (boss inclus via ses PV). */
export function getRawHitHeatForEnemy(maxHp: number, _cycle?: number): number {
  return Math.max(0, maxHp) * HIT_HEAT_PER_MAX_HP;
}

export interface HitHeatTarget {
  maxHp: number;
  cycle: number;
}

/**
 * Applique le Blindage au brut hit heat.
 * Mitigation proportionnelle : net = brut × (SOFTEN / (SOFTEN + blindage)).
 * Remplace l’ancienne soustraction plate `max(0, brut − blindage)` qui annulait la chaleur
 * dès que blindage ≥ brut (ex. L2=6 vs C4≈2,8).
 */
export function applyHitHeatArmor(rawHeat: number, armor: number): number {
  if (rawHeat <= 0) return 0;
  if (armor <= 0) return rawHeat;
  return rawHeat * (LEAK_ARMOR_SOFTEN / (LEAK_ARMOR_SOFTEN + armor));
}

/**
 * Riposte Surcharge d’un hit (après Blindage).
 * Chaque ennemi touché riposte selon ses PV max (trash cycle = référence).
 */
export function getHitHeatPenalty(target?: HitHeatTarget): number {
  const state = useGameStore.getState();
  const cycle = target?.cycle ?? resolveActiveCycle();
  const safeCycle = clampCycleIndex(cycle);
  const maxHp = target?.maxHp ?? getTrashReferenceHp(safeCycle);
  const raw = getRawHitHeatForEnemy(maxHp, safeCycle);
  const armor = getLeakArmor(
    state.upgrades.leakSealing,
    getAnchorMultiplier(state.anchoredNodes, 'leakSealing'),
  );
  return applyHitHeatArmor(raw, armor);
}
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
  coreProtocols: CoreProtocolLevels,
  fluxDriveEnabled: boolean,
  anchoredNodes: AnchoredNodes = {},
): number {
  if (!isFluxDriveUnlocked(coreProtocols) || !fluxDriveEnabled) return 1;
  return isNodeAnchorActive(anchoredNodes, 'fluxDrive')
    ? FLUX_DRIVE_TIME_SCALE_ANCHORED
    : FLUX_DRIVE_TIME_SCALE;
}

/** Cache partagé — invalidé dès qu’upgrades / protocoles / ancrages / overrides labo changent. */
let runConfigCache: {
  upgrades: UpgradeLevels;
  coreProtocols: ReturnType<typeof useGameStore.getState>['coreProtocols'];
  anchoredNodes: AnchoredNodes;
  overrides: ReturnType<typeof getDevRunConfigOverrides>;
  config: RunConfig;
} | null = null;

export function getRunConfig(upgrades: UpgradeLevels): RunConfig {
  const state = useGameStore.getState();
  const overrides = getDevRunConfigOverrides();
  if (
    runConfigCache &&
    runConfigCache.upgrades === upgrades &&
    runConfigCache.coreProtocols === state.coreProtocols &&
    runConfigCache.anchoredNodes === state.anchoredNodes &&
    runConfigCache.overrides === overrides
  ) {
    return runConfigCache.config;
  }

  const config = applyDevRunConfigOverrides(
    computeRunConfig(upgrades, state.coreProtocols, state.anchoredNodes),
  );
  runConfigCache = {
    upgrades,
    coreProtocols: state.coreProtocols,
    anchoredNodes: state.anchoredNodes,
    overrides,
    config,
  };
  return config;
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

export function getEffectivePassiveHeatPerSec(config: RunConfig, cycle?: number): number {
  return config.passiveHeatPerSec * getCycleHeatGrowthMult(cycle ?? resolveRelevantCycle());
}

export function getEnemyMaxHp(
  config: RunConfig,
  isBossEncounter = false,
  cycle?: number,
): number {
  const scaledHp = getEnemyHpForCycle(cycle ?? resolveActiveCycle(), isBossEncounter);
  const baseRatio = config.baseEnemyHp / RUN_STAT_BASE.baseEnemyHp;
  return Math.max(1, Math.round(scaledHp * baseRatio));
}

export function getEnemySpeed(config: RunConfig, cycle?: number): number {
  const scaledSpeed = getEnemySpeedForCycle(cycle ?? resolveActiveCycle());
  const baseRatio = config.baseEnemySpeed / RUN_STAT_BASE.baseEnemySpeed;
  return Math.min(config.maxEnemySpeed, scaledSpeed * baseRatio);
}

/** Espérance d’éclats / kill (UI, balance) — sans tirage. */
export function getExpectedShardReward(config: RunConfig, cycle?: number): number {
  const base = getShardsPerKillForCycle(cycle ?? resolveRelevantCycle());
  return base * config.shardsMultiplier + config.killBonusShards;
}

/**
 * Drop réel / kill : la partie entière est garantie, la fraction = chance d’un éclat en plus.
 */
export function getShardReward(config: RunConfig, cycle?: number): number {
  const base = getShardsPerKillForCycle(cycle ?? resolveRelevantCycle());
  const expected = base * config.shardsMultiplier;
  const guaranteed = Math.floor(expected);
  const fractionalChance = expected - guaranteed;
  const rolled = guaranteed + (fractionalChance > 0 && Math.random() < fractionalChance ? 1 : 0);
  return rolled + config.killBonusShards;
}

export function getKillBreachRelief(upgrades: UpgradeLevels): number {
  return computeKillBreachRelief(upgrades, useGameStore.getState().anchoredNodes);
}
