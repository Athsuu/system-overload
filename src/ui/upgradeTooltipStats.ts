import {
  BASE_BREACH_CAP,
  getBreachCap,
  getKillBreachRelief,
  getRunConfig,
} from '../game/runConfig';
import {
  BOSS_VICTORY_SHARD_BONUS,
  FLUX_DRIVE_TIME_SCALE,
  getUpgradeDefinition,
  MELTDOWN_THRESHOLD_CAP_GROWTH_PER_LEVEL,
  PURGE_CADENCE_PERCENT_PER_LEVEL,
  PURGE_STRIKE_DAMAGE_PER_LEVEL,
  THREAD_COOLANT_PASSIVE_REDUCTION_PER_LEVEL,
  SHARD_SALVAGE_YIELD_GROWTH_PER_LEVEL,
  VICTORY_SHARD_BONUS_FLAT_BY_LEVEL,
  type UpgradeId,
  type UpgradeLevels,
} from '../store/upgradeCatalog';
import { getOverclockCooldownMs, getOverclockDurationMs } from '../game/overclock';
import {
  computeVictoryShardBonus,
  getBreachDissipationPerSec,
  getLeakSealingReductionPercent,
  getPurgeAmplifierDamageBonusPercent,
  getPurgeReachBonusPercent,
  getPurgeSplashDamagePercent,
  getPurgeSplashRadiusBonusPercent,
  resolvePurgeSplashDamage,
} from '../game/moduleEffects';
import { getEnemyLevel, getLeakPenaltyForLevel } from '../game/enemyScaling';
import { useGameStore } from '../store/useGameStore';
import { getLootPickupRadii, getShardMagnetMagnetRadius } from '../game/loot';
import { getGameStrings } from '../i18n';

export interface TooltipStatLine {
  label: string;
  current: string;
  next: string | null;
}

function withLevel(upgrades: UpgradeLevels, id: UpgradeId, level: number): UpgradeLevels {
  return { ...upgrades, [id]: level };
}

function line(
  label: string,
  current: string,
  nextLevel: number | null,
  next: string | null,
): TooltipStatLine {
  return { label, current, next: nextLevel !== null ? next : null };
}

function formatBreachReliefPercent(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, '');
}

function previewLeakPenalty(upgrades: UpgradeLevels, localWave: number): number {
  const cap = getBreachCap(upgrades);
  const cycle = useGameStore.getState().selectedCycle;
  const level = getEnemyLevel(cycle, localWave);
  const base = getLeakPenaltyForLevel(level, cap);
  const reduction = getLeakSealingReductionPercent(upgrades.leakSealing);
  if (reduction <= 0) return base;
  return Math.round(base * (1 - reduction / 100));
}

export function getUpgradeTooltipLines(id: UpgradeId, upgrades: UpgradeLevels): TooltipStatLine[] {
  const labels = getGameStrings().tooltipStats;
  const definition = getUpgradeDefinition(id);
  const level = upgrades[id];
  const nextLevel = level + 1 < definition.maxLevel ? level + 1 : null;
  const cur = upgrades;
  const nxt = nextLevel !== null ? withLevel(upgrades, id, nextLevel) : null;

  if (id === 'node0Boot') {
    const current = String(getRunConfig(cur).purgeHitDamage);
    const next = nxt ? String(getRunConfig(nxt).purgeHitDamage) : null;
    return [line(labels.purgeHitDamage, current, nextLevel, next)];
  }

  if (id === 'shardSalvage') {
    const currentBonus = Math.round((SHARD_SALVAGE_YIELD_GROWTH_PER_LEVEL ** level - 1) * 100);
    const nextBonus =
      nextLevel !== null
        ? Math.round((SHARD_SALVAGE_YIELD_GROWTH_PER_LEVEL ** nextLevel - 1) * 100)
        : null;
    return [
      line(
        labels.shardYieldBonus,
        `+${currentBonus}%`,
        nextLevel,
        nextBonus !== null ? `+${nextBonus}%` : null,
      ),
    ];
  }

  if (id === 'victoryShardBonus') {
    const currentBonus = computeVictoryShardBonus(cur);
    const currentTotal = BOSS_VICTORY_SHARD_BONUS + currentBonus;
    const nextTotal = nxt ? BOSS_VICTORY_SHARD_BONUS + computeVictoryShardBonus(nxt) : null;
    const flatAtLevel =
      level > 0 ? VICTORY_SHARD_BONUS_FLAT_BY_LEVEL[Math.min(level, VICTORY_SHARD_BONUS_FLAT_BY_LEVEL.length) - 1] : 0;
    const nextFlat =
      nextLevel !== null
        ? VICTORY_SHARD_BONUS_FLAT_BY_LEVEL[
            Math.min(nextLevel, VICTORY_SHARD_BONUS_FLAT_BY_LEVEL.length) - 1
          ]
        : null;
    return [
      line(
        labels.victoryShardBonus,
        `+${flatAtLevel}`,
        nextLevel,
        nextFlat !== null ? `+${nextFlat}` : null,
      ),
      line(
        labels.victoryShardTotal,
        String(currentTotal),
        nextLevel,
        nextTotal !== null ? String(nextTotal) : null,
      ),
    ];
  }

  if (id === 'shardMagnet') {
    const currentRadius = getLootPickupRadii(cur, 'hexShard').collectRadius;
    const nextRadius = nxt ? getLootPickupRadii(nxt, 'hexShard').collectRadius : null;
    const currentMagnet = getShardMagnetMagnetRadius(level);
    const nextMagnet = nextLevel !== null ? getShardMagnetMagnetRadius(nextLevel) : null;
    return [
      line(
        labels.shardPickupRadius,
        String(currentRadius),
        nextLevel,
        nextRadius !== null ? String(nextRadius) : null,
      ),
      line(
        labels.shardPickupReachBonus,
        String(currentMagnet),
        nextLevel,
        nextMagnet !== null ? String(nextMagnet) : null,
      ),
    ];
  }

  if (id === 'purgeStrike') {
    const flatBonus = level * PURGE_STRIKE_DAMAGE_PER_LEVEL;
    const nextFlatBonus = nextLevel !== null ? nextLevel * PURGE_STRIKE_DAMAGE_PER_LEVEL : null;
    const total = String(getRunConfig(cur).purgeHitDamage);
    const nextTotal = nxt ? String(getRunConfig(nxt).purgeHitDamage) : null;
    return [
      line(
        labels.purgeDamageBonus,
        `+${flatBonus}`,
        nextLevel,
        nextFlatBonus !== null ? `+${nextFlatBonus}` : null,
      ),
      line(labels.purgeHitDamage, total, nextLevel, nextTotal),
    ];
  }

  if (id === 'purgeCadence') {
    const current = `+${level * PURGE_CADENCE_PERCENT_PER_LEVEL}%`;
    const next =
      nextLevel !== null ? `+${nextLevel * PURGE_CADENCE_PERCENT_PER_LEVEL}%` : null;
    return [line(labels.purgeCadence, current, nextLevel, next)];
  }

  if (id === 'purgeReach') {
    const currentBonus = getPurgeReachBonusPercent(level);
    const nextBonus = nextLevel !== null ? getPurgeReachBonusPercent(nextLevel) : null;
    return [
      line(
        labels.purgeReach,
        `+${currentBonus}%`,
        nextLevel,
        nextBonus !== null ? `+${nextBonus}%` : null,
      ),
    ];
  }

  if (id === 'purgeSplash') {
    const baseDamage = getRunConfig(cur).purgeHitDamage;
    const nextBaseDamage = nxt ? getRunConfig(nxt).purgeHitDamage : baseDamage;
    const currentRadiusBonus = getPurgeSplashRadiusBonusPercent(level);
    const nextRadiusBonus =
      nextLevel !== null ? getPurgeSplashRadiusBonusPercent(nextLevel) : null;
    const currentPercent = getPurgeSplashDamagePercent(level);
    const nextPercent =
      nextLevel !== null ? getPurgeSplashDamagePercent(nextLevel) : null;
    const splashDamage = String(resolvePurgeSplashDamage(baseDamage, level));
    const nextSplashDamage =
      nextLevel !== null
        ? String(resolvePurgeSplashDamage(nextBaseDamage, nextLevel))
        : null;
    return [
      line(
        labels.purgeSplashRadius,
        `+${currentRadiusBonus}%`,
        nextLevel,
        nextRadiusBonus !== null ? `+${nextRadiusBonus}%` : null,
      ),
      line(
        labels.purgeSplashDamage,
        `${splashDamage} (${currentPercent}%)`,
        nextLevel,
        nextSplashDamage !== null && nextPercent !== null
          ? `${nextSplashDamage} (${nextPercent}%)`
          : null,
      ),
    ];
  }

  if (id === 'threadCoolant') {
    const current = getRunConfig(cur).passiveHeatPerSec.toFixed(2);
    const next = nxt ? getRunConfig(nxt).passiveHeatPerSec.toFixed(2) : null;
    const reduction = (level * THREAD_COOLANT_PASSIVE_REDUCTION_PER_LEVEL).toFixed(2);
    const nextReduction =
      nextLevel !== null
        ? (nextLevel * THREAD_COOLANT_PASSIVE_REDUCTION_PER_LEVEL).toFixed(2)
        : null;
    return [
      line(labels.passiveBreachPerSec, current, nextLevel, next),
      line(
        labels.reduction,
        `−${reduction}/s`,
        nextLevel,
        nextReduction !== null ? `−${nextReduction}/s` : null,
      ),
    ];
  }

  if (id === 'killBreachRelief') {
    const current = formatBreachReliefPercent(getKillBreachRelief(cur, 1));
    const next = nxt ? formatBreachReliefPercent(getKillBreachRelief(nxt, 1)) : null;
    return [
      line(
        labels.breachReliefPerKill,
        `−${current}%`,
        nextLevel,
        next !== null ? `−${next}%` : null,
      ),
    ];
  }

  if (id === 'latencyInjection') {
    const current = `-${level * 10}%`;
    const next = nextLevel !== null ? `-${nextLevel * 10}%` : null;
    return [line(labels.latencySlowBonus, current, nextLevel, next)];
  }

  if (id === 'overclock') {
    return [
      line(labels.overclockDuration, `${(getOverclockDurationMs() / 1000).toFixed(0)}s`, null, null),
      line(labels.overclockCooldown, `${(getOverclockCooldownMs() / 1000).toFixed(0)}s`, null, null),
    ];
  }

  if (id === 'fluxDrive') {
    return [line(labels.fluxDriveSpeed, `×${FLUX_DRIVE_TIME_SCALE}`, null, null)];
  }

  if (id === 'breachDissipation') {
    const current = getBreachDissipationPerSec(level);
    const next = nextLevel !== null ? getBreachDissipationPerSec(nextLevel) : null;
    return [
      line(
        labels.breachDissipationPerSec,
        `−${current.toFixed(2)}`,
        nextLevel,
        next !== null ? `−${next.toFixed(2)}` : null,
      ),
    ];
  }

  if (id === 'leakSealing') {
    const exampleWave = 7;
    const currentReduction = getLeakSealingReductionPercent(level);
    const nextReduction =
      nextLevel !== null ? getLeakSealingReductionPercent(nextLevel) : null;
    const currentPenalty = previewLeakPenalty(cur, exampleWave);
    const nextPenalty = nxt !== null ? previewLeakPenalty(nxt, exampleWave) : null;
    return [
      line(
        labels.leakSealingReduction,
        `−${currentReduction}%`,
        nextLevel,
        nextReduction !== null ? `−${nextReduction}%` : null,
      ),
      line(
        labels.leakPenaltyExample,
        String(currentPenalty),
        nextLevel,
        nextPenalty !== null ? String(nextPenalty) : null,
      ),
    ];
  }

  if (id === 'purgeAmplifier') {
    const currentBonus = getPurgeAmplifierDamageBonusPercent(level);
    const nextBonus =
      nextLevel !== null ? getPurgeAmplifierDamageBonusPercent(nextLevel) : null;
    const currentDamage = String(getRunConfig(cur).purgeHitDamage);
    const nextDamage = nxt ? String(getRunConfig(nxt).purgeHitDamage) : null;
    return [
      line(
        labels.purgeAmplifierBonus,
        `+${currentBonus}%`,
        nextLevel,
        nextBonus !== null ? `+${nextBonus}%` : null,
      ),
      line(labels.purgeHitDamage, currentDamage, nextLevel, nextDamage),
    ];
  }

  if (id === 'meltdownThreshold') {
    const currentCap = Math.round(BASE_BREACH_CAP * MELTDOWN_THRESHOLD_CAP_GROWTH_PER_LEVEL ** level);
    const nextCap =
      nextLevel !== null
        ? Math.round(BASE_BREACH_CAP * MELTDOWN_THRESHOLD_CAP_GROWTH_PER_LEVEL ** nextLevel)
        : null;
    return [
      line(
        labels.meltdownThreshold,
        `${currentCap}%`,
        nextLevel,
        nextCap !== null ? `${nextCap}%` : null,
      ),
    ];
  }

  return [];
}

export function getTooltipHeight(lineCount: number): number {
  const base = 168;
  const extra = Math.max(0, lineCount - 1) * 20;
  return base + extra;
}
