import {
  computePurgeAoeProfile,
  getBreachCap,
  getKillBreachRelief,
  getRunConfig,
  getShardReward,
  resolvePurgeSplashDamage,
} from '../game/runConfig';
import { getShardYieldBonusPercent } from '../game/moduleEffects';
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

  if (upgrades.shardYield > 0) {
    lines.push({
      id: 'shardYield',
      label: labels.shardYieldBonus,
      value: `+${getShardYieldBonusPercent(upgrades.shardYield)}%`,
    });
    lines.push({
      id: 'shardPayoutExample',
      label: labels.shardBonusPerKill,
      value: String(getShardReward(config, 5, 'normal')),
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
    lines.push({
      id: 'breachReliefPerKill',
      label: labels.breachReliefPerKill,
      value: `−${breachRelief.toFixed(1)}%`,
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
