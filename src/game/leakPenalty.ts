export const LEAK_BURST_MULT = 1.5;
export const LEAK_BURST_WINDOW_MS = 3000;

export function applyLeakBurstMultiplier(penalty: number, burstIndex: number): number {
  return burstIndex >= 1 ? penalty * LEAK_BURST_MULT : penalty;
}

export function sumLeakPenalties(basePenalty: number, leakCount: number): number {
  if (leakCount <= 0) return 0;

  let total = 0;
  for (let index = 0; index < leakCount; index += 1) {
    total += applyLeakBurstMultiplier(basePenalty, index);
  }
  return total;
}
