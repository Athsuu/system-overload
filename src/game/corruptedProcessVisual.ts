/**
 * Corrupted Process — skin Lite (violet clair, scanlines, creux HP).
 */
import type { Graphics } from 'pixi.js';
import { FillGradient } from 'pixi.js';
import { DARK_HEX_PIXI } from '../theme/darkHexTerminal';
import { FLASH_DURATION_MS } from './constants';
import { getEnemyHexRadius } from './encounter';
import {
  drawRotatedFlatTopHexFill,
  drawRotatedFlatTopHexFillGradient,
  drawRotatedFlatTopHexStroke,
} from './hexDraw';
import { getFlatTopHexVertices } from './hexUtils';
import type { GameEffect } from './effects';
import type { DissipationNode } from './types';

const HEX_FRAME_PERIOD_S = 52 / 1.44;
const SCANLINE_COUNT = 4;
const HEX_FILL_SCALE = 0.92;
const INNER_RADIUS_SCALE = 0.88;
const HP_VOID_EASE = 0.85;
const ELITE_STROKE_WIDTH = 2.5;
const NORMAL_STROKE_WIDTH = 1.5;
const SCANLINE_EDGE_INSET = 0.45;
const HALO_SCALE = 1.12;
const HALO_ALPHA = 0.2;
const VOID_RIM_WIDTH = 0.85;
const VOID_RIM_ALPHA = 0.42;

const HEX_BODY_GRADIENT = new FillGradient({
  type: 'radial',
  center: { x: 0.5, y: 0.42 },
  innerRadius: 0,
  outerCenter: { x: 0.5, y: 0.5 },
  outerRadius: 0.5,
  colorStops: [
    { offset: 0, color: 'rgba(221, 214, 254, 0.96)' },
    { offset: 0.55, color: 'rgba(179, 163, 240, 0.94)' },
    { offset: 1, color: 'rgba(96, 78, 158, 0.9)' },
  ],
  textureSpace: 'local',
});

const HIT_BURST_GRADIENT = new FillGradient({
  type: 'radial',
  center: { x: 0.5, y: 0.5 },
  innerRadius: 0,
  outerCenter: { x: 0.5, y: 0.5 },
  outerRadius: 0.5,
  colorStops: [
    { offset: 0, color: 'rgba(255, 255, 255, 0.92)' },
    { offset: 0.35, color: 'rgba(179, 163, 240, 0.45)' },
    { offset: 1, color: 'rgba(139, 92, 246, 0)' },
  ],
  textureSpace: 'local',
});

export function tickCorruptProcessAnim(nodes: DissipationNode[], deltaMs: number): void {
  if (deltaMs <= 0) return;
  const hexDelta = (deltaMs * 0.001 * (Math.PI * 2)) / HEX_FRAME_PERIOD_S;
  for (const node of nodes) {
    node.hexAngle += hexDelta;
    if (node.flashTimer > 0) {
      node.flashTimer = Math.max(0, node.flashTimer - deltaMs);
    }
  }
}

function corruptHash(seed: number, index: number): number {
  const t = Math.sin(seed * 127.1 + index * 311.7) * 43758.5453;
  return t - Math.floor(t);
}

function drawRadialFill(
  graphics: Graphics,
  cx: number,
  cy: number,
  radius: number,
  gradient: FillGradient,
  alpha: number,
): void {
  if (radius <= 0.5) return;
  graphics.circle(cx, cy, radius);
  graphics.fill({ fill: gradient, alpha });
}

function getInnerRadius(radius: number): number {
  return radius * INNER_RADIUS_SCALE;
}

function drawHpVoid(
  graphics: Graphics,
  cx: number,
  cy: number,
  innerR: number,
  hexAngle: number,
  hpRatio: number,
): void {
  const hollowT = (1 - hpRatio) ** HP_VOID_EASE;
  const voidR = innerR * hollowT;
  if (voidR <= 0.5) return;

  drawRotatedFlatTopHexFill(
    graphics,
    cx,
    cy,
    voidR,
    hexAngle,
    DARK_HEX_PIXI.corruptVoid,
    1,
  );

  const rimAlpha = VOID_RIM_ALPHA * (0.35 + hollowT * 0.65);
  drawRotatedFlatTopHexStroke(
    graphics,
    cx,
    cy,
    voidR,
    hexAngle,
    DARK_HEX_PIXI.corruptScanline,
    VOID_RIM_WIDTH,
    rimAlpha,
    'butt',
    'miter',
  );
}

function drawOuterHalo(
  graphics: Graphics,
  cx: number,
  cy: number,
  fillR: number,
  hexAngle: number,
  isElite: boolean,
): void {
  const haloR = fillR * HALO_SCALE;
  drawRotatedFlatTopHexFill(
    graphics,
    cx,
    cy,
    haloR,
    hexAngle,
    isElite ? DARK_HEX_PIXI.breachGlow : DARK_HEX_PIXI.corruptViolet,
    isElite ? HALO_ALPHA * 0.85 : HALO_ALPHA,
  );
}

function clipHorizontalToFlatTopHex(
  localY: number,
  hexR: number,
): { x1: number; x2: number } | null {
  const verts = getFlatTopHexVertices(0, 0, hexR);
  const xs: number[] = [];

  for (let i = 0; i < verts.length; i += 1) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    const yMin = Math.min(a.y, b.y);
    const yMax = Math.max(a.y, b.y);
    if (localY < yMin - 1e-6 || localY > yMax + 1e-6) continue;

    if (Math.abs(b.y - a.y) < 1e-6) {
      if (Math.abs(localY - a.y) < 1e-6) {
        xs.push(a.x, b.x);
      }
      continue;
    }

    const t = (localY - a.y) / (b.y - a.y);
    if (t >= -1e-6 && t <= 1 + 1e-6) {
      xs.push(a.x + t * (b.x - a.x));
    }
  }

  if (xs.length < 2) return null;
  xs.sort((left, right) => left - right);
  return { x1: xs[0], x2: xs[xs.length - 1] };
}

function isScanlineGlitching(seed: number, slot: number, lineIndex: number): boolean {
  const lineSpan = SCANLINE_COUNT * 2 + 1;
  const pick = (offset: number) =>
    Math.floor(corruptHash(seed, slot + offset) * lineSpan) - SCANLINE_COUNT;

  if (lineIndex === pick(11)) return true;
  return corruptHash(seed, slot + 23) > 0.5 && lineIndex === pick(29);
}

function getVoidRadius(innerR: number, hpRatio: number): number {
  const hollowT = (1 - hpRatio) ** HP_VOID_EASE;
  return innerR * hollowT;
}

function subtractVoidFromScanline(
  outer: { x1: number; x2: number },
  localY: number,
  voidR: number,
): Array<{ x1: number; x2: number }> {
  if (voidR <= 0.5) return [outer];

  const voidClip = clipHorizontalToFlatTopHex(localY, voidR);
  if (!voidClip) return [outer];

  const segments: Array<{ x1: number; x2: number }> = [];
  if (voidClip.x1 > outer.x1 + 0.5) {
    segments.push({ x1: outer.x1, x2: voidClip.x1 });
  }
  if (outer.x2 > voidClip.x2 + 0.5) {
    segments.push({ x1: voidClip.x2, x2: outer.x2 });
  }
  return segments.filter((segment) => segment.x2 - segment.x1 >= 1);
}

function drawScanlineStroke(
  graphics: Graphics,
  cx: number,
  cy: number,
  cos: number,
  sin: number,
  localY: number,
  lx1: number,
  lx2: number,
  color: number,
  width: number,
  alpha: number,
): void {
  graphics.moveTo(cx + lx1 * cos - localY * sin, cy + lx1 * sin + localY * cos);
  graphics.lineTo(cx + lx2 * cos - localY * sin, cy + lx2 * sin + localY * cos);
  graphics.stroke({ color, width, alpha });
}

function drawScanlines(
  graphics: Graphics,
  cx: number,
  cy: number,
  clipHexR: number,
  voidR: number,
  hexAngle: number,
  seed: number,
  hpRatio: number,
): void {
  const spacing = clipHexR * 0.28;
  const scroll = ((hexAngle / (Math.PI * 2)) % 1) * spacing;
  const lowHpBoost = hpRatio < 0.3 ? 1.3 : 1;
  const cos = Math.cos(hexAngle);
  const sin = Math.sin(hexAngle);
  const maxLocalY = clipHexR * (Math.sqrt(3) / 2);
  const glitchSlot = Math.floor(hexAngle * 9 + corruptHash(seed, 3) * 48);

  for (let i = -SCANLINE_COUNT; i <= SCANLINE_COUNT; i += 1) {
    const localY = i * spacing + scroll;
    if (Math.abs(localY) >= maxLocalY - 0.5) continue;

    const clip = clipHorizontalToFlatTopHex(localY, clipHexR);
    if (!clip) continue;

    const segments = subtractVoidFromScanline(clip, localY, voidR);
    if (segments.length === 0) continue;

    const isEvenLine = i % 2 === 0;
    const isGlitch = isScanlineGlitching(seed, glitchSlot, i);
    const glitch = isGlitch ? (corruptHash(seed, glitchSlot + i + 120) - 0.5) * 7 : 0;

    const baseAlpha = (isEvenLine ? 0.12 : 0.05) + corruptHash(seed, i + 140) * (isEvenLine ? 0.05 : 0.03);
    const alpha = Math.min(0.4, baseAlpha * lowHpBoost * (isGlitch ? 1.75 : 1));
    const color = isEvenLine ? DARK_HEX_PIXI.corruptScanline : DARK_HEX_PIXI.corruptScanlineDim;
    const width = isGlitch ? 0.95 : 0.7;

    for (const segment of segments) {
      const lx1 = segment.x1 + glitch + SCANLINE_EDGE_INSET;
      const lx2 = segment.x2 + glitch - SCANLINE_EDGE_INSET;
      if (lx2 - lx1 < 1) continue;

      if (isGlitch) {
        drawScanlineStroke(
          graphics,
          cx,
          cy,
          cos,
          sin,
          localY,
          lx1 - 2.2,
          lx2 - 2.2,
          DARK_HEX_PIXI.corruptVioletLite,
          0.55,
          alpha * 0.35,
        );
      }

      drawScanlineStroke(graphics, cx, cy, cos, sin, localY, lx1, lx2, color, width, alpha);
    }
  }
}

function drawHexBody(
  graphics: Graphics,
  cx: number,
  cy: number,
  radius: number,
  hexAngle: number,
  hpRatio: number,
  isElite: boolean,
  corruptSeed: number,
): void {
  const fillR = radius * HEX_FILL_SCALE;
  const innerR = getInnerRadius(radius);
  const strokeAlpha = 0.4 + hpRatio * 0.6;

  drawOuterHalo(graphics, cx, cy, fillR, hexAngle, isElite);

  drawRotatedFlatTopHexFillGradient(
    graphics,
    cx,
    cy,
    fillR,
    hexAngle,
    HEX_BODY_GRADIENT,
    0.94,
  );

  drawHpVoid(graphics, cx, cy, innerR, hexAngle, hpRatio);
  drawScanlines(
    graphics,
    cx,
    cy,
    fillR,
    getVoidRadius(innerR, hpRatio),
    hexAngle,
    corruptSeed,
    hpRatio,
  );

  drawRotatedFlatTopHexStroke(
    graphics,
    cx,
    cy,
    fillR,
    hexAngle,
    isElite ? DARK_HEX_PIXI.breachGlow : DARK_HEX_PIXI.corruptViolet,
    isElite ? ELITE_STROKE_WIDTH : NORMAL_STROKE_WIDTH,
    strokeAlpha,
    'butt',
    'miter',
  );
}

function drawHitFeedback(
  graphics: Graphics,
  cx: number,
  cy: number,
  radius: number,
  flashAlpha: number,
): void {
  const ease = flashAlpha ** 1.6;
  const burstR = radius * 0.35;
  drawRadialFill(graphics, cx, cy, burstR * 2.2, HIT_BURST_GRADIENT, ease);
  drawRadialFill(graphics, cx, cy, burstR, HIT_BURST_GRADIENT, ease * 0.85);
}

export function drawCorruptedProcess(graphics: Graphics, node: DissipationNode): void {
  const radius = getEnemyHexRadius(node.isBossEncounter);
  const hpRatio = Math.max(0, node.hp / node.maxHp);
  const isBoss = node.isBossEncounter;
  const flashRatio = node.flashTimer > 0 ? node.flashTimer / FLASH_DURATION_MS : 0;

  drawHexBody(graphics, node.x, node.y, radius, node.hexAngle, hpRatio, isBoss, node.corruptSeed);

  if (flashRatio > 0) {
    drawHitFeedback(graphics, node.x, node.y, radius, flashRatio);
  }
}

export function drawCorruptSpawnFlash(graphics: Graphics, effect: GameEffect): void {
  const progress = effect.elapsedMs / effect.durationMs;
  const alpha = (1 - progress) * 0.85;
  const radius = getEnemyHexRadius(effect.isBossEncounter) * (0.25 + progress * 0.75);
  const isBoss = effect.isBossEncounter;

  drawRotatedFlatTopHexStroke(
    graphics,
    effect.x,
    effect.y,
    radius,
    0,
    isBoss ? DARK_HEX_PIXI.breachGlow : DARK_HEX_PIXI.corruptVioletLite,
    isBoss ? ELITE_STROKE_WIDTH : NORMAL_STROKE_WIDTH,
    alpha,
    'butt',
    'miter',
  );
}

export function drawCorruptDeathEffect(graphics: Graphics, effect: GameEffect): void {
  const progress = effect.elapsedMs / effect.durationMs;
  const alpha = 1 - progress;
  const radius = getEnemyHexRadius(effect.isBossEncounter);
  const isBoss = effect.isBossEncounter;

  drawRotatedFlatTopHexFillGradient(
    graphics,
    effect.x,
    effect.y,
    radius * (0.5 + progress * 0.35),
    0,
    HEX_BODY_GRADIENT,
    alpha * 0.4,
  );
  drawRotatedFlatTopHexStroke(
    graphics,
    effect.x,
    effect.y,
    radius * (0.9 + progress * 0.35),
    0,
    isBoss ? DARK_HEX_PIXI.breachGlow : DARK_HEX_PIXI.corruptViolet,
    isBoss ? ELITE_STROKE_WIDTH : NORMAL_STROKE_WIDTH,
    alpha * 0.75,
    'butt',
    'miter',
  );
}
