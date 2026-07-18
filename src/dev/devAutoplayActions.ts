import { useGameStore } from '../store/useGameStore';
import { useTransitionStore } from '../store/useTransitionStore';
import { launchScreenTransition } from '../ui/transitions/launchScreenTransition';
import {
  activateDevAutoplay,
  getDevAutoplaySnapshot,
  isDevAutoplayActive,
  requestDevAutoplayStart,
} from './devAutoplay';
import { isDevInRun } from './devAutoplayRunState';
import { forceStopDevAutoplayRun } from './devAutoplayGuard';
import { applyRobotSessionToGame } from './robotSession';

function prepareHubForRun(): void {
  const { gameState } = useGameStore.getState();
  if (gameState === 'MAIN_MENU') {
    useGameStore.setState({ gameState: 'MENU' });
  }
}

function clearStuckAutoplayState(): void {
  const snap = getDevAutoplaySnapshot();
  if (!snap.active && !snap.pendingStart) return;

  const { gameState } = useGameStore.getState();
  if (snap.active && !isDevInRun(gameState)) {
    forceStopDevAutoplayRun();
    return;
  }

  if (snap.pendingStart && !isDevInRun(gameState) && !useTransitionStore.getState().isBlocking) {
    forceStopDevAutoplayRun();
  }
}

export async function devStartAutoplayRun(): Promise<boolean> {
  clearStuckAutoplayState();

  const snap = getDevAutoplaySnapshot();
  const { gameState } = useGameStore.getState();
  if (isDevAutoplayActive() && isDevInRun(gameState)) return true;
  if (snap.pendingStart && (isDevInRun(gameState) || useTransitionStore.getState().isBlocking)) {
    return true;
  }

  // Skill + cycle débloqué ; modules = build joueur inchangé.
  applyRobotSessionToGame();

  const store = useGameStore.getState();
  requestDevAutoplayStart();

  if (store.gameState === 'PLAYING') {
    return true;
  }

  if (store.gameState === 'PAUSED') {
    store.resumeRun();
    return true;
  }

  prepareHubForRun();
  return launchScreenTransition('hubToArena', { cycle: store.selectedCycle });
}

export function devStopAutoplayRun(): void {
  forceStopDevAutoplayRun();
}

export function devTryActivateAutoplayOnRunStart(
  screenWidth: number,
  screenHeight: number,
): void {
  const snapshot = getDevAutoplaySnapshot();
  if (!snapshot.active && !snapshot.pendingStart) return;

  activateDevAutoplay({
    width: screenWidth,
    height: screenHeight,
    padding: 40,
  });
}
