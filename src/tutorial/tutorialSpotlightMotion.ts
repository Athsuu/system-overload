import type { SpotlightFocusMetrics } from './tutorialSpotlightLayout';

/** Luna UI default move duration — spotlight glides between targets. */
export const SPOTLIGHT_MOVE_DURATION_MS = 350;

export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpSpotlightMetrics(
  from: SpotlightFocusMetrics,
  to: SpotlightFocusMetrics,
  t: number,
): SpotlightFocusMetrics {
  return {
    cx: lerp(from.cx, to.cx, t),
    cy: lerp(from.cy, to.cy, t),
    rx: lerp(from.rx, to.rx, t),
    ry: lerp(from.ry, to.ry, t),
  };
}
