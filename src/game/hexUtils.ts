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
