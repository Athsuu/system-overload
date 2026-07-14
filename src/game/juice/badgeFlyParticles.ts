import { badgeTargetRef } from './badgeTarget';

/** Particule d'aspiration ambre — pool réutilisable, aucune allocation en vague dense. */
export interface BadgeFlyParticle {
  active: boolean;
  startX: number;
  startY: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  elapsedMs: number;
  durationMs: number;
  size: number;
}

const POOL_SIZE = 48;
const MIN_DURATION_MS = 420;
const MAX_DURATION_MS = 580;
const MIN_SIZE_PX = 2.5;
const MAX_SIZE_PX = 4.5;

function createParticle(): BadgeFlyParticle {
  return {
    active: false,
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    elapsedMs: 0,
    durationMs: 0,
    size: 0,
  };
}

export function createBadgeFlyParticlePool(): BadgeFlyParticle[] {
  return Array.from({ length: POOL_SIZE }, createParticle);
}

/** Accélération progressive (ease-in) — l'aspiration démarre lente, puis fonce vers le badge. */
function easeInQuad(t: number): number {
  return t * t;
}

export function spawnBadgeFlyParticle(pool: BadgeFlyParticle[], x: number, y: number): void {
  if (!badgeTargetRef.ready) return;

  const particle = pool.find((entry) => !entry.active);
  if (!particle) return;

  particle.active = true;
  particle.startX = x;
  particle.startY = y;
  particle.x = x;
  particle.y = y;
  particle.targetX = badgeTargetRef.x;
  particle.targetY = badgeTargetRef.y;
  particle.elapsedMs = 0;
  particle.durationMs = MIN_DURATION_MS + Math.random() * (MAX_DURATION_MS - MIN_DURATION_MS);
  particle.size = MIN_SIZE_PX + Math.random() * (MAX_SIZE_PX - MIN_SIZE_PX);
}

export function tickBadgeFlyParticles(pool: BadgeFlyParticle[], deltaMs: number): void {
  for (const particle of pool) {
    if (!particle.active) continue;

    particle.elapsedMs += deltaMs;
    const progress = Math.min(1, particle.elapsedMs / particle.durationMs);
    const eased = easeInQuad(progress);

    particle.x = particle.startX + (particle.targetX - particle.startX) * eased;
    particle.y = particle.startY + (particle.targetY - particle.startY) * eased;

    if (progress >= 1) {
      particle.active = false;
    }
  }
}
