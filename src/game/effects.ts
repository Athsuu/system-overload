export type GameEffectKind = 'death' | 'hitSpark' | 'spawn' | 'kernelImpact' | 'missRipple';

export interface GameEffect {
  kind: GameEffectKind;
  x: number;
  y: number;
  tier: number;
  isBoss: boolean;
  elapsedMs: number;
  durationMs: number;
}

export const HIT_SPARK_DURATION_MS = 60;
export const DEATH_DURATION_MS = 250;
export const BOSS_DEATH_DURATION_MS = 400;
export const SPAWN_FLASH_DURATION_MS = 200;
export const KERNEL_IMPACT_FLASH_MS = 180;
export const MISS_RIPPLE_DURATION_MS = 140;

export function pushHitSpark(effects: GameEffect[], x: number, y: number): void {
  effects.push({
    kind: 'hitSpark',
    x,
    y,
    tier: 0,
    isBoss: false,
    elapsedMs: 0,
    durationMs: HIT_SPARK_DURATION_MS,
  });
}

export function pushDeathEffect(
  effects: GameEffect[],
  x: number,
  y: number,
  tier: number,
  isBoss: boolean,
): void {
  effects.push({
    kind: 'death',
    x,
    y,
    tier,
    isBoss,
    elapsedMs: 0,
    durationMs: isBoss ? BOSS_DEATH_DURATION_MS : DEATH_DURATION_MS,
  });
}

export function pushSpawnFlash(
  effects: GameEffect[],
  x: number,
  y: number,
  tier: number,
  isBoss: boolean,
): void {
  effects.push({
    kind: 'spawn',
    x,
    y,
    tier,
    isBoss,
    elapsedMs: 0,
    durationMs: SPAWN_FLASH_DURATION_MS,
  });
}

export function pushKernelImpactFlash(effects: GameEffect[], x: number, y: number): void {
  effects.push({
    kind: 'kernelImpact',
    x,
    y,
    tier: 0,
    isBoss: false,
    elapsedMs: 0,
    durationMs: KERNEL_IMPACT_FLASH_MS,
  });
}

export function pushMissRipple(effects: GameEffect[], x: number, y: number): void {
  effects.push({
    kind: 'missRipple',
    x,
    y,
    tier: 0,
    isBoss: false,
    elapsedMs: 0,
    durationMs: MISS_RIPPLE_DURATION_MS,
  });
}

export function tickEffects(effects: GameEffect[], deltaMs: number): void {
  for (let index = effects.length - 1; index >= 0; index -= 1) {
    effects[index].elapsedMs += deltaMs;
    if (effects[index].elapsedMs >= effects[index].durationMs) {
      effects.splice(index, 1);
    }
  }
}
