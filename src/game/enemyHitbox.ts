import {
  CORE_RADIUS,
  getEnemyHexRadius,
  type Vec2,
} from './constants';
import { isPointInFlatTopHex } from './hexUtils';
import type { DissipationNode } from './types';

export function isParticleHittingEnemy(
  px: number,
  py: number,
  particleRadius: number,
  node: DissipationNode,
  hitBonus: number,
): boolean {
  const padding = particleRadius + hitBonus;
  const radius = getEnemyHexRadius(node.tier, node.isBoss);
  return isPointInFlatTopHex(px, py, node.x, node.y, radius, padding);
}

export function isEnemyHittingCore(node: DissipationNode, core: Vec2): boolean {
  const enemyRadius = getEnemyHexRadius(node.tier, node.isBoss);
  const dx = node.x - core.x;
  const dy = node.y - core.y;
  const hitRadius = CORE_RADIUS + enemyRadius * 0.85;
  return dx * dx + dy * dy <= hitRadius * hitRadius;
}
