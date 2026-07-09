import type { TreeNodeId } from '../store/moduleTree';
import { NODE0_HUB_RADIUS, HEX_CELL, NODE_RADIUS } from '../store/moduleTree';

const NODE_HEX_START_ANGLE = 0;

export interface HexVertex {
  x: number;
  y: number;
}

export interface AxialCoord {
  q: number;
  r: number;
}

export function getNodeHexRadius(id: TreeNodeId | 'core' | 'root'): number {
  if (id === 'core' || id === 'root') return NODE0_HUB_RADIUS * 0.65;
  if (id === 'node0Boot') return NODE_RADIUS * 1.2;
  return NODE_RADIUS;
}

export function getNodeHexStartAngle(_id: TreeNodeId | 'core' | 'root'): number {
  return NODE_HEX_START_ANGLE;
}

export function axialToPixel(q: number, r: number, originX: number, originY: number): HexVertex {
  return {
    x: originX + HEX_CELL * Math.sqrt(3) * (q + r / 2),
    y: originY + HEX_CELL * 1.5 * r,
  };
}

export function getHexagonVertices(
  cx: number,
  cy: number,
  radius: number,
  startAngle = NODE_HEX_START_ANGLE,
): HexVertex[] {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = startAngle + (i * Math.PI) / 3;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
}

export function hexagonPoints(cx: number, cy: number, radius: number, startAngle = NODE_HEX_START_ANGLE): string {
  return getHexagonVertices(cx, cy, radius, startAngle)
    .map((vertex) => `${vertex.x},${vertex.y}`)
    .join(' ');
}

export function getHexagonEdgePoint(
  fromX: number,
  fromY: number,
  fromRadius: number,
  toX: number,
  toY: number,
  _startAngle = NODE_HEX_START_ANGLE,
): HexVertex {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  return {
    x: fromX + fromRadius * Math.cos(angle),
    y: fromY + fromRadius * Math.sin(angle),
  };
}

export function axialDistance(a: AxialCoord, b: AxialCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}

/** Génère le path d'un petit hex pour le pattern de fond. */
export function hexPatternPath(cx: number, cy: number, radius: number): string {
  const verts = getHexagonVertices(cx, cy, radius);
  return `M ${verts[0].x} ${verts[0].y} ${verts.slice(1).map((v) => `L ${v.x} ${v.y}`).join(' ')} Z`;
}
