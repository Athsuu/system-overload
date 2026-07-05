export interface OverclockState {
  active: boolean;
  activeTimerMs: number;
  cooldownTimerMs: number;
}

export const OVERCLOCK_DURATION_MS = 4000;
export const OVERCLOCK_COOLDOWN_MS = 12000;
export const OVERCLOCK_FIRE_RATE_MULT = 0.5;
export const OVERCLOCK_HEAT_MULT = 0.6;

export function createOverclockState(): OverclockState {
  return {
    active: false,
    activeTimerMs: 0,
    cooldownTimerMs: 0,
  };
}

export function getOverclockDurationMs(moduleLevels: { overclockDuration?: number }): number {
  return OVERCLOCK_DURATION_MS + (moduleLevels.overclockDuration ?? 0) * 1000;
}

export function getOverclockCooldownMs(
  moduleLevels: { overclockCooldown?: number },
  fluxThrottleLevel = 0,
): number {
  return Math.max(
    4000,
    OVERCLOCK_COOLDOWN_MS -
      (moduleLevels.overclockCooldown ?? 0) * 2000 -
      fluxThrottleLevel * 500,
  );
}

export function tryActivateOverclock(state: OverclockState, durationMs: number): boolean {
  if (state.active || state.cooldownTimerMs > 0) return false;
  state.active = true;
  state.activeTimerMs = durationMs;
  return true;
}

export function tickOverclock(
  state: OverclockState,
  deltaMs: number,
  _durationMs: number,
  cooldownMs: number,
): void {
  if (state.active) {
    state.activeTimerMs -= deltaMs;
    if (state.activeTimerMs <= 0) {
      state.active = false;
      state.cooldownTimerMs = cooldownMs;
    }
    return;
  }

  if (state.cooldownTimerMs > 0) {
    state.cooldownTimerMs = Math.max(0, state.cooldownTimerMs - deltaMs);
  }
}
