export type GameEffectKind =
  | 'death'
  | 'boltHit'
  | 'muzzleFlash'
  | 'spawn'
  | 'kernelImpact'
  | 'missRipple';

export interface GameEffect {
  kind: GameEffectKind;
  x: number;
  y: number;
  tier: number;
  isBoss: boolean;
  elapsedMs: number;
  durationMs: number;
  rotation: number;
}

export const BOLT_HIT_DURATION_MS = 100;
export const MUZZLE_FLASH_DURATION_MS = 70;
export const DEATH_DURATION_MS = 250;
export const BOSS_DEATH_DURATION_MS = 400;
export const SPAWN_FLASH_DURATION_MS = 200;
export const KERNEL_IMPACT_FLASH_MS = 180;
export const MISS_RIPPLE_DURATION_MS = 140;

function createEffect(
  partial: Omit<GameEffect, 'rotation'> & { rotation?: number },
): GameEffect {
  return { rotation: 0, ...partial };
}

export function pushBoltHit(effects: GameEffect[], x: number, y: number, rotation: number): void {
  effects.push(
    createEffect({
      kind: 'boltHit',
      x,
      y,
      tier: 0,
      isBoss: false,
      elapsedMs: 0,
      durationMs: BOLT_HIT_DURATION_MS,
      rotation,
    }),
  );
}

export function pushMuzzleFlash(
  effects: GameEffect[],
  x: number,
  y: number,
  rotation: number,
): void {
  effects.push(
    createEffect({
      kind: 'muzzleFlash',
      x,
      y,
      tier: 0,
      isBoss: false,
      elapsedMs: 0,
      durationMs: MUZZLE_FLASH_DURATION_MS,
      rotation,
    }),
  );
}

export function pushDeathEffect(
  effects: GameEffect[],
  x: number,
  y: number,
  tier: number,
  isBoss: boolean,
): void {
  effects.push(
    createEffect({
      kind: 'death',
      x,
      y,
      tier,
      isBoss,
      elapsedMs: 0,
      durationMs: isBoss ? BOSS_DEATH_DURATION_MS : DEATH_DURATION_MS,
    }),
  );
}

export function pushSpawnFlash(
  effects: GameEffect[],
  x: number,
  y: number,
  tier: number,
  isBoss: boolean,
): void {
  effects.push(
    createEffect({
      kind: 'spawn',
      x,
      y,
      tier,
      isBoss,
      elapsedMs: 0,
      durationMs: SPAWN_FLASH_DURATION_MS,
    }),
  );
}

export function pushKernelImpactFlash(effects: GameEffect[], x: number, y: number): void {
  effects.push(
    createEffect({
      kind: 'kernelImpact',
      x,
      y,
      tier: 0,
      isBoss: false,
      elapsedMs: 0,
      durationMs: KERNEL_IMPACT_FLASH_MS,
    }),
  );
}

export function pushMissRipple(effects: GameEffect[], x: number, y: number): void {
  effects.push(
    createEffect({
      kind: 'missRipple',
      x,
      y,
      tier: 0,
      isBoss: false,
      elapsedMs: 0,
      durationMs: MISS_RIPPLE_DURATION_MS,
    }),
  );
}

export function tickEffects(effects: GameEffect[], deltaMs: number): void {
  for (let index = effects.length - 1; index >= 0; index -= 1) {
    effects[index].elapsedMs += deltaMs;
    if (effects[index].elapsedMs >= effects[index].durationMs) {
      effects.splice(index, 1);
    }
  }
}
