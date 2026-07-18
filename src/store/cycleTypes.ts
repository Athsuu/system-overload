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

/** Cycle progression is unbounded — only escalating difficulty slows the player down. */
export function clampCycleIndex(cycle: number): number {
  return Math.max(1, Math.floor(cycle));
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
