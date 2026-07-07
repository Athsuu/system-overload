import {
  getBreachCap,
  getKillBreachRelief,
  getRunConfig,
  getShardReward,
  getWaveMaxAlive,
} from '../game/runConfig';
import { getGameStrings } from '../i18n';
import {
  getUpgradeDefinition,
  type UpgradeId,
  type UpgradeLevels,
} from '../store/upgradeCatalog';
import { OVERCLOCK_COOLDOWN_MS, OVERCLOCK_DURATION_MS } from '../game/activeSkill';
export interface TooltipStatLine {
  label: string;
  current: string;
  next: string | null;
}

function withLevel(upgrades: UpgradeLevels, id: UpgradeId, level: number): UpgradeLevels {
  return { ...upgrades, [id]: level };
}

function pct(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`;
}

function signedPct(value: number, digits = 0): string {
  const text = value.toFixed(digits);
  return value > 0 ? `+${text}%` : `${text}%`;
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

  switch (id) {
    case 'node0Boot': {
      const current = String(getRunConfig(cur).purgeHitDamage);
      const next = nxt ? String(getRunConfig(nxt).purgeHitDamage) : null;
      return [line(labels.purgeHitDamage, current, nextLevel, next)];
    }
    case 'boltDamage': {
      const current = String(getRunConfig(cur).purgeHitDamage);
      const next = nxt ? String(getRunConfig(nxt).purgeHitDamage) : null;
      return [line(labels.purgeHitDamage, current, nextLevel, next)];
    }
    case 'damageAmp': {
      const current = signedPct(upgrades.damageAmp * 10);
      const next = nxt ? signedPct(nextLevel! * 10) : null;
      return [
        line(labels.purgeDamageBonus, current, nextLevel, next),
        line(
          labels.purgeHitDamage,
          String(getRunConfig(cur).purgeHitDamage),
          nextLevel,
          nxt ? String(getRunConfig(nxt).purgeHitDamage) : null,
        ),
      ];
    }
    case 'fireRate': {
      const current = signedPct(upgrades.fireRate * 10);
      const next = nxt ? signedPct(nextLevel! * 10) : null;
      const interval = (ms: UpgradeLevels) => `${Math.round(getRunConfig(ms).purgeIntervalMs)}ms`;
      return [
        line(labels.attackSpeed, current, nextLevel, next),
        line(labels.purgeInterval, interval(cur), nextLevel, nxt ? interval(nxt) : null),
      ];
    }
    case 'coolingPower': {
      const perSec = (u: UpgradeLevels) => getRunConfig(u).passiveHeatPerSec;
      return [
        line(
          labels.passiveBreachPerSec,
          `${perSec(cur).toFixed(2)}%`,
          nextLevel,
          nxt ? `${perSec(nxt).toFixed(2)}%` : null,
        ),
        line(
          labels.reduction,
          signedPct(upgrades.coolingPower * 10),
          nextLevel,
          nxt ? signedPct(nextLevel! * 10) : null,
        ),
      ];
    }
    case 'heatShield': {
      const impact = (u: UpgradeLevels) => getRunConfig(u).leakProgressPenalty;
      return [
        line(
          labels.impactBreachTier0,
          `${Math.round(impact(cur))}%`,
          nextLevel,
          nxt ? `${Math.round(impact(nxt))}%` : null,
        ),
        line(
          labels.reduction,
          signedPct(upgrades.heatShield * 10),
          nextLevel,
          nxt ? signedPct(nextLevel! * 10) : null,
        ),
      ];
    }
    case 'fluxThrottle': {
      const relief = (u: UpgradeLevels) => getKillBreachRelief(u, 0);
      return [
        line(
          labels.breachReliefPerKill,
          `${relief(cur).toFixed(2)}%`,
          nextLevel,
          nxt ? `${relief(nxt).toFixed(2)}%` : null,
        ),
        line(labels.tier1Kill, `${(relief(cur) * 1.5).toFixed(2)}%`, nextLevel, nxt ? `${(relief(nxt) * 1.5).toFixed(2)}%` : null),
      ];
    }
    case 'criticalThreshold':
      return [
        line(
          labels.meltdownThreshold,
          pct(getBreachCap(cur)),
          nextLevel,
          nxt ? pct(getBreachCap(nxt)) : null,
        ),
      ];
    case 'nodeReach': {
      const radius = (u: UpgradeLevels) => Math.round(getRunConfig(u).purgeRadius);
      return [
        line(labels.purgeRadius, `${radius(cur)} px`, nextLevel, nxt ? `${radius(nxt)} px` : null),
        line(
          labels.radiusBonus,
          signedPct(upgrades.nodeReach * 25),
          nextLevel,
          nxt ? signedPct(nextLevel! * 25) : null,
        ),
      ];
    }
    case 'purgeReach': {
      const radius = (u: UpgradeLevels) => Math.round(getRunConfig(u).purgeRadius);
      return [line(labels.purgeRadius, `${radius(cur)} px`, nextLevel, nxt ? `${radius(nxt)} px` : null)];
    }
    case 'overclock':
      return [
        line(
          labels.overclockDuration,
          `${OVERCLOCK_DURATION_MS / 1000} s`,
          null,
          null,
        ),
        line(
          labels.overclockCooldown,
          `${OVERCLOCK_COOLDOWN_MS / 1000} s`,
          null,
          null,
        ),
      ];
    case 'fluxDrive':
      return [
        line(
          labels.simulationSpeed,
          level > 0 ? labels.simulationSpeedToggle : '×1',
          nextLevel,
          labels.simulationSpeedToggle,
        ),
      ];
    case 'killBonus': {
      const shards = (u: UpgradeLevels) => getShardReward(getRunConfig(u), 0);
      return [
        line(labels.bonusShardsPerKill, `+${upgrades.killBonus}`, nextLevel, nxt ? `+${nextLevel}` : null),
        line(
          labels.shardsPerKillTier0,
          String(shards(cur)),
          nextLevel,
          nxt ? String(shards(nxt)) : null,
        ),
      ];
    }
    case 'shardYield': {
      const mult = (u: UpgradeLevels) => getRunConfig(u).shardsMultiplier;
      return [
        line(labels.shardMultiplier, `×${mult(cur).toFixed(2)}`, nextLevel, nxt ? `×${mult(nxt!).toFixed(2)}` : null),
        line(
          labels.bonus,
          signedPct(upgrades.shardYield * 15),
          nextLevel,
          nxt ? signedPct(nextLevel! * 15) : null,
        ),
      ];
    }
    case 'starterNodes':
      return [
        line(
          labels.wave1ExtraEnemies,
          `+${upgrades.starterNodes}`,
          nextLevel,
          nxt ? `+${nextLevel}` : null,
        ),
      ];
    case 'spawnThrottle': {
      const mult = (u: UpgradeLevels) => getRunConfig(u).spawnIntervalMult;
      return [
        line(labels.spawnInterval, `×${mult(cur).toFixed(2)}`, nextLevel, nxt ? `×${mult(nxt!).toFixed(2)}` : null),
        line(
          labels.slowerSpawns,
          signedPct(upgrades.spawnThrottle * 10),
          nextLevel,
          nxt ? signedPct(nextLevel! * 10) : null,
        ),
      ];
    }
    case 'containment':
      return [
        line(
          labels.maxAliveReduction,
          `-${upgrades.containment}`,
          nextLevel,
          nxt ? `-${nextLevel}` : null,
        ),
        line(
          labels.exampleCapWave1,
          String(getWaveMaxAlive(3, getRunConfig(cur))),
          nextLevel,
          nxt ? String(getWaveMaxAlive(3, getRunConfig(nxt))) : null,
        ),
      ];
    default:
      return [];
  }
}

export function getTooltipHeight(lineCount: number): number {
  const base = 168;
  const extra = Math.max(0, lineCount - 1) * 20;
  return base + extra;
}
