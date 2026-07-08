/** Playable cycle count — increase when adding new cycle tiers. */
export const MAX_CYCLES = 3;

export const REGULAR_WAVES_PER_CYCLE = 10;

export interface CycleProgress {
  highestCycleUnlocked: number;
  selectedCycle: number;
  cyclesCleared: number[];
}

export const DEFAULT_CYCLE_PROGRESS: CycleProgress = {
  highestCycleUnlocked: 1,
  selectedCycle: 1,
  cyclesCleared: [],
};

export function clampCycleIndex(cycle: number): number {
  return Math.max(1, Math.min(MAX_CYCLES, Math.floor(cycle)));
}

export function sanitizeCyclesCleared(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<number>();
  const out: number[] = [];
  for (const item of raw) {
    if (typeof item !== 'number' || !Number.isFinite(item)) continue;
    const cycle = clampCycleIndex(item);
    if (seen.has(cycle)) continue;
    seen.add(cycle);
    out.push(cycle);
  }
  return out.sort((a, b) => a - b);
}

export function isCycleCleared(cyclesCleared: readonly number[], cycle: number): boolean {
  return cyclesCleared.includes(clampCycleIndex(cycle));
}
