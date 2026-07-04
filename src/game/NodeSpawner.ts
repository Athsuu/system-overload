import { spawnEnemyOnEdge } from './enemyMovement';
import type { RunConfig } from './runConfig';
import { type ScreenBounds, type Vec2 } from './constants';
import type { DissipationNode } from './types';

export function tickNodeFlashes(nodes: DissipationNode[], deltaMS: number): void {
  for (const node of nodes) {
    if (node.flashTimer > 0) {
      node.flashTimer = Math.max(0, node.flashTimer - deltaMS);
    }
  }
}

export function spawnStarterNodes(
  count: number,
  center: Vec2,
  nodes: DissipationNode[],
  bounds: ScreenBounds,
  config: RunConfig,
): void {
  for (let index = 0; index < count; index += 1) {
    nodes.push(
      spawnEnemyOnEdge(center, bounds, config, {
        tier: 0,
        waveIndex: 1,
      }),
    );
  }
}
