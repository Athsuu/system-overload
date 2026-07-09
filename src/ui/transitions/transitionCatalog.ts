import type { ScreenTransitionId } from '../../store/useTransitionStore';

export const TRANSITION_ACK_MS = 150;
export const TRANSITION_LINES_MS = 1000;
export const TRANSITION_HANDOFF_MS = 200;
export const TRANSITION_REVEAL_MS = 250;
export const TRANSITION_LINE_STAGGER_MS = 150;

export const TRANSITION_MIDPOINT_MS =
  TRANSITION_ACK_MS + Math.round((TRANSITION_LINES_MS + TRANSITION_HANDOFF_MS) * 0.55);

export const TRANSITION_TOTAL_MS =
  TRANSITION_ACK_MS + TRANSITION_LINES_MS + TRANSITION_HANDOFF_MS + TRANSITION_REVEAL_MS;

export interface TransitionLineKeys {
  line1: string;
  line2: string;
  line3: string;
}

export interface TransitionDefinition {
  id: ScreenTransitionId;
  lineKeys: TransitionLineKeys;
  shutdownAbortedLineKeys?: TransitionLineKeys;
}

export const TRANSITION_DEFINITIONS: Record<ScreenTransitionId, TransitionDefinition> = {
  hubToArena: {
    id: 'hubToArena',
    lineKeys: {
      line1: 'bootLine1',
      line2: 'bootLine2',
      line3: 'bootLine3',
    },
  },
  arenaToHub: {
    id: 'arenaToHub',
    lineKeys: {
      line1: 'shutdownLine1',
      line2: 'shutdownLine2',
      line3: 'shutdownLine3',
    },
    shutdownAbortedLineKeys: {
      line1: 'shutdownAbortedLine1',
      line2: 'shutdownAbortedLine2',
      line3: 'shutdownAbortedLine3',
    },
  },
};

export function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function waitFrames(frameCount = 2): Promise<void> {
  return new Promise((resolve) => {
    let remaining = frameCount;
    const step = () => {
      remaining -= 1;
      if (remaining <= 0) {
        resolve();
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}
