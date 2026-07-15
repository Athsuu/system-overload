import type { ScreenBounds } from '../game/constants';
import { purgePointerRef } from '../game/purgeInput';
import type { DissipationNode } from '../game/types';
import type { RunOutcome } from '../store/useGameStore';

export const DEV_AUTOPLAY_EVENT = 'dev-autoplay-change';

/** Vitesse curseur moyenne (px/s écran) — temps réel, style joueur humain. */
const CURSOR_MAX_SPEED_PX_PER_SEC = 780;
/** Délai min/max avant changement de cible (ms). */
const REACTION_DELAY_MS: readonly [number, number] = [320, 480];
/** Imprécision de visée autour de la cible (px). */
const AIM_JITTER_PX = 18;
/** Probabilité de choisir une cible sous-optimale au retarget. */
const SUBOPTIMAL_TARGET_CHANCE = 0.12;
/** Écart de score minimum pour abandonner la cible actuelle. */
const RETARGET_HYSTERESIS = 28;
/** Zone morte : pas de micro-corrections sous ce rayon (px). */
const CURSOR_DEAD_ZONE_PX = 10;
/** Lissage du point visé qui suit l'ennemi en mouvement (ms). */
const AIM_FOLLOW_SMOOTH_MS = 160;

export type DevAutoplayStopReason = 'manual' | 'run_end' | 'aborted';

export interface DevAutoplaySnapshot {
  active: boolean;
  pendingStart: boolean;
  statusLine: string;
  stopReason: DevAutoplayStopReason | null;
  lastOutcome: RunOutcome | null;
  awaitingSnapshot: boolean;
  retargetCount: number;
}

const state: DevAutoplaySnapshot = {
  active: false,
  pendingStart: false,
  statusLine: 'Arrêté',
  stopReason: null,
  lastOutcome: null,
  awaitingSnapshot: false,
  retargetCount: 0,
};

let aimX = 0;
let aimY = 0;
let aimJitterX = 0;
let aimJitterY = 0;
let jitterTargetX = 0;
let jitterTargetY = 0;
let nextRetargetAt = 0;
/** Identité stable par ennemi — ne pas utiliser x/y (0.1 px/frame = tremblement). */
let stickyCorruptSeed: number | null = null;

function notifyChange(): void {
  window.dispatchEvent(new CustomEvent(DEV_AUTOPLAY_EVENT));
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function expSmoothingFactor(deltaMs: number, smoothMs: number): number {
  if (smoothMs <= 0) return 1;
  return 1 - Math.exp(-deltaMs / smoothMs);
}

function findEnemyBySeed(
  enemies: readonly DissipationNode[],
  corruptSeed: number,
): DissipationNode | null {
  for (const enemy of enemies) {
    if (enemy.corruptSeed === corruptSeed) return enemy;
  }
  return null;
}

function scoreEnemy(
  enemy: DissipationNode,
  cursorX: number,
  cursorY: number,
  suboptimal: boolean,
): number {
  const leakProgress =
    enemy.flowDistance > 0 ? enemy.distanceTraveled / enemy.flowDistance : 0;
  const urgency = leakProgress * 120;
  const bossBonus = enemy.isBossEncounter ? 35 : 0;
  const distFromCursor = Math.hypot(enemy.x - cursorX, enemy.y - cursorY);
  const reachBonus = distFromCursor < 220 ? 18 : 0;
  const suboptimalPenalty = suboptimal ? urgency * 0.45 + bossBonus * 0.5 : 0;

  return urgency + bossBonus + reachBonus - suboptimalPenalty;
}

function pickBestEnemy(
  enemies: readonly DissipationNode[],
  cursorX: number,
  cursorY: number,
  suboptimal: boolean,
): DissipationNode | null {
  let best: DissipationNode | null = null;
  let bestScore = -Infinity;

  for (const enemy of enemies) {
    const score = scoreEnemy(enemy, cursorX, cursorY, suboptimal);
    if (score > bestScore) {
      bestScore = score;
      best = enemy;
    }
  }

  return best;
}

function pickTarget(
  enemies: readonly DissipationNode[],
  cursorX: number,
  cursorY: number,
): DissipationNode | null {
  if (enemies.length === 0) return null;

  const now = performance.now();
  const sticky =
    stickyCorruptSeed === null ? null : findEnemyBySeed(enemies, stickyCorruptSeed);

  if (sticky && now < nextRetargetAt) {
    return sticky;
  }

  const suboptimal = Math.random() < SUBOPTIMAL_TARGET_CHANCE;
  const challenger = pickBestEnemy(enemies, cursorX, cursorY, suboptimal);
  if (!challenger) return sticky;

  if (sticky && now >= nextRetargetAt) {
    const stickyScore = scoreEnemy(sticky, cursorX, cursorY, false);
    const challengerScore = scoreEnemy(challenger, cursorX, cursorY, false);

    if (
      challenger.corruptSeed !== sticky.corruptSeed &&
      challengerScore < stickyScore + RETARGET_HYSTERESIS
    ) {
      nextRetargetAt = now + randomBetween(REACTION_DELAY_MS[0], REACTION_DELAY_MS[1]);
      return sticky;
    }
  }

  if (challenger.corruptSeed !== stickyCorruptSeed) {
    stickyCorruptSeed = challenger.corruptSeed;
    nextRetargetAt = now + randomBetween(REACTION_DELAY_MS[0], REACTION_DELAY_MS[1]);
    jitterTargetX = (Math.random() - 0.5) * AIM_JITTER_PX * 2;
    jitterTargetY = (Math.random() - 0.5) * AIM_JITTER_PX * 2;
    state.retargetCount += 1;
  }

  return challenger;
}

function fallbackAim(bounds: ScreenBounds): { x: number; y: number } {
  return {
    x: bounds.width * 0.5,
    y: bounds.height * 0.5,
  };
}

function moveCursorToward(targetX: number, targetY: number, deltaMs: number): void {
  const dx = targetX - purgePointerRef.x;
  const dy = targetY - purgePointerRef.y;
  const distance = Math.hypot(dx, dy);

  if (distance <= CURSOR_DEAD_ZONE_PX) {
    purgePointerRef.active = true;
    return;
  }

  const maxStep = (CURSOR_MAX_SPEED_PX_PER_SEC * deltaMs) / 1000;
  if (distance <= maxStep) {
    purgePointerRef.x = targetX;
    purgePointerRef.y = targetY;
  } else {
    purgePointerRef.x += (dx / distance) * maxStep;
    purgePointerRef.y += (dy / distance) * maxStep;
  }

  purgePointerRef.active = true;
}

export function getDevAutoplaySnapshot(): DevAutoplaySnapshot {
  return { ...state };
}

export function isDevAutoplayActive(): boolean {
  return state.active;
}

/** Pendant le playtest robot, la souris joueur ne doit pas piloter la zone de purge. */
export function isDevAutoplayPurgeInputLocked(): boolean {
  return state.active;
}

export function isDevAutoplayPendingStart(): boolean {
  return state.pendingStart;
}

export function requestDevAutoplayStart(): void {
  state.pendingStart = true;
  state.stopReason = null;
  state.lastOutcome = null;
  state.awaitingSnapshot = false;
  state.statusLine = 'Démarrage…';
  notifyChange();
}

export function activateDevAutoplay(bounds: ScreenBounds): void {
  const center = fallbackAim(bounds);
  aimX = center.x;
  aimY = center.y;
  aimJitterX = 0;
  aimJitterY = 0;
  jitterTargetX = 0;
  jitterTargetY = 0;
  stickyCorruptSeed = null;
  nextRetargetAt = 0;
  state.retargetCount = 0;
  state.active = true;
  state.pendingStart = false;
  state.stopReason = null;
  state.awaitingSnapshot = false;
  state.statusLine = 'Robot actif — purge automatique';
  purgePointerRef.x = aimX;
  purgePointerRef.y = aimY;
  purgePointerRef.active = true;
  notifyChange();
}

export function stopDevAutoplay(options?: {
  reason?: DevAutoplayStopReason;
  outcome?: RunOutcome | null;
}): void {
  const reason = options?.reason ?? 'manual';
  state.active = false;
  state.pendingStart = false;
  state.stopReason = reason;
  state.lastOutcome = options?.outcome ?? null;
  stickyCorruptSeed = null;

  if (reason === 'run_end') {
    state.awaitingSnapshot = true;
    state.statusLine =
      options?.outcome === 'victory_boss'
        ? 'Run terminée (victoire) — snapshot prêt'
        : 'Run terminée (Meltdown) — snapshot prêt';
  } else if (reason === 'aborted') {
    state.awaitingSnapshot = false;
    state.statusLine = 'Run abandonnée';
  } else {
    state.awaitingSnapshot = false;
    state.statusLine = 'Arrêté';
  }

  notifyChange();
}

export function dismissDevAutoplaySnapshotPrompt(): void {
  state.awaitingSnapshot = false;
  state.statusLine = 'Arrêté';
  notifyChange();
}

export function tickDevAutoplay(
  enemies: readonly DissipationNode[],
  deltaMs: number,
  bounds: ScreenBounds,
): void {
  if (!state.active) return;

  const jitterBlend = expSmoothingFactor(deltaMs, 220);
  aimJitterX += (jitterTargetX - aimJitterX) * jitterBlend;
  aimJitterY += (jitterTargetY - aimJitterY) * jitterBlend;

  const target = pickTarget(enemies, purgePointerRef.x, purgePointerRef.y);
  const aimFollow = expSmoothingFactor(deltaMs, AIM_FOLLOW_SMOOTH_MS);

  if (target) {
    const desiredX = target.x + aimJitterX;
    const desiredY = target.y + aimJitterY;
    aimX += (desiredX - aimX) * aimFollow;
    aimY += (desiredY - aimY) * aimFollow;
  } else {
    stickyCorruptSeed = null;
    const center = fallbackAim(bounds);
    aimX += (center.x - aimX) * aimFollow;
    aimY += (center.y - aimY) * aimFollow;
  }

  moveCursorToward(aimX, aimY, deltaMs);
}
