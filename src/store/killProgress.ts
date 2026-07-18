import { BOSS_KILL_THRESHOLD } from '../game/horde/hordeConfig';
import { clampCycleIndex } from './cycleTypes';

/** Meilleur score de kills par cycle (clé = numéro de cycle). */
export type BestKillsByCycle = Record<number, number>;

export const DEFAULT_BEST_KILLS_BY_CYCLE: BestKillsByCycle = {};

export function sanitizeBestKillsByCycle(raw: unknown): BestKillsByCycle {
  if (!raw || typeof raw !== 'object') return {};

  const out: BestKillsByCycle = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const cycle = clampCycleIndex(Number(key));
    if (!Number.isFinite(Number(key))) continue;
    if (typeof value !== 'number' || !Number.isFinite(value)) continue;

    const kills = Math.max(0, Math.floor(value));
    if (kills <= 0) continue;

    const prev = out[cycle] ?? 0;
    if (kills > prev) out[cycle] = kills;
  }

  return out;
}

/**
 * Migration save : anciennes bestWaveByCycle → kills approximatifs.
 * Vague N (1–11) → N * 7 kills (heuristique douce, ne bloque pas la progression).
 */
export function migrateBestWaveToKills(rawWave: unknown): BestKillsByCycle {
  if (!rawWave || typeof rawWave !== 'object') return {};

  const out: BestKillsByCycle = {};
  for (const [key, value] of Object.entries(rawWave as Record<string, unknown>)) {
    const cycle = clampCycleIndex(Number(key));
    if (!Number.isFinite(Number(key))) continue;
    if (typeof value !== 'number' || !Number.isFinite(value)) continue;
    const wave = Math.max(0, Math.floor(value));
    if (wave <= 0) continue;
    const kills = Math.min(BOSS_KILL_THRESHOLD, wave * 7);
    const prev = out[cycle] ?? 0;
    if (kills > prev) out[cycle] = kills;
  }
  return out;
}

export function mergeBestKillsRecord(
  records: BestKillsByCycle,
  cycle: number,
  kills: number,
): BestKillsByCycle {
  const safeCycle = clampCycleIndex(cycle);
  const safeKills = Math.max(0, Math.floor(kills));
  if (safeKills <= 0) return records;

  const prev = records[safeCycle] ?? 0;
  if (safeKills <= prev) return records;

  return { ...records, [safeCycle]: safeKills };
}

export function getBestKillsEver(
  records: BestKillsByCycle,
): { cycle: number; kills: number } | null {
  let best: { cycle: number; kills: number } | null = null;

  for (const [cycleKey, kills] of Object.entries(records)) {
    const cycle = clampCycleIndex(Number(cycleKey));
    if (kills <= 0) continue;
    if (!best || kills > best.kills) {
      best = { cycle, kills };
    }
  }

  return best;
}

export function formatKillsRecordLabel(kills: number): string {
  if (kills >= BOSS_KILL_THRESHOLD) return `${kills} kills (boss)`;
  return `${kills} kills`;
}

export function listBestKillsRecords(
  records: BestKillsByCycle,
): Array<{ cycle: number; kills: number }> {
  return Object.entries(records)
    .map(([cycleKey, kills]) => ({
      cycle: clampCycleIndex(Number(cycleKey)),
      kills: Math.max(0, Math.floor(kills)),
    }))
    .filter((row) => row.kills > 0)
    .sort((a, b) => a.cycle - b.cycle);
}
