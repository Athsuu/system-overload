import {
  getUpgradeDefinition,
  MELTDOWN_THRESHOLD_PERCENT_PER_LEVEL,
  PURGE_CADENCE_PERCENT_PER_LEVEL,
  PURGE_STRIKE_DAMAGE_PER_LEVEL,
  THREAD_COOLANT_PASSIVE_REDUCTION_PER_LEVEL,
  SHARD_SALVAGE_BONUS_PER_LEVEL,
  type UpgradeId,
  type UpgradeLevels,
} from '../store/upgradeCatalog';
import { BASE_BREACH_CAP, getKillBreachRelief, getRunConfig, getShardReward, resolvePurgeHitDamage } from '../game/runConfig';
import {
  getEliteBreakerDamageBonusPercent,
  getPurgeReachBonusPercent,
  getPurgeSplashDamagePercent,
  getPurgeSplashRadiusBonusPercent,
  getShardYieldBonusPercent,
  resolvePurgeSplashDamage,
} from '../game/moduleEffects';
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

export function getUpgradeTooltipLines(id: UpgradeId, upgrades: UpgradeLevels): TooltipStatLine[] {
  const labels = getGameStrings().tooltipStats;
  const definition = getUpgradeDefinition(id);
  const level = upgrades[id];
  const nextLevel = level < definition.maxLevel ? level + 1 : null;
  const cur = upgrades;
  const nxt = nextLevel !== null ? withLevel(upgrades, id, nextLevel) : null;

  if (id === 'node0Boot') {
    const current = String(getRunConfig(cur).purgeHitDamage);
    const next = nxt ? String(getRunConfig(nxt).purgeHitDamage) : null;
    return [line(labels.purgeHitDamage, current, nextLevel, next)];
  }

  if (id === 'shardSalvage') {
    const current = `+${level * SHARD_SALVAGE_BONUS_PER_LEVEL}`;
    const next =
      nextLevel !== null ? `+${nextLevel * SHARD_SALVAGE_BONUS_PER_LEVEL}` : null;
    return [line(labels.shardBonusPerKill, current, nextLevel, next)];
  }

  if (id === 'shardYield') {
    const exampleWave = 5;
    const currentBonus = getShardYieldBonusPercent(level);
    const nextBonus = nextLevel !== null ? getShardYieldBonusPercent(nextLevel) : null;
    const currentPayout = getShardReward(getRunConfig(cur), exampleWave, 'normal');
    const nextPayout =
      nextLevel !== null ? getShardReward(getRunConfig(nxt!), exampleWave, 'normal') : null;
    return [
      line(
        labels.shardYieldBonus,
        `+${currentBonus}%`,
        nextLevel,
        nextBonus !== null ? `+${nextBonus}%` : null,
      ),
      line(
        labels.shardBonusPerKill,
        String(currentPayout),
        nextLevel,
        nextPayout !== null ? String(nextPayout) : null,
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
    const bonus = level * PURGE_STRIKE_DAMAGE_PER_LEVEL;
    const nextBonus = nextLevel !== null ? nextLevel * PURGE_STRIKE_DAMAGE_PER_LEVEL : null;
    const total = String(getRunConfig(cur).purgeHitDamage);
    const nextTotal = nxt ? String(getRunConfig(nxt).purgeHitDamage) : null;
    return [
      line(labels.purgeDamageBonus, `+${bonus}`, nextLevel, nextBonus !== null ? `+${nextBonus}` : null),
      line(labels.purgeHitDamage, total, nextLevel, nextTotal),
    ];
  }

  if (id === 'eliteBreaker') {
    const baseDamage = getRunConfig(cur).purgeHitDamage;
    const nextBaseDamage = nxt ? getRunConfig(nxt).purgeHitDamage : baseDamage;
    const currentBonus = getEliteBreakerDamageBonusPercent(level);
    const nextBonus =
      nextLevel !== null ? getEliteBreakerDamageBonusPercent(nextLevel) : null;
    const eliteDamage = String(resolvePurgeHitDamage(baseDamage, 'elite', level));
    const nextEliteDamage =
      nextLevel !== null
        ? String(resolvePurgeHitDamage(nextBaseDamage, 'elite', nextLevel))
        : null;
    return [
      line(
        labels.elitePurgeDamageBonus,
        `+${currentBonus}%`,
        nextLevel,
        nextBonus !== null ? `+${nextBonus}%` : null,
      ),
      line(labels.elitePurgeHitDamage, eliteDamage, nextLevel, nextEliteDamage),
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
    const current = getKillBreachRelief(cur, 1).toFixed(1);
    const next = nxt ? getKillBreachRelief(nxt, 1).toFixed(1) : null;
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

  if (id === 'meltdownThreshold') {
    const currentCap = BASE_BREACH_CAP + level * MELTDOWN_THRESHOLD_PERCENT_PER_LEVEL;
    const nextCap =
      nextLevel !== null ? BASE_BREACH_CAP + nextLevel * MELTDOWN_THRESHOLD_PERCENT_PER_LEVEL : null;
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
