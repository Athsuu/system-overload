export interface OverclockState {
  active: boolean;
  activeTimerMs: number;
  cooldownTimerMs: number;
}

export const OVERCLOCK_DURATION_MS = 4000;
export const OVERCLOCK_COOLDOWN_MS = 12000;

export function createOverclockState(): OverclockState {
  return {
    active: false,
    activeTimerMs: 0,
    cooldownTimerMs: 0,
  };
}

export function getOverclockDurationMs(): number {
  return OVERCLOCK_DURATION_MS;
}

export function getOverclockCooldownMs(): number {
  return OVERCLOCK_COOLDOWN_MS;
}

export function tryActivateOverclock(state: OverclockState, durationMs: number): boolean {
  if (state.active || state.cooldownTimerMs > 0) return false;
  state.active = true;
  state.activeTimerMs = durationMs;
  return true;
}
