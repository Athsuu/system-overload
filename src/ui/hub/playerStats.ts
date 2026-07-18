import { formatHexRadius } from '../../game/purgeHexDisplay';
import {
  getBreachCap,
  getEffectivePassiveHeatPerSec,
  getEnemyMaxHp,
  getHitHeatPenalty,
  getKillBreachRelief,
  getRawHitHeatForEnemy,
  getRunConfig,
  getExpectedShardReward,
  resolvePurgeSplashDamage,
  resolveRelevantCycle,
} from '../../game/runConfig';
import {
  computePurgeAoeProfile,
  computeShardSalvageKillBonus,
  getLeakArmor,
  getPurgeAmplifierDamageFlat,
} from '../../game/moduleEffects';
import {
  VICTORY_SHARD_BONUS_SPAWN_PERCENT_PER_LEVEL,
} from '../../store/upgradeCatalog';
import { getGameStrings } from '../../i18n';
import type { UpgradeLevels } from '../../store/upgradeCatalog';

export type PlayerStatTabId = 'damage' | 'overload' | 'economy' | 'misc';

export const PLAYER_STAT_TAB_ORDER: readonly PlayerStatTabId[] = [
  'damage',
  'overload',
  'economy',
  'misc',
] as const;

export interface PlayerStatLine {
  id: string;
  tab: PlayerStatTabId;
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
      tab: 'damage',
      label: labels.purgeHitDamage,
      value: String(config.purgeHitDamage),
    },
    {
      id: 'purgeCadence',
      tab: 'damage',
      label: labels.purgeCadence,
      value: `${attacksPerSec.toFixed(1)}${playerLabels.cadenceUnit}`,
    },
    {
      id: 'criticalChance',
      tab: 'damage',
      label: labels.criticalChance,
      value: `${Math.round(config.criticalChance * 100)}%`,
    },
    {
      id: 'purgeReach',
      tab: 'damage',
      label: labels.purgeReach,
      value: formatHexRadius(aoe.mainRadius),
    },
    {
      id: 'passiveBreachPerSec',
      tab: 'overload',
      label: labels.passiveBreachPerSec,
      value: getEffectivePassiveHeatPerSec(config).toFixed(2),
    },
    {
      id: 'meltdownThreshold',
      tab: 'overload',
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
    const killBonus = computeShardSalvageKillBonus(upgrades);
    lines.push({
      id: 'shardSalvage',
      tab: 'economy',
      label: labels.shardBonusPerKill,
      value: `+${killBonus}`,
    });
    lines.push({
      id: 'shardPayoutExample',
      tab: 'economy',
      label: labels.shardYieldBonus,
      value: getExpectedShardReward(config, 5).toFixed(2),
    });
  }

  if (upgrades.victoryShardBonus > 0) {
    const spawnBonus = VICTORY_SHARD_BONUS_SPAWN_PERCENT_PER_LEVEL * upgrades.victoryShardBonus;
    lines.push({
      id: 'victoryShardBonusSpawn',
      tab: 'economy',
      label: labels.spawnRateBonus,
      value: `+${spawnBonus}%`,
    });
    lines.push({
      id: 'victoryShardBonusAlive',
      tab: 'economy',
      label: labels.spawnMaxAlive,
      value: String(config.hordeMaxAlive),
    });
  }

  if (upgrades.purgeSplash > 0) {
    lines.push(
      {
        id: 'purgeSplashRadius',
        tab: 'damage',
        label: playerLabels.purgeSplashZone,
        value: formatHexRadius(aoe.splashRadius),
      },
      {
        id: 'purgeSplashDamage',
        tab: 'damage',
        label: labels.purgeSplashDamage,
        value: String(
          resolvePurgeSplashDamage(config.purgeHitDamage, upgrades.purgeSplash),
        ),
      },
    );
  }

  if (upgrades.killBreachRelief > 0) {
    const breachRelief = getKillBreachRelief(upgrades);
    const reliefLabel = breachRelief.toFixed(2).replace(/\.?0+$/, '');
    lines.push({
      id: 'breachReliefPerKill',
      tab: 'overload',
      label: labels.breachReliefPerKill,
      value: `−${reliefLabel}%`,
    });
  }

  if (upgrades.latencyInjection > 0) {
    lines.push({
      id: 'latencySlow',
      tab: 'damage',
      label: labels.latencySlowBonus,
      value: `-${upgrades.latencyInjection * 10}%`,
    });
  }

  if (upgrades.leakSealing > 0) {
    const cycle = resolveRelevantCycle();
    const config = getRunConfig(upgrades);
    const trashHp = getEnemyMaxHp(config, false, cycle);
    const bossHp = getEnemyMaxHp(config, true, cycle);
    const fmt = (maxHp: number) => {
      const raw = getRawHitHeatForEnemy(maxHp, cycle);
      const net = getHitHeatPenalty({ maxHp, cycle });
      return `${raw.toFixed(1)} → ${net.toFixed(1)}`;
    };
    lines.push({
      id: 'leakSealing',
      tab: 'overload',
      label: labels.leakArmor,
      value: String(getLeakArmor(upgrades.leakSealing)),
    });
    lines.push({
      id: 'hitHeatNet',
      tab: 'overload',
      label: labels.hitHeatNetExample,
      value: `${fmt(trashHp)} / ${fmt(bossHp)}`,
    });
  }

  if (upgrades.purgeAmplifier > 0) {
    lines.push({
      id: 'purgeAmplifier',
      tab: 'damage',
      label: labels.purgeAmplifierBonus,
      value: `+${getPurgeAmplifierDamageFlat(upgrades.purgeAmplifier)}`,
    });
  }

  return lines;
}

/** Ordre d’affichage stable dans chaque onglet. */
const STAT_DISPLAY_ORDER: readonly string[] = [
  'purgeHitDamage',
  'purgeCadence',
  'criticalChance',
  'purgeReach',
  'purgeSplashRadius',
  'purgeSplashDamage',
  'purgeAmplifier',
  'latencySlow',
  'passiveBreachPerSec',
  'breachReliefPerKill',
  'leakSealing',
  'hitHeatNet',
  'meltdownThreshold',
  'shardSalvage',
  'shardPayoutExample',
  'victoryShardBonus',
] as const;

function sortStatLines(lines: PlayerStatLine[]): PlayerStatLine[] {
  const order = new Map(STAT_DISPLAY_ORDER.map((id, index) => [id, index]));
  return [...lines].sort((a, b) => {
    const ai = order.get(a.id) ?? 1000;
    const bi = order.get(b.id) ?? 1000;
    if (ai !== bi) return ai - bi;
    return a.id.localeCompare(b.id);
  });
}

export function getPlayerStatSheet(upgrades: UpgradeLevels): PlayerStatLine[] {
  const labels = getGameStrings().tooltipStats;
  const playerLabels = getGameStrings().playerStats;

  return sortStatLines([
    ...getBasePlayerStatLines(upgrades, labels, playerLabels),
    ...getUnlockedPlayerStatLines(upgrades, labels, playerLabels),
  ]);
}

export function getPlayerStatsForTab(
  upgrades: UpgradeLevels,
  tab: PlayerStatTabId,
): PlayerStatLine[] {
  return getPlayerStatSheet(upgrades).filter((line) => line.tab === tab);
}
