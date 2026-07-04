import type { Vec2 } from './constants';
import type { PlayerState } from './playerMovement';
import { getPlayerFallbackAimPoint, getPlayerPosition } from './playerMovement';
import type { DissipationNode } from './types';

export function findNearestNodeToPlayer(
  player: Vec2,
  nodes: DissipationNode[],
  maxRangeSq: number,
): DissipationNode | null {
  let nearest: DissipationNode | null = null;
  let nearestDistanceSq = Infinity;

  for (const node of nodes) {
    const dx = node.x - player.x;
    const dy = node.y - player.y;
    const distanceSq = dx * dx + dy * dy;

    if (distanceSq > maxRangeSq) continue;
    if (distanceSq < nearestDistanceSq) {
      nearestDistanceSq = distanceSq;
      nearest = node;
    }
  }

  return nearest;
}

export function resolveAutoFireTarget(
  player: PlayerState,
  nodes: DissipationNode[],
  acquisitionRange: number,
): Vec2 {
  const position = getPlayerPosition(player);
  const maxRangeSq = acquisitionRange * acquisitionRange;
  const nearest = findNearestNodeToPlayer(position, nodes, maxRangeSq);

  if (nearest) {
    return { x: nearest.x, y: nearest.y };
  }

  return getPlayerFallbackAimPoint(player);
}
