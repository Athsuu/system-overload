import { useGameStore } from '../store/useGameStore';
import { getLeakProgressPenalty, type RunConfig } from './runConfig';

/** Narrative overload sources — each drives Breach progress toward Meltdown. */
export type OverloadSource = 'impact' | 'missed_shot' | 'time';

export function addOverload(delta: number, _source: OverloadSource): void {
  if (delta <= 0) return;
  useGameStore.getState().addBreachProgress(delta);
}

/** Passive overload: every second the system decays further. */
export function applyTimeOverload(
  config: RunConfig,
  deltaSeconds: number,
  overclockHeatMult = 1,
): void {
  addOverload(config.passiveHeatPerSec * deltaSeconds * overclockHeatMult, 'time');
}

/** Corrupted process reaches the Kernel. */
export function applyImpactOverload(config: RunConfig, tier: number): void {
  addOverload(getLeakProgressPenalty(config, tier), 'impact');
}

/** Bolt leaves the arena without intercepting a process. */
export function applyMissedShotOverload(config: RunConfig): void {
  addOverload(config.missProgressPenalty, 'missed_shot');
}
