/**
 * NODE-ALPHA — Corrupted Process (#8b5cf6 / #22d3ee)
 */
import type { Graphics } from 'pixi.js';
import { FillGradient } from 'pixi.js';
import { DARK_HEX_PIXI } from '../theme/darkHexTerminal';
import { FLASH_DURATION_MS, getEnemyHexRadius } from './constants';
import { drawRotatedFlatTopHexFillGradient, drawRotatedFlatTopHexStroke } from './hexDraw';
import type { GameEffect } from './effects';
import type { DissipationNode } from './types';

const NODE_VIOLET = DARK_HEX_PIXI.corruptViolet;
const NODE_CYAN = DARK_HEX_PIXI.corruptCyan;
const VIOLET_DEEP = 0x4c1d95;
const VIOLET_DARK = 0x5b21b6;
const VIOLET_BRIGHT = 0xa78bfa;

const SATELLITE_ORBIT_PERIOD_S = 36 / 1.3 / 1.44;
const HEX_FRAME_PERIOD_S = 52 / 1.44;
const SATELLITE_ANGLES = [-Math.PI / 3, Math.PI / 3] as const;
const HEX_BAND_SCALE = 0.5136;
const CORE_SCALE = 0.085 * 1.3 * 1.2;
const BOSS_CORE_SCALE = 0.1 * 1.3 * 1.2;
const CORRUPT_GRAIN_COUNT = 10;
const BOSS_GRAIN_COUNT = 14;
const SCANLINE_COUNT = 5;

const HEX_BAND_GRADIENT = new FillGradient({
  type: 'radial',
  center: { x: 0.5, y: 0.45 },
  innerRadius: 0,
  outerCenter: { x: 0.5, y: 0.5 },
  outerRadius: 0.5,
  colorStops: [
    { offset: 0.42, color: 'rgba(76, 29, 149, 0.92)' },
    { offset: 0.68, color: 'rgba(139, 92, 246, 1)' },
    { offset: 0.88, color: 'rgba(167, 139, 250, 0.55)' },
    { offset: 1, color: 'rgba(49, 16, 96, 0.95)' },
  ],
  textureSpace: 'local',
});

const BOSS_HEX_BAND_GRADIENT = new FillGradient({
  type: 'radial',
  center: { x: 0.5, y: 0.45 },
  innerRadius: 0,
  outerCenter: { x: 0.5, y: 0.5 },
  outerRadius: 0.5,
  colorStops: [
    { offset: 0.4, color: 'rgba(80, 20, 8, 0.95)' },
    { offset: 0.65, color: 'rgba(255, 77, 0, 0.75)' },
    { offset: 0.85, color: 'rgba(139, 92, 246, 0.45)' },
    { offset: 1, color: 'rgba(40, 10, 4, 0.95)' },
  ],
  textureSpace: 'local',
});

const VOID_GRADIENT = new FillGradient({
  type: 'radial',
  center: { x: 0.5, y: 0.5 },
  innerRadius: 0,
  outerCenter: { x: 0.5, y: 0.5 },
  outerRadius: 0.5,
  colorStops: [
    { offset: 0, color: 'rgba(1, 0, 6, 1)' },
    { offset: 0.55, color: 'rgba(6, 2, 14, 1)' },
    { offset: 0.85, color: 'rgba(14, 6, 28, 0.92)' },
    { offset: 1, color: 'rgba(22, 10, 38, 0.75)' },
  ],
  textureSpace: 'local',
});

const CORE_BLOOM_GRADIENT = new FillGradient({
  type: 'radial',
  center: { x: 0.5, y: 0.48 },
  innerRadius: 0,
  outerCenter: { x: 0.5, y: 0.5 },
  outerRadius: 0.5,
  colorStops: [
    { offset: 0, color: 'rgba(255, 255, 255, 0.98)' },
    { offset: 0.15, color: 'rgba(34, 211, 238, 0.9)' },
    { offset: 0.5, color: 'rgba(34, 211, 238, 0.2)' },
    { offset: 1, color: 'rgba(34, 211, 238, 0)' },
  ],
  textureSpace: 'local',
});

const BOSS_CORE_GRADIENT = new FillGradient({
  type: 'radial',
  center: { x: 0.5, y: 0.5 },
  innerRadius: 0,
  outerCenter: { x: 0.5, y: 0.5 },
  outerRadius: 0.5,
  colorStops: [
    { offset: 0, color: 'rgba(255, 200, 120, 1)' },
    { offset: 0.4, color: 'rgba(255, 107, 43, 0.6)' },
    { offset: 1, color: 'rgba(255, 77, 0, 0)' },
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
    { offset: 0, color: 'rgba(255, 255, 255, 0.9)' },
    { offset: 0.4, color: 'rgba(34, 211, 238, 0.45)' },
    { offset: 1, color: 'rgba(34, 211, 238, 0)' },
  ],
  textureSpace: 'local',
});

export function tickCorruptProcessAnim(nodes: DissipationNode[], deltaMs: number): void {
  if (deltaMs <= 0) return;
  const satelliteDelta = (deltaMs * 0.001 * (Math.PI * 2)) / SATELLITE_ORBIT_PERIOD_S;
  const hexDelta = (deltaMs * 0.001 * (Math.PI * 2)) / HEX_FRAME_PERIOD_S;
  for (const node of nodes) {
    node.satelliteAngle += satelliteDelta;
    node.hexAngle += hexDelta;
    if (node.flashTimer > 0) {
      node.flashTimer = Math.max(0, node.flashTimer - deltaMs);
    }
  }
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

function getHexBandRadii(radius: number, isBoss: boolean): { outerHexR: number; innerCircleR: number } {
  const outerHexR = radius * (isBoss ? 0.94 : 0.92);
  const bandRadial = (outerHexR / radius - (isBoss ? 0.5 : 0.48)) * HEX_BAND_SCALE;
  return { outerHexR, innerCircleR: outerHexR - bandRadial * radius };
}

function corruptHash(seed: number, index: number): number {
  const t = Math.sin(seed * 127.1 + index * 311.7) * 43758.5453;
  return t - Math.floor(t);
}

function drawCorruptGrain(
  graphics: Graphics,
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  seed: number,
  hexAngle: number,
  isBoss: boolean,
): void {
  const count = isBoss ? BOSS_GRAIN_COUNT : CORRUPT_GRAIN_COUNT;
  const band = outerR - innerR;
  if (band <= 1) return;

  for (let i = 0; i < count; i += 1) {
    const angle = corruptHash(seed, i) * Math.PI * 2 + hexAngle * 0.015;
    const radialT = 0.12 + corruptHash(seed, i + 17) * 0.76;
    const r = innerR + band * radialT;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    const len = 1.4 + corruptHash(seed, i + 33) * 3.6;
    const segAngle = angle + (corruptHash(seed, i + 51) - 0.5) * 1.1;
    const flicker = 0.85 + Math.sin(hexAngle * 6 + seed + i * 2.1) * 0.15;
    const useCyan = corruptHash(seed, i + 69) > 0.68;

    graphics.moveTo(px, py);
    graphics.lineTo(px + Math.cos(segAngle) * len, py + Math.sin(segAngle) * len);
    graphics.stroke({
      color: useCyan ? NODE_CYAN : isBoss ? DARK_HEX_PIXI.breachGlow : VIOLET_BRIGHT,
      width: 0.75,
      alpha: (0.1 + corruptHash(seed, i + 88) * 0.22) * flicker,
    });
  }
}

function drawVoidScanlines(
  graphics: Graphics,
  cx: number,
  cy: number,
  innerR: number,
  hexAngle: number,
  seed: number,
): void {
  const spacing = innerR * 0.24;
  const scroll = ((hexAngle / (Math.PI * 2)) % 1) * spacing;

  for (let i = -SCANLINE_COUNT; i <= SCANLINE_COUNT; i += 1) {
    const y = cy + i * spacing + scroll;
    const dy = y - cy;
    if (Math.abs(dy) >= innerR - 0.5) continue;

    const halfW = Math.sqrt(innerR * innerR - dy * dy);
    const glitch =
      Math.sin(hexAngle * 11 + seed + i * 1.7) > 0.93
        ? (corruptHash(seed, i + 120) - 0.5) * 5
        : 0;
    const alpha = 0.06 + corruptHash(seed, i + 140) * 0.09;
    const color = i % 2 === 0 ? NODE_CYAN : VIOLET_DARK;

    graphics.moveTo(cx - halfW, y + glitch);
    graphics.lineTo(cx + halfW, y + glitch);
    graphics.stroke({ color, width: 0.7, alpha });
  }
}

function drawHexVertexGlitches(
  graphics: Graphics,
  cx: number,
  cy: number,
  outerHexR: number,
  hexAngle: number,
  seed: number,
  isBoss: boolean,
): void {
  for (let i = 0; i < 6; i += 1) {
    const angle = hexAngle + (i * Math.PI) / 3;
    const vx = cx + Math.cos(angle) * outerHexR;
    const vy = cy + Math.sin(angle) * outerHexR;
    const tickLen = 2.5 + corruptHash(seed, i + 200) * 2;
    const nx = Math.cos(angle);
    const ny = Math.sin(angle);
    const jitter = Math.sin(hexAngle * 8 + seed + i) > 0.88 ? corruptHash(seed, i + 210) * 2 : 0;

    graphics.moveTo(vx - nx * tickLen + ny * jitter, vy - ny * tickLen - nx * jitter);
    graphics.lineTo(vx + nx * (tickLen * 0.35), vy + ny * (tickLen * 0.35));
    graphics.stroke({
      color: isBoss ? DARK_HEX_PIXI.breachGlow : VIOLET_BRIGHT,
      width: 1,
      alpha: 0.22 + corruptHash(seed, i + 220) * 0.2,
    });
  }
}

function drawHexFrame(
  graphics: Graphics,
  cx: number,
  cy: number,
  radius: number,
  hexAngle: number,
  hpRatio: number,
  isBoss: boolean,
  corruptSeed: number,
): void {
  const { outerHexR, innerCircleR } = getHexBandRadii(radius, isBoss);
  const ringAlpha = 0.6 + hpRatio * 0.35;
  const ringColor = isBoss ? DARK_HEX_PIXI.breach : NODE_VIOLET;
  const bandGradient = isBoss ? BOSS_HEX_BAND_GRADIENT : HEX_BAND_GRADIENT;

  drawRotatedFlatTopHexFillGradient(graphics, cx, cy, outerHexR, hexAngle, bandGradient, ringAlpha);
  drawRadialFill(graphics, cx, cy, innerCircleR, VOID_GRADIENT, 1);
  drawCorruptGrain(graphics, cx, cy, innerCircleR, outerHexR, corruptSeed, hexAngle, isBoss);
  drawVoidScanlines(graphics, cx, cy, innerCircleR, hexAngle, corruptSeed);

  drawRotatedFlatTopHexStroke(
    graphics,
    cx,
    cy,
    outerHexR,
    hexAngle,
    ringColor,
    1.5,
    ringAlpha * 0.62,
    'butt',
    'miter',
  );
  drawRotatedFlatTopHexStroke(
    graphics,
    cx,
    cy,
    outerHexR * 0.96,
    hexAngle,
    isBoss ? VIOLET_DARK : VIOLET_DEEP,
    0.75,
    ringAlpha * 0.35,
    'butt',
    'miter',
  );
  drawHexVertexGlitches(graphics, cx, cy, outerHexR, hexAngle, corruptSeed, isBoss);

  graphics.circle(cx, cy, innerCircleR);
  graphics.stroke({ color: isBoss ? DARK_HEX_PIXI.breachGlow : NODE_CYAN, width: 0.75, alpha: ringAlpha * 0.12 });
}

function drawCore(
  graphics: Graphics,
  cx: number,
  cy: number,
  radius: number,
  hpRatio: number,
  isBoss: boolean,
  flashRatio: number,
): void {
  const baseCoreR = radius * (isBoss ? BOSS_CORE_SCALE : CORE_SCALE);
  const coreR = baseCoreR * hpRatio;
  if (coreR <= 0.35) return;

  const intensity = 0.82;
  const hitGlow = flashRatio ** 1.4;

  if (isBoss) {
    drawRadialFill(
      graphics,
      cx,
      cy,
      coreR * (2.8 + hitGlow * 1.6),
      BOSS_CORE_GRADIENT,
      intensity * 0.65 + hitGlow * 0.4,
    );
    graphics.circle(cx, cy, coreR);
    graphics.fill({ color: DARK_HEX_PIXI.breachGlow, alpha: 0.95 });
    return;
  }

  drawRadialFill(
    graphics,
    cx,
    cy,
    coreR * (3.2 + hitGlow * 2.2),
    CORE_BLOOM_GRADIENT,
    intensity * 0.55 + hitGlow * 0.5,
  );
  drawRadialFill(
    graphics,
    cx,
    cy,
    coreR * (1.15 + hitGlow * 0.9),
    CORE_BLOOM_GRADIENT,
    intensity + hitGlow * 0.35,
  );
  graphics.circle(cx, cy, coreR);
  graphics.fill({ color: NODE_CYAN, alpha: 1 });
}

function drawSatellites(
  graphics: Graphics,
  cx: number,
  cy: number,
  radius: number,
  orbitAngle: number,
  hpRatio: number,
): void {
  const orbitR = radius * 0.38;
  const dotR = 2.1;

  graphics.circle(cx, cy, orbitR);
  graphics.stroke({ color: NODE_CYAN, width: 1, alpha: 0.25 + hpRatio * 0.2 });

  for (const offset of SATELLITE_ANGLES) {
    const angle = orbitAngle + offset;
    const sx = cx + Math.cos(angle) * orbitR;
    const sy = cy + Math.sin(angle) * orbitR;
    graphics.circle(sx, sy, dotR * 2.2);
    graphics.fill({ color: NODE_CYAN, alpha: 0.12 * hpRatio });
    graphics.circle(sx, sy, dotR);
    graphics.fill({ color: NODE_CYAN, alpha: 0.9 });
  }
}

function drawHitFeedback(
  graphics: Graphics,
  cx: number,
  cy: number,
  radius: number,
  flashAlpha: number,
  isBoss: boolean,
  hpRatio: number,
): void {
  const ease = flashAlpha ** 1.6;
  const coreRef = radius * (isBoss ? BOSS_CORE_SCALE : CORE_SCALE) * hpRatio;
  if (coreRef <= 0.35) return;
  drawRadialFill(graphics, cx, cy, coreRef * 6, HIT_BURST_GRADIENT, ease * 1);
  drawRadialFill(graphics, cx, cy, coreRef * 3, HIT_BURST_GRADIENT, ease * 0.85);
}

export function drawCorruptedProcess(graphics: Graphics, node: DissipationNode): void {
  const radius = getEnemyHexRadius(node.waveIndex, node.isBoss ?? false);
  const hpRatio = Math.max(0, node.hp / node.maxHp);
  const isBoss = node.isBoss ?? false;

  const flashRatio = node.flashTimer > 0 ? node.flashTimer / FLASH_DURATION_MS : 0;

  drawHexFrame(graphics, node.x, node.y, radius, node.hexAngle, hpRatio, isBoss, node.corruptSeed);
  drawCore(graphics, node.x, node.y, radius, hpRatio, isBoss, flashRatio);
  drawSatellites(graphics, node.x, node.y, radius, node.satelliteAngle, hpRatio);

  if (flashRatio > 0) {
    drawHitFeedback(graphics, node.x, node.y, radius, flashRatio, isBoss, hpRatio);
  }
}

export function drawCorruptSpawnFlash(graphics: Graphics, effect: GameEffect): void {
  const progress = effect.elapsedMs / effect.durationMs;
  const alpha = (1 - progress) * 0.85;
  const radius = getEnemyHexRadius(effect.waveIndex, effect.isBoss) * (0.2 + progress * 0.8);

  drawRadialFill(graphics, effect.x, effect.y, radius * 0.18, CORE_BLOOM_GRADIENT, alpha);
  drawRotatedFlatTopHexStroke(
    graphics,
    effect.x,
    effect.y,
    radius * 0.9,
    0,
    NODE_VIOLET,
    radius * 0.22,
    alpha,
    'butt',
    'miter',
  );
}

export function drawCorruptDeathEffect(graphics: Graphics, effect: GameEffect): void {
  const progress = effect.elapsedMs / effect.durationMs;
  const alpha = 1 - progress;
  const radius = getEnemyHexRadius(effect.waveIndex, effect.isBoss);

  drawRadialFill(
    graphics,
    effect.x,
    effect.y,
    radius * (0.2 + progress * 0.6),
    effect.isBoss ? BOSS_CORE_GRADIENT : CORE_BLOOM_GRADIENT,
    alpha * 0.45,
  );
  drawRotatedFlatTopHexStroke(
    graphics,
    effect.x,
    effect.y,
    radius * (0.9 + progress * 0.3),
    0,
    NODE_VIOLET,
    radius * 0.16,
    alpha * 0.7,
    'butt',
    'miter',
  );
}
