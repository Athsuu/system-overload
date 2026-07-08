import { getBreachCap, getKillBreachRelief, getRunConfig } from '../game/runConfig';
import { getGameStrings } from '../i18n';
import type { UpgradeLevels } from '../store/upgradeCatalog';

export interface PlayerStatLine {
  id: string;
  label: string;
  value: string;
}

export function getPlayerStatSheet(upgrades: UpgradeLevels): PlayerStatLine[] {
  const config = getRunConfig(upgrades);
  const labels = getGameStrings().tooltipStats;
  const cadenceUnit = getGameStrings().playerStats.cadenceUnit;
  const breachRelief = getKillBreachRelief(upgrades, 1);

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
      value: `${attacksPerSec.toFixed(1)}${cadenceUnit}`,
    },
    {
      id: 'purgeReach',
      label: labels.purgeReach,
      value: `${config.purgeRadius}px`,
    },
    {
      id: 'passiveBreachPerSec',
      label: labels.passiveBreachPerSec,
      value: config.passiveHeatPerSec.toFixed(2),
    },
    {
      id: 'breachReliefPerKill',
      label: labels.breachReliefPerKill,
      value: breachRelief > 0 ? `−${breachRelief.toFixed(1)}%` : '0%',
    },
    {
      id: 'meltdownThreshold',
      label: labels.meltdownThreshold,
      value: `${getBreachCap(upgrades)}%`,
    },
  ];
}
