import { useTransitionStore } from '../store/useTransitionStore';
import type { GameState, RunOutcome } from '../store/useGameStore';
import { getDevAutoplaySnapshot, stopDevAutoplay } from './devAutoplay';
import { isDevInRun } from './devAutoplayRunState';

/** Garde-fou global — le robot ne doit jamais rester actif hors run. */
export function syncDevAutoplayGuard(
  gameState: GameState,
  runOutcome: RunOutcome | null,
): void {
  const snap = getDevAutoplaySnapshot();
  if (!snap.active && !snap.pendingStart) return;

  if (gameState === 'RUN_END') {
    stopDevAutoplay({
      reason: 'run_end',
      outcome: runOutcome,
    });
    return;
  }

  if (isDevInRun(gameState)) return;

  if (snap.active) {
    stopDevAutoplay({ reason: 'aborted' });
    return;
  }

  if (snap.pendingStart && !useTransitionStore.getState().isBlocking) {
    stopDevAutoplay({ reason: 'aborted' });
  }
}

export function forceStopDevAutoplayRun(): void {
  stopDevAutoplay({ reason: 'manual' });
}
