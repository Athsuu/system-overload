import type { ScreenBounds } from '../game/constants';
import { purgePointerRef } from '../game/purgeInput';
import { getRunConfig } from '../game/runConfig';
import { scaleDeltaMs } from '../game/runTimeScale';
import type { DissipationNode } from '../game/types';
import { useGameStore } from '../store/useGameStore';
import type { RunOutcome } from '../store/useGameStore';
import {
  DEFAULT_DEV_AUTOPLAY_SKILL,
  DEV_AUTOPLAY_SKILL_PROFILES,
  getDevAutoplaySkillProfile,
  type DevAutoplaySkillId,
  type DevAutoplaySkillProfile,
} from './devAutoplayProfiles';

export const DEV_AUTOPLAY_EVENT = 'dev-autoplay-change';

/** Leak progress au-delà duquel on priorise la fuite (mix PO). */
const CRITICAL_LEAK_PROGRESS = 0.55;
const CRITICAL_LEAK_MULT = 3.2;
/** Score de base : un ennemi frais vaut toujours la chasse (évite le camping centre). */
const BASE_ENGAGE_SCORE = 48;
const BOSS_SCORE_BONUS = 55;
const BOSS_PHASE_EXTRA = 30;
const LOW_HP_SCORE_BONUS = 22;
/** Soft cover : score décroît jusqu’à ce multiple du rayon. */
const SOFT_COVER_RADIUS_MULT = 3.2;
/** Max candidats évalués (perf). */
const MAX_CANDIDATES = 10;
const TOP_THREAT_COUNT = 6;
/** Si on tape déjà la sticky, hystérésis plus haute. */
const ENGAGED_HYSTERESIS_MULT = 3.5;

export type DevAutoplayStopReason = 'manual' | 'run_end' | 'aborted';

export interface DevAutoplaySnapshot {
  active: boolean;
  pendingStart: boolean;
  statusLine: string;
  stopReason: DevAutoplayStopReason | null;
  lastOutcome: RunOutcome | null;
  awaitingSnapshot: boolean;
  retargetCount: number;
  skillId: DevAutoplaySkillId;
  avgEnemiesInRadius: number;
  estimatedCoverage: number;
}

interface AimCandidate {
  x: number;
  y: number;
  corruptSeed: number | null;
}

const state: DevAutoplaySnapshot = {
  active: false,
  pendingStart: false,
  statusLine: 'Arrêté',
  stopReason: null,
  lastOutcome: null,
  awaitingSnapshot: false,
  retargetCount: 0,
  skillId: DEFAULT_DEV_AUTOPLAY_SKILL,
  avgEnemiesInRadius: 0,
  estimatedCoverage: 0,
};

let aimX = 0;
let aimY = 0;
let aimJitterX = 0;
let aimJitterY = 0;
let jitterTargetX = 0;
let jitterTargetY = 0;
let nextRetargetAt = 0;
let stickyCorruptSeed: number | null = null;
let cachedPurgeRadius = 80;
let telemetryFrames = 0;
let telemetryHitFrames = 0;
let telemetrySumInRadius = 0;

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

function getProfile(): DevAutoplaySkillProfile {
  return getDevAutoplaySkillProfile(state.skillId);
}

function refreshPurgeRadius(): number {
  const upgrades = useGameStore.getState().upgrades;
  cachedPurgeRadius = getRunConfig(upgrades).purgeRadius;
  return cachedPurgeRadius;
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

function leakProgress(enemy: DissipationNode): number {
  return enemy.flowDistance > 0 ? enemy.distanceTraveled / enemy.flowDistance : 0;
}

function predictedPos(
  enemy: DissipationNode,
  predictSec: number,
): { x: number; y: number } {
  return {
    x: enemy.x + enemy.vx * predictSec,
    y: enemy.y + enemy.vy * predictSec,
  };
}

function hasBossAlive(enemies: readonly DissipationNode[]): boolean {
  for (const enemy of enemies) {
    if (enemy.isBossEncounter) return true;
  }
  return false;
}

function hasCriticalLeak(
  enemies: readonly DissipationNode[],
  exceptSeed: number | null,
): boolean {
  for (const enemy of enemies) {
    if (exceptSeed !== null && enemy.corruptSeed === exceptSeed) continue;
    if (leakProgress(enemy) >= CRITICAL_LEAK_PROGRESS) return true;
  }
  return false;
}

/** Menace unitaire — toujours > 0 pour un vivant (chasse dès le spawn). */
function enemyThreatScore(enemy: DissipationNode, bossAlive: boolean): number {
  const leak = leakProgress(enemy);
  let score = BASE_ENGAGE_SCORE + leak * 110;
  if (leak >= CRITICAL_LEAK_PROGRESS) {
    score *= CRITICAL_LEAK_MULT;
  }
  if (enemy.isBossEncounter) {
    score += BOSS_SCORE_BONUS + (bossAlive ? BOSS_PHASE_EXTRA : 0);
  }
  if (enemy.maxHp > 0) {
    score += (1 - enemy.hp / enemy.maxHp) * LOW_HP_SCORE_BONUS;
  }
  return score;
}

/**
 * Soft cover : plein score dans le rayon, décroissance jusqu’à SOFT_COVER_RADIUS_MULT.
 * Permet de partir vers un pack loin du centre (contrairement au hard cut V2 initial).
 */
function coverWeight(dist: number, purgeRadius: number): number {
  if (dist <= purgeRadius) return 1;
  const softMax = purgeRadius * SOFT_COVER_RADIUS_MULT;
  if (dist >= softMax) return 0;
  return 1 - (dist - purgeRadius) / (softMax - purgeRadius);
}

function scoreCandidate(
  candidate: AimCandidate,
  enemies: readonly DissipationNode[],
  cursorX: number,
  cursorY: number,
  purgeRadius: number,
  profile: DevAutoplaySkillProfile,
  bossAlive: boolean,
  suboptimal: boolean,
): number {
  let coverageSum = 0;
  let enemiesInHardRadius = 0;

  for (const enemy of enemies) {
    const pos = predictedPos(enemy, profile.aimPredictSec);
    const dist = Math.hypot(pos.x - candidate.x, pos.y - candidate.y);
    const weight = coverWeight(dist, purgeRadius);
    if (weight <= 0) continue;
    if (dist <= purgeRadius) enemiesInHardRadius += 1;
    coverageSum += enemyThreatScore(enemy, bossAlive) * weight;
  }

  // Bonus pack (plusieurs corps dans le vrai rayon).
  if (enemiesInHardRadius >= 2) {
    coverageSum += enemiesInHardRadius * 12;
  }

  // Pénalité de déplacement légère — ne doit pas battre un engage de base.
  const moveDist = Math.hypot(candidate.x - cursorX, candidate.y - cursorY);
  const movePenalty = moveDist * profile.moveCostPerPx * 0.25;

  const suboptimalNoise = suboptimal
    ? coverageSum * (0.12 + Math.random() * 0.2)
    : 0;

  return coverageSum - movePenalty - suboptimalNoise;
}

function buildCandidates(
  enemies: readonly DissipationNode[],
  profile: DevAutoplaySkillProfile,
  bossAlive: boolean,
): AimCandidate[] {
  const ranked = enemies
    .map((enemy) => ({
      enemy,
      threat: enemyThreatScore(enemy, bossAlive),
      pos: predictedPos(enemy, profile.aimPredictSec),
    }))
    .sort((a, b) => b.threat - a.threat);

  const candidates: AimCandidate[] = [];
  const pushUnique = (c: AimCandidate) => {
    if (candidates.length >= MAX_CANDIDATES) return;
    for (const existing of candidates) {
      if (Math.hypot(existing.x - c.x, existing.y - c.y) < 8) return;
    }
    candidates.push(c);
  };

  for (let i = 0; i < Math.min(TOP_THREAT_COUNT, ranked.length); i += 1) {
    const row = ranked[i];
    pushUnique({
      x: row.pos.x,
      y: row.pos.y,
      corruptSeed: row.enemy.corruptSeed,
    });
  }

  // Centroïde des menaces proches les unes des autres (vrai pack).
  const pack = ranked.slice(0, Math.min(4, ranked.length));
  if (pack.length >= 2) {
    let sx = 0;
    let sy = 0;
    for (const row of pack) {
      sx += row.pos.x;
      sy += row.pos.y;
    }
    const cx = sx / pack.length;
    const cy = sy / pack.length;
    // Ancrer le sticky sur la menace la plus urgente du pack (évite le point mort).
    pushUnique({
      x: cx,
      y: cy,
      corruptSeed: pack[0].enemy.corruptSeed,
    });
  }

  return candidates;
}

function isEngagedOn(
  enemy: DissipationNode,
  cursorX: number,
  cursorY: number,
  purgeRadius: number,
): boolean {
  return Math.hypot(enemy.x - cursorX, enemy.y - cursorY) <= purgeRadius * 0.95;
}

function pickAimCandidate(
  enemies: readonly DissipationNode[],
  cursorX: number,
  cursorY: number,
  purgeRadius: number,
  profile: DevAutoplaySkillProfile,
): AimCandidate | null {
  if (enemies.length === 0) return null;

  const now = performance.now();
  const bossAlive = hasBossAlive(enemies);
  const stickyEnemy =
    stickyCorruptSeed === null ? null : findEnemyBySeed(enemies, stickyCorruptSeed);

  // Sticky morte → forcer un nouveau choix immédiat.
  if (stickyCorruptSeed !== null && !stickyEnemy) {
    stickyCorruptSeed = null;
    nextRetargetAt = 0;
  }

  if (stickyEnemy && now < nextRetargetAt) {
    const pos = predictedPos(stickyEnemy, profile.aimPredictSec);
    return { x: pos.x, y: pos.y, corruptSeed: stickyEnemy.corruptSeed };
  }

  // Déjà en train de taper : ne switch que pour une fuite critique ailleurs.
  if (
    stickyEnemy &&
    isEngagedOn(stickyEnemy, cursorX, cursorY, purgeRadius) &&
    !hasCriticalLeak(enemies, stickyEnemy.corruptSeed)
  ) {
    nextRetargetAt =
      now + randomBetween(profile.reactionDelayMs[0], profile.reactionDelayMs[1]);
    const pos = predictedPos(stickyEnemy, profile.aimPredictSec);
    return { x: pos.x, y: pos.y, corruptSeed: stickyEnemy.corruptSeed };
  }

  const suboptimal = Math.random() < profile.suboptimalChance;
  const candidates = buildCandidates(enemies, profile, bossAlive);
  if (candidates.length === 0) return null;

  let best: AimCandidate = candidates[0];
  let bestScore = -Infinity;
  for (const candidate of candidates) {
    const score = scoreCandidate(
      candidate,
      enemies,
      cursorX,
      cursorY,
      purgeRadius,
      profile,
      bossAlive,
      suboptimal,
    );
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  if (stickyEnemy) {
    const stickyCandidate: AimCandidate = {
      x: predictedPos(stickyEnemy, profile.aimPredictSec).x,
      y: predictedPos(stickyEnemy, profile.aimPredictSec).y,
      corruptSeed: stickyEnemy.corruptSeed,
    };
    const stickyScore = scoreCandidate(
      stickyCandidate,
      enemies,
      cursorX,
      cursorY,
      purgeRadius,
      profile,
      bossAlive,
      false,
    );
    const engaged = isEngagedOn(stickyEnemy, cursorX, cursorY, purgeRadius);
    const hysteresis =
      profile.retargetHysteresis * (engaged ? ENGAGED_HYSTERESIS_MULT : 1);

    if (bestScore < stickyScore + hysteresis) {
      nextRetargetAt =
        now + randomBetween(profile.reactionDelayMs[0], profile.reactionDelayMs[1]);
      return stickyCandidate;
    }
  }

  if (best.corruptSeed !== stickyCorruptSeed) {
    stickyCorruptSeed = best.corruptSeed;
    jitterTargetX = (Math.random() - 0.5) * profile.aimJitterPx * 2;
    jitterTargetY = (Math.random() - 0.5) * profile.aimJitterPx * 2;
    state.retargetCount += 1;
  }

  nextRetargetAt =
    now + randomBetween(profile.reactionDelayMs[0], profile.reactionDelayMs[1]);

  return best;
}

function fallbackAim(bounds: ScreenBounds): { x: number; y: number } {
  return {
    x: bounds.width * 0.5,
    y: bounds.height * 0.5,
  };
}

function moveCursorToward(
  targetX: number,
  targetY: number,
  deltaMs: number,
  profile: DevAutoplaySkillProfile,
  deadZonePx: number,
): void {
  const dx = targetX - purgePointerRef.x;
  const dy = targetY - purgePointerRef.y;
  const distance = Math.hypot(dx, dy);

  if (distance <= deadZonePx) {
    purgePointerRef.active = true;
    return;
  }

  const maxStep = (profile.cursorMaxSpeedPxPerSec * deltaMs) / 1000;
  if (distance <= maxStep) {
    purgePointerRef.x = targetX;
    purgePointerRef.y = targetY;
  } else {
    purgePointerRef.x += (dx / distance) * maxStep;
    purgePointerRef.y += (dy / distance) * maxStep;
  }

  purgePointerRef.active = true;
}

function updateTelemetry(enemies: readonly DissipationNode[], purgeRadius: number): void {
  let inRadius = 0;
  for (const enemy of enemies) {
    const dist = Math.hypot(enemy.x - purgePointerRef.x, enemy.y - purgePointerRef.y);
    if (dist <= purgeRadius) inRadius += 1;
  }

  telemetryFrames += 1;
  telemetrySumInRadius += inRadius;
  if (inRadius > 0) telemetryHitFrames += 1;

  state.avgEnemiesInRadius = telemetrySumInRadius / telemetryFrames;
  state.estimatedCoverage = telemetryHitFrames / telemetryFrames;
}

function resetTelemetry(): void {
  telemetryFrames = 0;
  telemetryHitFrames = 0;
  telemetrySumInRadius = 0;
  state.avgEnemiesInRadius = 0;
  state.estimatedCoverage = 0;
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

export function getDevAutoplaySkillId(): DevAutoplaySkillId {
  return state.skillId;
}

export function setDevAutoplaySkillId(skillId: DevAutoplaySkillId): void {
  if (state.active || state.pendingStart) return;
  if (!(skillId in DEV_AUTOPLAY_SKILL_PROFILES)) return;
  state.skillId = skillId;
  notifyChange();
}

export function formatDevAutoplayTelemetry(): string {
  const profile = getProfile();
  const lines = [
    '--- Robot playtest V2 ---',
    `Skill : ${profile.label} (${state.skillId})`,
    `Retargets : ${state.retargetCount}`,
    `Couverture estimée : ${(state.estimatedCoverage * 100).toFixed(1)}%`,
    `Ennemis moy. dans rayon : ${state.avgEnemiesInRadius.toFixed(2)}`,
    `Rayon purge (cache) : ${cachedPurgeRadius.toFixed(1)}`,
    `Outcome : ${state.lastOutcome ?? 'n/a'}`,
    'Overclock auto : non (V2)',
  ];
  return lines.join('\n');
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
  resetTelemetry();
  refreshPurgeRadius();
  state.active = true;
  state.pendingStart = false;
  state.stopReason = null;
  state.awaitingSnapshot = false;
  const profile = getProfile();
  state.statusLine = `Robot actif (${profile.label}) — Utility AI`;
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
    const cov = `${(state.estimatedCoverage * 100).toFixed(0)}%`;
    state.statusLine =
      options?.outcome === 'victory_boss'
        ? `Run terminée (victoire) — cov. ${cov} — snapshot prêt`
        : `Run terminée (Meltdown) — cov. ${cov} — snapshot prêt`;
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

  const profile = getProfile();
  const tickDeltaMs = scaleDeltaMs(deltaMs);

  if (performance.now() >= nextRetargetAt || stickyCorruptSeed === null) {
    refreshPurgeRadius();
  }

  updateTelemetry(enemies, cachedPurgeRadius);

  const jitterBlend = expSmoothingFactor(tickDeltaMs, 220);
  aimJitterX += (jitterTargetX - aimJitterX) * jitterBlend;
  aimJitterY += (jitterTargetY - aimJitterY) * jitterBlend;

  const candidate = pickAimCandidate(
    enemies,
    purgePointerRef.x,
    purgePointerRef.y,
    cachedPurgeRadius,
    profile,
  );
  const aimFollow = expSmoothingFactor(tickDeltaMs, profile.aimFollowSmoothMs);

  if (candidate) {
    const desiredX = candidate.x + aimJitterX;
    const desiredY = candidate.y + aimJitterY;
    aimX += (desiredX - aimX) * aimFollow;
    aimY += (desiredY - aimY) * aimFollow;
  } else {
    stickyCorruptSeed = null;
    const center = fallbackAim(bounds);
    aimX += (center.x - aimX) * aimFollow;
    aimY += (center.y - aimY) * aimFollow;
  }

  // Dead-zone modérée : reste sur le pack sans micro-chasse, mais ne bloque pas l’approche.
  const deadZonePx = Math.max(8, cachedPurgeRadius * 0.12);
  moveCursorToward(aimX, aimY, tickDeltaMs, profile, deadZonePx);
}
