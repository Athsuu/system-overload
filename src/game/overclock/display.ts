export interface OverclockDisplayState {
  active: boolean;
  cooldownRatio: number;
}

export const overclockDisplayRef: OverclockDisplayState = {
  active: false,
  cooldownRatio: 0,
};

export function syncOverclockDisplay(
  active: boolean,
  cooldownMs: number,
  maxCooldownMs: number,
): void {
  overclockDisplayRef.active = active;
  overclockDisplayRef.cooldownRatio =
    maxCooldownMs > 0 ? cooldownMs / maxCooldownMs : 0;
}
