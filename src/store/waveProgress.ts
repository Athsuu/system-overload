import { BOSS_WAVE_INDEX } from '../game/waveScaling';
import { clampCycleIndex } from './cycleTypes';

/** Meilleure vague atteinte par cycle (clé = numéro de cycle). */
export type BestWaveByCycle = Record<number, number>;

export const DEFAULT_BEST_WAVE_BY_CYCLE: BestWaveByCycle = {};

export function sanitizeBestWaveByCycle(raw: unknown): BestWaveByCycle {
  if (!raw || typeof raw !== 'object') return {};

  const out: BestWaveByCycle = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const cycle = clampCycleIndex(Number(key));
    if (!Number.isFinite(Number(key))) continue;
    if (typeof value !== 'number' || !Number.isFinite(value)) continue;

    const wave = Math.max(0, Math.floor(value));
    if (wave <= 0) continue;

    const prev = out[cycle] ?? 0;
    if (wave > prev) out[cycle] = wave;
  }

  return out;
}

export function mergeBestWaveRecord(
  records: BestWaveByCycle,
  cycle: number,
  waveIndex: number,
): BestWaveByCycle {
  const safeCycle = clampCycleIndex(cycle);
  const wave = Math.max(0, Math.floor(waveIndex));
  if (wave <= 0) return records;

  const prev = records[safeCycle] ?? 0;
  if (wave <= prev) return records;

  return { ...records, [safeCycle]: wave };
}

export function getBestWaveEver(
  records: BestWaveByCycle,
): { cycle: number; wave: number } | null {
  let best: { cycle: number; wave: number } | null = null;

  for (const [cycleKey, wave] of Object.entries(records)) {
    const cycle = clampCycleIndex(Number(cycleKey));
    if (wave <= 0) continue;
    if (!best || wave > best.wave) {
      best = { cycle, wave };
    }
  }

  return best;
}

export function formatWaveRecordLabel(wave: number): string {
  if (wave >= BOSS_WAVE_INDEX) return `vague ${wave} (boss)`;
  return `vague ${wave}`;
}

export function listBestWaveRecords(records: BestWaveByCycle): Array<{ cycle: number; wave: number }> {
  return Object.entries(records)
    .map(([cycleKey, wave]) => ({
      cycle: clampCycleIndex(Number(cycleKey)),
      wave: Math.max(0, Math.floor(wave)),
    }))
    .filter((row) => row.wave > 0)
    .sort((a, b) => a.cycle - b.cycle);
}
