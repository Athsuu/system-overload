export type GameEffectKind = 'death' | 'purgeHit' | 'spawn' | 'flowEscape' | 'splashShockwave';

export interface GameEffect {
  kind: GameEffectKind;
  x: number;
  y: number;
  enemyLevel: number;
  isBossEncounter: boolean;
  elapsedMs: number;
  durationMs: number;
  rotation: number;
  /** Anneau shockwave splash : rayon zone principale au départ. */
  innerRadius?: number;
  /** Anneau shockwave splash : rayon max éclaboussure. */
  outerRadius?: number;
}

export const PURGE_HIT_DURATION_MS = 220;
export const DEATH_DURATION_MS = 250;
export const BOSS_DEATH_DURATION_MS = 400;
export const SPAWN_FLASH_DURATION_MS = 200;
export const FLOW_ESCAPE_FLASH_MS = 180;

/** Soft cap FX éphémères — évite l’explosion de particules sous horde dense. */
const MAX_ACTIVE_EFFECTS = 80;

function trimEffectsIfNeeded(effects: GameEffect[]): void {
  while (effects.length >= MAX_ACTIVE_EFFECTS) {
    effects.shift();
  }
}

function createEffect(
  partial: Omit<GameEffect, 'rotation'> & { rotation?: number },
): GameEffect {
  return { rotation: 0, ...partial };
}

function pushEffect(effects: GameEffect[], effect: GameEffect): void {
  trimEffectsIfNeeded(effects);
  effects.push(effect);
}

export function pushPurgeHit(
  effects: GameEffect[],
  x: number,
  y: number,
  enemyLevel: number,
  isBossEncounter: boolean,
): void {
  pushEffect(
    effects,
    createEffect({
      kind: 'purgeHit',
      x,
      y,
      enemyLevel,
      isBossEncounter,
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
  enemyLevel: number,
  isBossEncounter: boolean,
): void {
  pushEffect(
    effects,
    createEffect({
      kind: 'death',
      x,
      y,
      enemyLevel,
      isBossEncounter,
      elapsedMs: 0,
      durationMs: isBossEncounter ? BOSS_DEATH_DURATION_MS : DEATH_DURATION_MS,
    }),
  );
}

export function pushSpawnFlash(
  effects: GameEffect[],
  x: number,
  y: number,
  enemyLevel: number,
  isBossEncounter: boolean,
): void {
  pushEffect(
    effects,
    createEffect({
      kind: 'spawn',
      x,
      y,
      enemyLevel,
      isBossEncounter,
      elapsedMs: 0,
      durationMs: SPAWN_FLASH_DURATION_MS,
    }),
  );
}

export function pushFlowEscapeFlash(
  effects: GameEffect[],
  x: number,
  y: number,
  enemyLevel: number,
): void {
  pushEffect(
    effects,
    createEffect({
      kind: 'flowEscape',
      x,
      y,
      enemyLevel,
      isBossEncounter: false,
      elapsedMs: 0,
      durationMs: FLOW_ESCAPE_FLASH_MS,
    }),
  );
}

export function pushSplashShockwave(
  effects: GameEffect[],
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
  durationMs: number,
): void {
  pushEffect(
    effects,
    createEffect({
      kind: 'splashShockwave',
      x,
      y,
      enemyLevel: 0,
      isBossEncounter: false,
      elapsedMs: 0,
      durationMs,
      innerRadius,
      outerRadius,
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
