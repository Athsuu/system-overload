import type { Graphics } from 'pixi.js';
import { getFlatTopHexVertices, type HexPoint } from './hexUtils';

function clipPolygonAtOrAboveY(vertices: HexPoint[], lineY: number): HexPoint[] {
  const clipped: HexPoint[] = [];

  for (let i = 0; i < vertices.length; i += 1) {
    const current = vertices[i];
    const next = vertices[(i + 1) % vertices.length];
    const currentInside = current.y >= lineY;
    const nextInside = next.y >= lineY;

    if (currentInside) {
      clipped.push(current);
    }

    if (currentInside !== nextInside) {
      const deltaY = next.y - current.y;
      if (Math.abs(deltaY) > 1e-6) {
        const t = (lineY - current.y) / deltaY;
        clipped.push({
          x: current.x + t * (next.x - current.x),
          y: lineY,
        });
      }
    }
  }

  return clipped;
}

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

/** Jauge HP : remplissage hexagonal clipé de bas en haut. */
export function drawFlatTopHexHpFill(
  graphics: Graphics,
  cx: number,
  cy: number,
  radius: number,
  hpRatio: number,
  color: number,
): void {
  const inner = radius - 3;
  const ratio = Math.max(0, Math.min(1, hpRatio));
  if (ratio <= 0) return;

  const halfH = (inner * Math.sqrt(3)) / 2;
  const bottomY = cy + halfH;
  const topY = cy - halfH;
  const fillLineY = bottomY - (bottomY - topY) * ratio;

  const clipped = clipPolygonAtOrAboveY(getFlatTopHexVertices(cx, cy, inner), fillLineY);
  if (clipped.length < 3) return;

  graphics.moveTo(clipped[0].x, clipped[0].y);
  for (let i = 1; i < clipped.length; i += 1) {
    graphics.lineTo(clipped[i].x, clipped[i].y);
  }
  graphics.closePath();
  graphics.fill({ color });
}
