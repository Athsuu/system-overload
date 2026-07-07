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
