let devInvincible = false;

export function isDevInvincible(): boolean {
  return devInvincible;
}

export function devToggleInvincible(): boolean {
  devInvincible = !devInvincible;
  return devInvincible;
}

export function devSetInvincible(enabled: boolean): void {
  devInvincible = enabled;
}

let devShowEnemyHpBars = false;

export function isDevShowEnemyHpBars(): boolean {
  return devShowEnemyHpBars;
}

export function devToggleShowEnemyHpBars(): boolean {
  devShowEnemyHpBars = !devShowEnemyHpBars;
  return devShowEnemyHpBars;
}

export function devSetShowEnemyHpBars(enabled: boolean): void {
  devShowEnemyHpBars = enabled;
}

const DEV_RUN_SPEED_NORMAL = 1;
const DEV_RUN_SPEED_FAST = 2;

let devRunSpeedMultiplier = DEV_RUN_SPEED_NORMAL;

export function getDevRunSpeedMultiplier(): number {
  return devRunSpeedMultiplier;
}

export function isDevSpeed2x(): boolean {
  return devRunSpeedMultiplier === DEV_RUN_SPEED_FAST;
}

export function devToggleSpeed2x(): boolean {
  devRunSpeedMultiplier =
    devRunSpeedMultiplier === DEV_RUN_SPEED_FAST ? DEV_RUN_SPEED_NORMAL : DEV_RUN_SPEED_FAST;
  return isDevSpeed2x();
}

export function devSetSpeed2x(enabled: boolean): void {
  devRunSpeedMultiplier = enabled ? DEV_RUN_SPEED_FAST : DEV_RUN_SPEED_NORMAL;
}
