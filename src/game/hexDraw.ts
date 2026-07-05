import type { FillGradient, Graphics } from 'pixi.js';
import { getFlatTopHexVertices, type HexPoint } from './hexUtils';

export function drawFlatTopHexStroke(
  graphics: Graphics,
  cx: number,
  cy: number,
  radius: number,
  color: number,
  width: number,
  alpha = 1,
): void {
  const vertices = getFlatTopHexVertices(cx, cy, radius);
  graphics.moveTo(vertices[0].x, vertices[0].y);
  for (let i = 1; i < vertices.length; i += 1) {
    graphics.lineTo(vertices[i].x, vertices[i].y);
  }
  graphics.closePath();
  graphics.stroke({ color, width, alpha });
}

export function drawFlatTopHexFill(
  graphics: Graphics,
  cx: number,
  cy: number,
  radius: number,
  color: number,
  alpha = 1,
): void {
  const vertices = getFlatTopHexVertices(cx, cy, radius);
  graphics.moveTo(vertices[0].x, vertices[0].y);
  for (let i = 1; i < vertices.length; i += 1) {
    graphics.lineTo(vertices[i].x, vertices[i].y);
  }
  graphics.closePath();
  graphics.fill({ color, alpha });
}

function rotateHexVertices(
  vertices: HexPoint[],
  cx: number,
  cy: number,
  rotation: number,
): HexPoint[] {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return vertices.map((vertex) => {
    const dx = vertex.x - cx;
    const dy = vertex.y - cy;
    return {
      x: cx + dx * cos - dy * sin,
      y: cy + dx * sin + dy * cos,
    };
  });
}

function drawHexPolygon(
  graphics: Graphics,
  vertices: HexPoint[],
  mode: 'fill' | 'stroke',
  color: number,
  widthOrAlpha: number,
  alpha = 1,
  cap: CanvasLineCap = 'round',
  join: CanvasLineJoin = 'round',
): void {
  graphics.moveTo(vertices[0].x, vertices[0].y);
  for (let i = 1; i < vertices.length; i += 1) {
    graphics.lineTo(vertices[i].x, vertices[i].y);
  }
  graphics.closePath();
  if (mode === 'fill') {
    graphics.fill({ color, alpha: widthOrAlpha });
    return;
  }
  graphics.stroke({ color, width: widthOrAlpha, alpha, cap, join });
}

export function drawRotatedFlatTopHexFill(
  graphics: Graphics,
  cx: number,
  cy: number,
  radius: number,
  rotation: number,
  color: number,
  alpha = 1,
): void {
  const vertices = rotateHexVertices(getFlatTopHexVertices(cx, cy, radius), cx, cy, rotation);
  drawHexPolygon(graphics, vertices, 'fill', color, alpha);
}

export function drawRotatedFlatTopHexFillGradient(
  graphics: Graphics,
  cx: number,
  cy: number,
  radius: number,
  rotation: number,
  gradient: FillGradient,
  alpha = 1,
): void {
  const vertices = rotateHexVertices(getFlatTopHexVertices(cx, cy, radius), cx, cy, rotation);
  graphics.moveTo(vertices[0].x, vertices[0].y);
  for (let i = 1; i < vertices.length; i += 1) {
    graphics.lineTo(vertices[i].x, vertices[i].y);
  }
  graphics.closePath();
  graphics.fill({ fill: gradient, alpha });
}

export function drawRotatedFlatTopHexStroke(
  graphics: Graphics,
  cx: number,
  cy: number,
  radius: number,
  rotation: number,
  color: number,
  width: number,
  alpha = 1,
  cap: CanvasLineCap = 'round',
  join: CanvasLineJoin = 'round',
): void {
  const vertices = rotateHexVertices(getFlatTopHexVertices(cx, cy, radius), cx, cy, rotation);
  drawHexPolygon(graphics, vertices, 'stroke', color, width, alpha, cap, join);
}
