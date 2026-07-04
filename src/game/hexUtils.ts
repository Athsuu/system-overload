/** Géométrie hex flat-top pour Pixi (couche game — pas de dépendance UI). */

const HEX_START_ANGLE = 0;

export interface HexPoint {
  x: number;
  y: number;
}

export function getFlatTopHexVertices(cx: number, cy: number, radius: number): HexPoint[] {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = HEX_START_ANGLE + (i * Math.PI) / 3;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
}

export function isPointInFlatTopHex(
  px: number,
  py: number,
  cx: number,
  cy: number,
  radius: number,
  padding = 0,
): boolean {
  const dx = Math.abs(px - cx);
  const dy = Math.abs(py - cy);
  const r = radius + padding;
  if (dy > r * (Math.sqrt(3) / 2)) return false;
  return dx <= r - dy / Math.sqrt(3);
}
