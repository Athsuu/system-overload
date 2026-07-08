import { getRunConfig } from '../game/runConfig';
import { getGameStrings } from '../i18n';
import {
  getUpgradeDefinition,
  PURGE_STRIKE_DAMAGE_PER_LEVEL,
  THREAD_COOLANT_PASSIVE_REDUCTION_PER_LEVEL,
  type UpgradeId,
  type UpgradeLevels,
} from '../store/upgradeCatalog';
import { getKillBreachRelief } from '../game/runConfig';

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

  return [];
}

export function getTooltipHeight(lineCount: number): number {
  const base = 168;
  const extra = Math.max(0, lineCount - 1) * 20;
  return base + extra;
}
