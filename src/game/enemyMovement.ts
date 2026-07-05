import type { ScreenBounds, Vec2 } from './constants';
import {
  getEnemyMaxHp,
  getEnemySpeed,
  type RunConfig,
} from './runConfig';
import { isEnemyHittingCore } from './enemyHitbox';
import type { DissipationNode } from './types';

function pickEdgeSpawn(bounds: ScreenBounds): Vec2 {
  const edge = Math.floor(Math.random() * 4);
  const pad = bounds.padding;
  const w = bounds.width;
  const h = bounds.height;

  switch (edge) {
    case 0:
      return { x: pad + Math.random() * (w - pad * 2), y: pad };
    case 1:
      return { x: pad + Math.random() * (w - pad * 2), y: h - pad };
    case 2:
      return { x: pad, y: pad + Math.random() * (h - pad * 2) };
    default:
      return { x: w - pad, y: pad + Math.random() * (h - pad * 2) };
  }
}

export interface SpawnEnemyOptions {
  tier: number;
  waveIndex: number;
  isBoss?: boolean;
  bossHpMult?: number;
  bossSpeedMult?: number;
}

export function spawnEnemyOnEdge(
  bounds: ScreenBounds,
  config: RunConfig,
  options: SpawnEnemyOptions,
): DissipationNode {
  const { tier, waveIndex, isBoss, bossHpMult = 1, bossSpeedMult = 1 } = options;
  const spawnPos = pickEdgeSpawn(bounds);
  const speed = getEnemySpeed(config, tier, waveIndex, bossSpeedMult);
  const maxHp = getEnemyMaxHp(config, tier, waveIndex, bossHpMult);

  return {
    x: spawnPos.x,
    y: spawnPos.y,
    hp: maxHp,
    maxHp,
    tier,
    flashTimer: 0,
    satelliteAngle: Math.random() * Math.PI * 2,
    hexAngle: Math.random() * Math.PI * 2,
    corruptSeed: Math.random() * 10000,
    isBoss,
    moveSpeed: speed,
  };
}

export function spawnStarterNodes(
  count: number,
  nodes: DissipationNode[],
  bounds: ScreenBounds,
  config: RunConfig,
): void {
  for (let index = 0; index < count; index += 1) {
    nodes.push(
      spawnEnemyOnEdge(bounds, config, {
        tier: 0,
        waveIndex: 1,
      }),
    );
  }
}

export function tickEnemyMovement(
  nodes: DissipationNode[],
  target: Vec2,
  deltaSeconds: number,
  onPlayerHit: (node: DissipationNode) => void,
): void {
  for (let index = nodes.length - 1; index >= 0; index -= 1) {
    const node = nodes[index];
    const dx = target.x - node.x;
    const dy = target.y - node.y;
    const distance = Math.hypot(dx, dy) || 1;
    const step = (node.moveSpeed * deltaSeconds) / distance;

    node.x += dx * step;
    node.y += dy * step;

    if (isEnemyHittingCore(node, target)) {
      onPlayerHit(node);
      nodes.splice(index, 1);
    }
  }
}
