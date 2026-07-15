import {
  computePurgeAoeProfile,
  getBreachCap,
  getKillBreachRelief,
  getRunConfig,
  getShardReward,
  resolvePurgeSplashDamage,
} from '../game/runConfig';
import {
  computeVictoryShardBonus,
  getBreachDissipationPerSec,
  getLeakSealingReductionPercent,
  getPurgeAmplifierDamageBonusPercent,
} from '../game/moduleEffects';
import { BOSS_VICTORY_SHARD_BONUS, SHARD_SALVAGE_YIELD_GROWTH_PER_LEVEL } from '../store/upgradeCatalog';
import { getGameStrings } from '../i18n';
import type { UpgradeLevels } from '../store/upgradeCatalog';

export interface PlayerStatLine {
  id: string;
  label: string;
  value: string;
}

/** Stats toujours visibles — valeurs de base Node-0 (même sans module tree). */
function getBasePlayerStatLines(
  upgrades: UpgradeLevels,
  labels: ReturnType<typeof getGameStrings>['tooltipStats'],
  playerLabels: ReturnType<typeof getGameStrings>['playerStats'],
): PlayerStatLine[] {
  const config = getRunConfig(upgrades);
  const aoe = computePurgeAoeProfile(upgrades);
  const attacksPerSec =
    config.purgeIntervalMs > 0 ? 1000 / config.purgeIntervalMs : 0;

  return [
    {
      id: 'purgeHitDamage',
      label: labels.purgeHitDamage,
      value: String(config.purgeHitDamage),
    },
    {
      id: 'purgeCadence',
      label: labels.purgeCadence,
      value: `${attacksPerSec.toFixed(1)}${playerLabels.cadenceUnit}`,
    },
    {
      id: 'purgeReach',
      label: labels.purgeReach,
      value: String(aoe.mainRadius),
    },
    {
      id: 'passiveBreachPerSec',
      label: labels.passiveBreachPerSec,
      value: config.passiveHeatPerSec.toFixed(2),
    },
    {
      id: 'meltdownThreshold',
      label: labels.meltdownThreshold,
      value: `${getBreachCap(upgrades)}%`,
    },
  ];
}

/** Stats révélées seulement quand le module lié est acheté (≥ 1 rang). */
function getUnlockedPlayerStatLines(
  upgrades: UpgradeLevels,
  labels: ReturnType<typeof getGameStrings>['tooltipStats'],
  playerLabels: ReturnType<typeof getGameStrings>['playerStats'],
): PlayerStatLine[] {
  const config = getRunConfig(upgrades);
  const aoe = computePurgeAoeProfile(upgrades);
  const lines: PlayerStatLine[] = [];

  if (upgrades.shardSalvage > 0) {
    const bonusPercent = Math.round((SHARD_SALVAGE_YIELD_GROWTH_PER_LEVEL ** upgrades.shardSalvage - 1) * 100);
    lines.push({
      id: 'shardSalvage',
      label: labels.shardYieldBonus,
      value: `+${bonusPercent}%`,
    });
    lines.push({
      id: 'shardPayoutExample',
      label: labels.shardBonusPerKill,
      value: String(getShardReward(config, 5)),
    });
  }

  if (upgrades.victoryShardBonus > 0) {
    lines.push({
      id: 'victoryShardBonus',
      label: labels.victoryShardTotal,
      value: String(BOSS_VICTORY_SHARD_BONUS + computeVictoryShardBonus(upgrades)),
    });
  }

  if (upgrades.purgeSplash > 0) {
    lines.push(
      {
        id: 'purgeSplashRadius',
        label: playerLabels.purgeSplashZone,
        value: String(aoe.splashRadius),
      },
      {
        id: 'purgeSplashDamage',
        label: labels.purgeSplashDamage,
        value: String(
          resolvePurgeSplashDamage(config.purgeHitDamage, upgrades.purgeSplash),
        ),
      },
    );
  }

  if (upgrades.killBreachRelief > 0) {
    const breachRelief = getKillBreachRelief(upgrades, 1);
    const reliefLabel = breachRelief.toFixed(2).replace(/\.?0+$/, '');
    lines.push({
      id: 'breachReliefPerKill',
      label: labels.breachReliefPerKill,
      value: `−${reliefLabel}%`,
    });
  }

  if (upgrades.latencyInjection > 0) {
    lines.push({
      id: 'latencySlow',
      label: labels.latencySlowBonus,
      value: `-${upgrades.latencyInjection * 10}%`,
    });
  }

  if (upgrades.breachDissipation > 0) {
    lines.push({
      id: 'breachDissipation',
      label: labels.breachDissipationPerSec,
      value: `−${getBreachDissipationPerSec(upgrades.breachDissipation).toFixed(2)}`,
    });
  }

  if (upgrades.leakSealing > 0) {
    lines.push({
      id: 'leakSealing',
      label: labels.leakSealingReduction,
      value: `−${getLeakSealingReductionPercent(upgrades.leakSealing)}%`,
    });
  }

  if (upgrades.purgeAmplifier > 0) {
    lines.push({
      id: 'purgeAmplifier',
      label: labels.purgeAmplifierBonus,
      value: `+${getPurgeAmplifierDamageBonusPercent(upgrades.purgeAmplifier)}%`,
    });
  }

  return lines;
}

export function getPlayerStatSheet(upgrades: UpgradeLevels): PlayerStatLine[] {
  const labels = getGameStrings().tooltipStats;
  const playerLabels = getGameStrings().playerStats;

  const baseLines = getBasePlayerStatLines(upgrades, labels, playerLabels);
  const unlockedLines = getUnlockedPlayerStatLines(upgrades, labels, playerLabels);

  const meltdownLine = baseLines.find((line) => line.id === 'meltdownThreshold');
  const baseWithoutMeltdown = baseLines.filter((line) => line.id !== 'meltdownThreshold');

  return [
    ...baseWithoutMeltdown,
    ...unlockedLines,
    ...(meltdownLine ? [meltdownLine] : []),
  ];
}
