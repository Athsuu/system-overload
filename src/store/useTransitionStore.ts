import { create } from 'zustand';

export type ScreenTransitionId = 'hubToArena' | 'arenaToHub';

export type ArenaToHubReason = 'victory' | 'meltdown' | 'aborted';

export interface HubToArenaPayload {
  cycle?: number;
}

export interface ArenaToHubPayload {
  reason: ArenaToHubReason;
}

export type ScreenTransitionPayload = HubToArenaPayload | ArenaToHubPayload;

export type ScreenTransitionPhase = 'ack' | 'lines' | 'handoff' | 'reveal';

export interface ActiveScreenTransition {
  id: ScreenTransitionId;
  payload: ScreenTransitionPayload;
  phase: ScreenTransitionPhase;
}

interface TransitionStore {
  active: ActiveScreenTransition | null;
  isBlocking: boolean;
  begin: (id: ScreenTransitionId, payload: ScreenTransitionPayload) => void;
  setPhase: (phase: ScreenTransitionPhase) => void;
  end: () => void;
}

export const useTransitionStore = create<TransitionStore>((set) => ({
  active: null,
  isBlocking: false,
  begin: (id, payload) =>
    set({
      active: { id, payload, phase: 'ack' },
      isBlocking: true,
    }),
  setPhase: (phase) =>
    set((state) =>
      state.active ? { active: { ...state.active, phase } } : state,
    ),
  end: () => set({ active: null, isBlocking: false }),
}));
