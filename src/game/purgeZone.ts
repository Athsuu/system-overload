import type { Graphics } from 'pixi.js';
import { DARK_HEX_PIXI } from '../theme/darkHexTerminal';
import { getEnemyHexRadius } from './constants';
import type { DissipationNode } from './types';

const SHAKE_AMPLITUDE_PX = 9.5;
const SHAKE_SECONDARY_RATIO = 0.62;
const SHAKE_DURATION_RATIO = 0.85;
const SHAKE_MIN_MS = 70;
const SHAKE_MAX_MS = 200;
const SCANLINE_SPACING_PX = 4;

export interface PurgeVisualShake {
  remainingMs: number;
  durationMs: number;
  angle: number;
}

export function createPurgeVisualShake(): PurgeVisualShake {
  return { remainingMs: 0, durationMs: 1, angle: 0 };
}

export function triggerPurgeVisualShake(shake: PurgeVisualShake, intervalMs: number): void {
  shake.durationMs = Math.min(SHAKE_MAX_MS, Math.max(SHAKE_MIN_MS, intervalMs * SHAKE_DURATION_RATIO));
  shake.remainingMs = shake.durationMs;
  shake.angle = Math.random() * Math.PI * 2;
}

export function tickPurgeVisualShake(shake: PurgeVisualShake, deltaMs: number): void {
  shake.remainingMs = Math.max(0, shake.remainingMs - deltaMs);
}

export function getPurgeVisualShake(shake: PurgeVisualShake): {
  offsetX: number;
  offsetY: number;
  flash: number;
  ringScale: number;
} {
  if (shake.remainingMs <= 0 || shake.durationMs <= 0) {
    return { offsetX: 0, offsetY: 0, flash: 0, ringScale: 1 };
  }

  const progress = shake.remainingMs / shake.durationMs;
  const t = 1 - progress;
  const wobbleA = Math.sin(t * Math.PI * 7) * progress;
  const wobbleB = Math.sin(t * Math.PI * 11 + 0.8) * progress * SHAKE_SECONDARY_RATIO;
  const perpAngle = shake.angle + Math.PI / 2;

  return {
    offsetX:
      Math.cos(shake.angle) * SHAKE_AMPLITUDE_PX * wobbleA +
      Math.cos(perpAngle) * SHAKE_AMPLITUDE_PX * wobbleB,
    offsetY:
      Math.sin(shake.angle) * SHAKE_AMPLITUDE_PX * wobbleA +
      Math.sin(perpAngle) * SHAKE_AMPLITUDE_PX * wobbleB,
    flash: progress,
    ringScale: 1 + progress * 0.045 * Math.sin(t * Math.PI * 6),
  };
}

export function isEnemyInPurgeZone(
  node: DissipationNode,
  purgeX: number,
  purgeY: number,
  purgeRadius: number,
): boolean {
  const enemyR = getEnemyHexRadius(node.waveIndex, node.isBoss ?? false);
  const dx = node.x - purgeX;
  const dy = node.y - purgeY;
  return Math.hypot(dx, dy) <= purgeRadius + enemyR * 0.35;
}

function drawPurgeScanlines(
  graphics: Graphics,
  drawX: number,
  drawY: number,
  radius: number,
  flash: number,
): void {
  const lineAlpha = 0.07 + flash * 0.34;
  const top = drawY - radius;
  const bottom = drawY + radius;

  for (let y = top; y <= bottom; y += SCANLINE_SPACING_PX) {
    const dy = y - drawY;
    const halfWidth = Math.sqrt(Math.max(0, radius * radius - dy * dy));
    if (halfWidth < 1) continue;

    graphics.moveTo(drawX - halfWidth, y);
    graphics.lineTo(drawX + halfWidth, y);
  }

  graphics.stroke({ color: DARK_HEX_PIXI.purgeGlow, width: 1, alpha: lineAlpha });
}

/** Anneau unique + scanlines — tremblement visuel uniquement (hitbox inchangée). */
export function drawPurgeZone(
  graphics: Graphics,
  x: number,
  y: number,
  radius: number,
  shake: { offsetX: number; offsetY: number; flash: number; ringScale: number },
): void {
  if (radius <= 1) return;

  const flash = Math.max(0, Math.min(1, shake.flash));
  const drawX = x + shake.offsetX;
  const drawY = y + shake.offsetY;
  const drawRadius = radius * shake.ringScale;
  const alpha = 0.42 + flash * 0.48;
  const width = 1.2 + flash * 0.9;

  drawPurgeScanlines(graphics, drawX, drawY, drawRadius * 0.98, flash);

  graphics.circle(drawX, drawY, drawRadius);
  graphics.stroke({ color: flash > 0.35 ? DARK_HEX_PIXI.purgeGlow : DARK_HEX_PIXI.purge, width, alpha });
}
