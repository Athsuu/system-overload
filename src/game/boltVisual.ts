import type { Graphics } from 'pixi.js';
import { DARK_HEX_PIXI } from '../theme/darkHexTerminal';
import {
  BOLT_BASE_RADIUS,
  BOLT_FADE_MARGIN,
  PARTICLE_COLOR,
  PARTICLE_GLOW,
  type ScreenBounds,
} from './constants';
import { drawRotatedFlatTopHexFill, drawRotatedFlatTopHexStroke } from './hexDraw';
import type { Particle } from './types';

/** Flat-top hex « point forward » : rotation alignée sur la vélocité. */
export function getBoltRotation(vx: number, vy: number): number {
  return Math.atan2(vy, vx) + Math.PI / 2;
}

export function computeBoltEdgeFade(
  x: number,
  y: number,
  bounds: ScreenBounds,
): number {
  const left = bounds.padding;
  const right = bounds.width - bounds.padding;
  const top = bounds.padding;
  const bottom = bounds.height - bounds.padding;
  const minDist = Math.min(x - left, right - x, y - top, bottom - y);

  if (minDist >= BOLT_FADE_MARGIN) return 1;
  if (minDist <= 0) return 0;
  return minDist / BOLT_FADE_MARGIN;
}

function getBoltRadius(particle: Particle): number {
  let radius = BOLT_BASE_RADIUS;

  if (particle.overclockTint) {
    radius *= 1.1;
  }

  if (particle.damage > 1) {
    radius *= 1 + Math.min(0.35, (particle.damage - 1) * 0.06);
  }

  if (particle.multishotTotal > 1) {
    const centerOffset = Math.abs(particle.multishotIndex - (particle.multishotTotal - 1) / 2);
    radius *= 1 - centerOffset * 0.06;
  }

  if (particle.hitsLanded > 0) {
    radius *= 0.88;
  }

  return radius;
}

function getStrokeWidth(particle: Particle): number {
  let width = 1.5;
  if (particle.multishotTotal > 1 && particle.multishotIndex % 2 === 1) {
    width = 1.25;
  }
  if (particle.hitsLanded > 0) {
    width = 1;
  }
  return width;
}

function drawBoltHexAt(
  graphics: Graphics,
  x: number,
  y: number,
  radius: number,
  rotation: number,
  fillAlpha: number,
  strokeAlpha: number,
  strokeWidth: number,
  pierced: boolean,
): void {
  const fillColor = pierced ? DARK_HEX_PIXI.flux : PARTICLE_COLOR;
  const strokeColor = pierced ? DARK_HEX_PIXI.breachGlow : DARK_HEX_PIXI.breach;

  if (fillAlpha > 0.02) {
    drawRotatedFlatTopHexFill(graphics, x, y, radius + 2, rotation, PARTICLE_GLOW, fillAlpha * 0.22);
  }
  drawRotatedFlatTopHexFill(graphics, x, y, radius, rotation, fillColor, fillAlpha * 0.92);
  drawRotatedFlatTopHexStroke(
    graphics,
    x,
    y,
    radius,
    rotation,
    strokeColor,
    strokeWidth,
    strokeAlpha * 0.85,
  );
}

export function renderFluxBolt(graphics: Graphics, particle: Particle): void {
  const rotation = getBoltRotation(particle.vx, particle.vy);
  const alpha = particle.fadeAlpha;
  if (alpha <= 0.02) return;

  const radius = getBoltRadius(particle);
  const strokeWidth = getStrokeWidth(particle);
  const pierced = particle.hitsLanded > 0;

  const trailAlpha1 = alpha * 0.35;
  const trailAlpha2 = alpha * 0.18;

  if (particle.trailX2 !== particle.x || particle.trailY2 !== particle.y) {
    drawBoltHexAt(
      graphics,
      particle.trailX2,
      particle.trailY2,
      radius * 0.72,
      rotation,
      trailAlpha2,
      trailAlpha2 * 0.6,
      strokeWidth,
      pierced,
    );
  }

  if (particle.trailX1 !== particle.x || particle.trailY1 !== particle.y) {
    drawBoltHexAt(
      graphics,
      particle.trailX1,
      particle.trailY1,
      radius * 0.86,
      rotation,
      trailAlpha1,
      trailAlpha1 * 0.7,
      strokeWidth,
      pierced,
    );
  }

  drawBoltHexAt(graphics, particle.x, particle.y, radius, rotation, alpha, alpha, strokeWidth, pierced);

  if (particle.homingStrength > 0) {
    drawRotatedFlatTopHexStroke(
      graphics,
      particle.x,
      particle.y,
      radius + 3,
      rotation,
      DARK_HEX_PIXI.breachGlow,
      0.75,
      alpha * 0.25,
    );
  }
}

export function renderFluxBolts(graphics: Graphics, particles: Particle[]): void {
  graphics.clear();
  for (const particle of particles) {
    renderFluxBolt(graphics, particle);
  }
}
