import type { UpgradeId } from '../store/upgradeCatalog';
import { CORE_RADIUS, HEX_CELL, NODE_RADIUS } from '../store/skillTree';

/** Hexagone à plat (bord supérieur horizontal). */
const HEX_START_ANGLE = 0;

export interface HexVertex {
  x: number;
  y: number;
}

export interface AxialCoord {
  q: number;
  r: number;
}

export function getNodeHexRadius(id: UpgradeId | 'core'): number {
  return id === 'core' ? CORE_RADIUS : NODE_RADIUS;
}

export function axialToPixel(q: number, r: number, originX: number, originY: number): HexVertex {
  return {
    x: originX + HEX_CELL * Math.sqrt(3) * (q + r / 2),
    y: originY + HEX_CELL * 1.5 * r,
  };
}

export function getHexagonVertices(cx: number, cy: number, radius: number): HexVertex[] {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = HEX_START_ANGLE + (i * Math.PI) / 3;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
}

export function hexagonPoints(cx: number, cy: number, radius: number): string {
  return getHexagonVertices(cx, cy, radius)
    .map((v) => `${v.x},${v.y}`)
    .join(' ');
}

function raySegmentHit(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number | null {
  const ex = x2 - x1;
  const ey = y2 - y1;
  const denom = dx * ey - dy * ex;
  if (Math.abs(denom) < 1e-9) return null;

  const t = ((x1 - ox) * ey - (y1 - oy) * ex) / denom;
  const u = ((x1 - ox) * dy - (y1 - oy) * dx) / denom;
  if (t >= 0 && u >= 0 && u <= 1) return t;
  return null;
}

/** Point sur le bord de l'hexagone, dans la direction d'une cible. */
export function getHexagonEdgePoint(
  cx: number,
  cy: number,
  radius: number,
  targetX: number,
  targetY: number,
): HexVertex {
  const dx = targetX - cx;
  const dy = targetY - cy;
  const len = Math.hypot(dx, dy);
  const vertices = getHexagonVertices(cx, cy, radius);

  if (len < 1e-6) return vertices[5];

  const ux = dx / len;
  const uy = dy / len;

  let bestT = Infinity;
  for (let i = 0; i < 6; i += 1) {
    const v1 = vertices[i];
    const v2 = vertices[(i + 1) % 6];
    const t = raySegmentHit(cx, cy, ux, uy, v1.x, v1.y, v2.x, v2.y);
    if (t !== null && t > 0 && t < bestT) bestT = t;
  }

  if (bestT === Infinity) return vertices[0];
  return { x: cx + ux * bestT, y: cy + uy * bestT };
}

/** Génère le path d'un petit hex pour le pattern de fond. */
export function hexPatternPath(cx: number, cy: number, radius: number): string {
  const verts = getHexagonVertices(cx, cy, radius);
  return `M ${verts[0].x} ${verts[0].y} ${verts.slice(1).map((v) => `L ${v.x} ${v.y}`).join(' ')} Z`;
}
