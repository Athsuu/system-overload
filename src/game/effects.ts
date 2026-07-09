import type { EnemyClass } from './enemyClass';

export type GameEffectKind = 'death' | 'purgeHit' | 'spawn' | 'flowEscape';

export interface GameEffect {
  kind: GameEffectKind;
  x: number;
  y: number;
  waveIndex: number;
  enemyClass: EnemyClass;
  elapsedMs: number;
  durationMs: number;
  rotation: number;
}

export const PURGE_HIT_DURATION_MS = 220;
export const DEATH_DURATION_MS = 250;
export const ELITE_DEATH_DURATION_MS = 400;
export const SPAWN_FLASH_DURATION_MS = 200;
export const FLOW_ESCAPE_FLASH_MS = 180;

function createEffect(
  partial: Omit<GameEffect, 'rotation'> & { rotation?: number },
): GameEffect {
  return { rotation: 0, ...partial };
}

export function pushPurgeHit(
  effects: GameEffect[],
  x: number,
  y: number,
  waveIndex: number,
  enemyClass: EnemyClass,
): void {
  effects.push(
    createEffect({
      kind: 'purgeHit',
      x,
      y,
      waveIndex,
      enemyClass,
      elapsedMs: 0,
      durationMs: PURGE_HIT_DURATION_MS,
      rotation: 0,
    }),
  );
}

export function pushDeathEffect(
  effects: GameEffect[],
  x: number,
  y: number,
  waveIndex: number,
  enemyClass: EnemyClass,
): void {
  effects.push(
    createEffect({
      kind: 'death',
      x,
      y,
      waveIndex,
      enemyClass,
      elapsedMs: 0,
      durationMs: enemyClass === 'elite' ? ELITE_DEATH_DURATION_MS : DEATH_DURATION_MS,
    }),
  );
}

export function pushSpawnFlash(
  effects: GameEffect[],
  x: number,
  y: number,
  waveIndex: number,
  enemyClass: EnemyClass,
): void {
  effects.push(
    createEffect({
      kind: 'spawn',
      x,
      y,
      waveIndex,
      enemyClass,
      elapsedMs: 0,
      durationMs: SPAWN_FLASH_DURATION_MS,
    }),
  );
}

export function pushFlowEscapeFlash(
  effects: GameEffect[],
  x: number,
  y: number,
  waveIndex: number,
): void {
  effects.push(
    createEffect({
      kind: 'flowEscape',
      x,
      y,
      waveIndex,
      enemyClass: 'normal',
      elapsedMs: 0,
      durationMs: FLOW_ESCAPE_FLASH_MS,
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
