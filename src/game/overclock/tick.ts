import type { MutableRefObject } from 'react';
import { syncOverclockDisplay } from './display';
import { getOverclockCooldownMs, type OverclockState } from './state';

export function tickOverclock(
  overclockRef: MutableRefObject<OverclockState>,
  deltaMs: number,
): void {
  const cooldownMs = getOverclockCooldownMs();
  const state = overclockRef.current;

  if (state.active) {
    state.activeTimerMs -= deltaMs;
    if (state.activeTimerMs <= 0) {
      state.active = false;
      state.activeTimerMs = 0;
      state.activeDurationMs = 0;
      state.cooldownTimerMs = cooldownMs;
    }
  } else if (state.cooldownTimerMs > 0) {
    state.cooldownTimerMs = Math.max(0, state.cooldownTimerMs - deltaMs);
  }

  syncOverclockDisplay(state);
}
