import { stopHubAmbient } from '../../audio/sfxApi';
import { useGameStore } from '../../store/useGameStore';
import {
  useTransitionStore,
  type ArenaToHubPayload,
  type HubToArenaPayload,
  type ScreenTransitionId,
} from '../../store/useTransitionStore';
import {
  TRANSITION_ACK_MS,
  TRANSITION_HANDOFF_MS,
  TRANSITION_LINES_MS,
  TRANSITION_MIDPOINT_MS,
  TRANSITION_REVEAL_MS,
  waitFrames,
  waitMs,
} from './transitionCatalog';

function runMidpointAction(id: ScreenTransitionId, payload: HubToArenaPayload | ArenaToHubPayload): void {
  if (id === 'hubToArena') {
    const hubPayload = payload as HubToArenaPayload;
    stopHubAmbient();
    useGameStore.getState().startRun(hubPayload.cycle);
    return;
  }

  const hubReturn = payload as ArenaToHubPayload;
  if (hubReturn.reason === 'aborted') {
    useGameStore.getState().abortRun();
  } else {
    useGameStore.getState().openModuleTree();
  }
}

export async function launchScreenTransition(
  id: ScreenTransitionId,
  payload: HubToArenaPayload | ArenaToHubPayload,
): Promise<boolean> {
  const store = useTransitionStore.getState();
  if (store.isBlocking) return false;

  store.begin(id, payload);

  try {
    await waitMs(TRANSITION_ACK_MS);
    useTransitionStore.getState().setPhase('lines');

    const linesElapsed = Math.max(0, TRANSITION_MIDPOINT_MS - TRANSITION_ACK_MS);
    await waitMs(linesElapsed);
    useTransitionStore.getState().setPhase('handoff');
    runMidpointAction(id, payload);
    await waitFrames(2);

    const handoffRemaining =
      TRANSITION_ACK_MS + TRANSITION_LINES_MS + TRANSITION_HANDOFF_MS - TRANSITION_MIDPOINT_MS;
    if (handoffRemaining > 0) {
      await waitMs(handoffRemaining);
    }

    useTransitionStore.getState().setPhase('reveal');
    await waitMs(TRANSITION_REVEAL_MS);
  } finally {
    useTransitionStore.getState().end();
  }

  return true;
}
