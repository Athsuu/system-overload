import { getOverclockCooldownMs, type OverclockState } from './state';

export interface OverclockDisplayState {
  active: boolean;
  /** 0 = empty, 1 = ready — cooldown recharge progress. */
  chargeRatio: number;
  /** 1 = full burst, 0 = ending — active drain progress. */
  activeRatio: number;
}

export const overclockDisplayRef: OverclockDisplayState = {
  active: false,
  chargeRatio: 1,
  activeRatio: 1,
};

export function syncOverclockDisplay(state: OverclockState): void {
  const cooldownMs = getOverclockCooldownMs();
  overclockDisplayRef.active = state.active;

  if (state.active) {
    const duration = state.activeDurationMs > 0 ? state.activeDurationMs : 1;
    overclockDisplayRef.activeRatio = Math.max(0, Math.min(1, state.activeTimerMs / duration));
    overclockDisplayRef.chargeRatio = 0;
    return;
  }

  overclockDisplayRef.activeRatio = 1;
  overclockDisplayRef.chargeRatio =
    cooldownMs > 0 ? Math.max(0, Math.min(1, 1 - state.cooldownTimerMs / cooldownMs)) : 1;
}
