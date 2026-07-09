import { isDevInvincible } from '../dev/devFlags';
import { playRunEventSfx } from '../audio/sfxApi';
import { useGameStore } from '../store/useGameStore';
import { applyLeakBurstMultiplier, LEAK_BURST_WINDOW_MS } from './leakPenalty';
import {
  getBreachCap,
  getEffectivePassiveHeatPerSec,
  getLeakProgressPenalty,
  type RunConfig,
} from './runConfig';

export type OverloadSource = 'impact' | 'time';

let recentImpactTimes: number[] = [];
let meltdownTriggeredThisRun = false;

export function resetLeakBurstTracker(): void {
  recentImpactTimes = [];
}

export function resetMeltdownGuard(): void {
  meltdownTriggeredThisRun = false;
}

function tryTriggerMeltdown(): void {
  if (meltdownTriggeredThisRun) return;

  const store = useGameStore.getState();
  if (store.gameState !== 'PLAYING') return;
  if (isDevInvincible()) return;

  const breachCap = getBreachCap(store.upgrades);
  if (store.breachProgress < breachCap) return;

  meltdownTriggeredThisRun = true;
  playRunEventSfx('meltdown');
  store.endRun('defeat_breach');
}

export function addOverload(delta: number, _source: OverloadSource): void {
  if (delta <= 0) return;
  if (isDevInvincible()) return;
  useGameStore.getState().addBreachProgress(delta);
  tryTriggerMeltdown();
}

export function applyTimeOverload(
  config: RunConfig,
  deltaSeconds: number,
  overclockHeatMult = 1,
): void {
  addOverload(getEffectivePassiveHeatPerSec(config) * deltaSeconds * overclockHeatMult, 'time');
}

export function applyImpactOverload(config: RunConfig, waveIndex: number): void {
  const now = performance.now();
  recentImpactTimes = recentImpactTimes.filter((t) => now - t < LEAK_BURST_WINDOW_MS);
  const burstIndex = recentImpactTimes.length;
  recentImpactTimes.push(now);

  const basePenalty = getLeakProgressPenalty(config, waveIndex);
  const penalty = applyLeakBurstMultiplier(basePenalty, burstIndex);

  addOverload(penalty, 'impact');
}
