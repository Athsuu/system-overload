import { isDevInvincible } from '../dev/devFlags';
import { useGameStore } from '../store/useGameStore';
import { getLeakProgressPenalty, type RunConfig } from './runConfig';

export type OverloadSource = 'impact' | 'time';

const LEAK_BURST_WINDOW_MS = 3000;
const LEAK_BURST_MULT = 1.5;

let recentImpactTimes: number[] = [];

export function resetLeakBurstTracker(): void {
  recentImpactTimes = [];
}

export function addOverload(delta: number, _source: OverloadSource): void {
  if (delta <= 0) return;
  if (isDevInvincible()) return;
  useGameStore.getState().addBreachProgress(delta);
}

export function applyTimeOverload(
  config: RunConfig,
  deltaSeconds: number,
  overclockHeatMult = 1,
): void {
  addOverload(config.passiveHeatPerSec * deltaSeconds * overclockHeatMult, 'time');
}

export function applyImpactOverload(config: RunConfig, waveIndex: number): void {
  const now = performance.now();
  recentImpactTimes = recentImpactTimes.filter((t) => now - t < LEAK_BURST_WINDOW_MS);
  const burstIndex = recentImpactTimes.length;
  recentImpactTimes.push(now);

  let penalty = getLeakProgressPenalty(config, waveIndex);
  if (burstIndex >= 1) {
    penalty *= LEAK_BURST_MULT;
  }

  addOverload(penalty, 'impact');
}
