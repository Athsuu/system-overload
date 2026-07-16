import {
  FLUX_DRIVE_TIME_SCALE,
  getUpgradeDefinition,
  MELTDOWN_THRESHOLD_CAP_PERCENT_PER_LEVEL,
  PURGE_CADENCE_PERCENT_PER_LEVEL,
  PURGE_CRIT_CHANCE_PERCENT_PER_LEVEL,
  PURGE_STRIKE_DAMAGE_PER_LEVEL,
  THREAD_COOLANT_PASSIVE_REDUCTION_PER_LEVEL,
  SHARD_SALVAGE_YIELD_PERCENT_PER_LEVEL,
  VICTORY_SHARD_BONUS_FLAT_BY_LEVEL,
  type UpgradeId,
  type UpgradeLevels,
} from '../../store/upgradeCatalog';
import { getOverclockCooldownMs, getOverclockDurationMs } from '../../game/overclock';
import {
  RUN_STAT_BASE,
  getBreachDissipationPerSec,
  getLeakSealingReductionPercent,
  getPurgeAmplifierDamageFlat,
  getPurgeReachBonusPercent,
  getPurgeSplashDamagePercent,
  getPurgeSplashRadiusBonusPercent,
} from '../../game/moduleEffects';
import { getKillBreachRelief } from '../../game/runConfig';
import { formatHexRadius } from '../../game/purgeHexDisplay';
import {
  getShardMagnetCollectRadius,
  getShardMagnetMagnetRadius,
} from '../../game/loot';
import { getGameStrings } from '../../i18n';

export interface TooltipStatLine {
  label: string;
  current: string;
  /** Valeur au rang suivant ; null si déjà max (ou module sans progression). */
  next: string | null;
}

function withLevel(upgrades: UpgradeLevels, id: UpgradeId, level: number): UpgradeLevels {
  return { ...upgrades, [id]: level };
}

function line(label: string, current: string, next: string | null = null): TooltipStatLine {
  return { label, current, next };
}

function formatBreachReliefPercent(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, '');
}

function formatPercentBonus(value: number): string {
  return `+${value}%`;
}

/**
 * Lignes de stats du tooltip module tree.
 * Règle PO : uniquement le **bonus de ce module** (pas le total base+modules — fiche stats hub).
 * Affiche current → next tant que le rang suivant est achetable (y compris le dernier rang).
 */
export function getUpgradeTooltipLines(id: UpgradeId, upgrades: UpgradeLevels): TooltipStatLine[] {
  const labels = getGameStrings().tooltipStats;
  const definition = getUpgradeDefinition(id);
  const level = upgrades[id];
  const nextLevel = level < definition.maxLevel ? level + 1 : null;
  const cur = upgrades;
  const nxt = nextLevel !== null ? withLevel(upgrades, id, nextLevel) : null;

  if (id === 'node0Boot') {
    const current = level >= 1 ? RUN_STAT_BASE.basePurgeHitDamage : 0;
    const next = nextLevel !== null && nextLevel >= 1 ? RUN_STAT_BASE.basePurgeHitDamage : null;
    return [
      line(labels.purgeHitDamage, String(current), next !== null ? String(next) : null),
    ];
  }

  if (id === 'shardSalvage') {
    return [
      line(
        labels.shardYieldBonus,
        formatPercentBonus(SHARD_SALVAGE_YIELD_PERCENT_PER_LEVEL * level),
        nextLevel !== null
          ? formatPercentBonus(SHARD_SALVAGE_YIELD_PERCENT_PER_LEVEL * nextLevel)
          : null,
      ),
    ];
  }

  if (id === 'victoryShardBonus') {
    const flatAtLevel =
      level > 0
        ? VICTORY_SHARD_BONUS_FLAT_BY_LEVEL[
            Math.min(level, VICTORY_SHARD_BONUS_FLAT_BY_LEVEL.length) - 1
          ]
        : 0;
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
        nextFlat !== null ? `+${nextFlat}` : null,
      ),
    ];
  }

  if (id === 'shardMagnet') {
    return [
      line(
        labels.shardPickupRadius,
        formatHexRadius(getShardMagnetCollectRadius(level)),
        nextLevel !== null ? formatHexRadius(getShardMagnetCollectRadius(nextLevel)) : null,
      ),
      line(
        labels.shardPickupReachBonus,
        formatHexRadius(getShardMagnetMagnetRadius(level)),
        nextLevel !== null ? formatHexRadius(getShardMagnetMagnetRadius(nextLevel)) : null,
      ),
    ];
  }

  if (id === 'purgeStrike') {
    return [
      line(
        labels.purgeDamageBonus,
        `+${level * PURGE_STRIKE_DAMAGE_PER_LEVEL}`,
        nextLevel !== null ? `+${nextLevel * PURGE_STRIKE_DAMAGE_PER_LEVEL}` : null,
      ),
    ];
  }

  if (id === 'purgeCadence') {
    return [
      line(
        labels.purgeCadence,
        formatPercentBonus(level * PURGE_CADENCE_PERCENT_PER_LEVEL),
        nextLevel !== null
          ? formatPercentBonus(nextLevel * PURGE_CADENCE_PERCENT_PER_LEVEL)
          : null,
      ),
    ];
  }

  if (id === 'purgeCrit') {
    const currentBonus = level * PURGE_CRIT_CHANCE_PERCENT_PER_LEVEL;
    const nextBonus =
      nextLevel !== null ? nextLevel * PURGE_CRIT_CHANCE_PERCENT_PER_LEVEL : null;
    return [
      line(
        labels.criticalChanceBonus,
        `+${currentBonus}%`,
        nextBonus !== null ? `+${nextBonus}%` : null,
      ),
    ];
  }

  if (id === 'purgeReach') {
    return [
      line(
        labels.purgeReachBonus,
        formatPercentBonus(getPurgeReachBonusPercent(level)),
        nextLevel !== null ? formatPercentBonus(getPurgeReachBonusPercent(nextLevel)) : null,
      ),
    ];
  }

  if (id === 'purgeSplash') {
    const currentRadiusBonus = getPurgeSplashRadiusBonusPercent(level);
    const nextRadiusBonus =
      nextLevel !== null ? getPurgeSplashRadiusBonusPercent(nextLevel) : null;
    const currentPercent = level > 0 ? getPurgeSplashDamagePercent(level) : 0;
    const nextPercent = nextLevel !== null ? getPurgeSplashDamagePercent(nextLevel) : null;
    return [
      line(
        labels.purgeSplashRadius,
        formatPercentBonus(currentRadiusBonus),
        nextRadiusBonus !== null ? formatPercentBonus(nextRadiusBonus) : null,
      ),
      line(
        labels.purgeSplashDamage,
        `${currentPercent}%`,
        nextPercent !== null ? `${nextPercent}%` : null,
      ),
    ];
  }

  if (id === 'threadCoolant') {
    return [
      line(
        labels.reduction,
        `−${(level * THREAD_COOLANT_PASSIVE_REDUCTION_PER_LEVEL).toFixed(2)}/s`,
        nextLevel !== null
          ? `−${(nextLevel * THREAD_COOLANT_PASSIVE_REDUCTION_PER_LEVEL).toFixed(2)}/s`
          : null,
      ),
    ];
  }

  if (id === 'killBreachRelief') {
    const current = formatBreachReliefPercent(getKillBreachRelief(cur, 1));
    const next = nxt ? formatBreachReliefPercent(getKillBreachRelief(nxt, 1)) : null;
    return [
      line(labels.breachReliefPerKill, `−${current}%`, next !== null ? `−${next}%` : null),
    ];
  }

  if (id === 'latencyInjection') {
    return [
      line(
        labels.latencySlowBonus,
        `-${level * 10}%`,
        nextLevel !== null ? `-${nextLevel * 10}%` : null,
      ),
    ];
  }

  if (id === 'overclock') {
    return [
      line(labels.overclockDuration, `${(getOverclockDurationMs() / 1000).toFixed(0)}s`),
      line(labels.overclockCooldown, `${(getOverclockCooldownMs() / 1000).toFixed(0)}s`),
    ];
  }

  if (id === 'fluxDrive') {
    return [line(labels.fluxDriveSpeed, `×${FLUX_DRIVE_TIME_SCALE}`)];
  }

  if (id === 'breachDissipation') {
    const current = getBreachDissipationPerSec(level);
    const next = nextLevel !== null ? getBreachDissipationPerSec(nextLevel) : null;
    return [
      line(
        labels.breachDissipationPerSec,
        `−${current.toFixed(2)}`,
        next !== null ? `−${next.toFixed(2)}` : null,
      ),
    ];
  }

  if (id === 'leakSealing') {
    return [
      line(
        labels.leakSealingReduction,
        `−${getLeakSealingReductionPercent(level)}%`,
        nextLevel !== null ? `−${getLeakSealingReductionPercent(nextLevel)}%` : null,
      ),
    ];
  }

  if (id === 'purgeAmplifier') {
    return [
      line(
        labels.purgeAmplifierBonus,
        `+${getPurgeAmplifierDamageFlat(level)}`,
        nextLevel !== null ? `+${getPurgeAmplifierDamageFlat(nextLevel)}` : null,
      ),
    ];
  }

  if (id === 'meltdownThreshold') {
    return [
      line(
        labels.meltdownThreshold,
        formatPercentBonus(MELTDOWN_THRESHOLD_CAP_PERCENT_PER_LEVEL * level),
        nextLevel !== null
          ? formatPercentBonus(MELTDOWN_THRESHOLD_CAP_PERCENT_PER_LEVEL * nextLevel)
          : null,
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
