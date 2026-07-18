import { isDevInvincible } from '../dev/devFlags';
import { playRunEventSfx } from '../audio/sfxApi';
import { useGameStore } from '../store/useGameStore';
import {
  getEffectivePassiveHeatPerSec,
  getHitHeatPenalty,
  type HitHeatTarget,
  isMeltdownReached,
  type RunConfig,
} from './runConfig';
import { recordOverloadDelta } from './runOverloadTelemetry';

export type OverloadSource = 'hit' | 'time';

let meltdownTriggeredThisRun = false;

export function resetMeltdownGuard(): void {
  meltdownTriggeredThisRun = false;
}

function tryTriggerMeltdown(): void {
  if (meltdownTriggeredThisRun) return;

  const store = useGameStore.getState();
  if (store.gameState !== 'PLAYING') return;
  if (isDevInvincible()) return;

  if (!isMeltdownReached(store.breachProgress, store.upgrades)) return;

  meltdownTriggeredThisRun = true;
  store.endRun('defeat_breach');
  try {
    playRunEventSfx('meltdown');
  } catch {
    // L'audio ne doit jamais bloquer la fin de run.
  }
}

export function addOverload(delta: number, source: OverloadSource): void {
  if (delta <= 0) return;
  if (isDevInvincible()) return;
  recordOverloadDelta(delta, source);
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

/** Riposte Surcharge au hit purge — une application par ennemi touché (AOE incluse). */
export function applyHitOverload(target: HitHeatTarget): void {
  addOverload(getHitHeatPenalty(target), 'hit');
}
