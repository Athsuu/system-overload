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
  bossId?: string;
  bossHpMult?: number;
  bossSpeedMult?: number;
}

export function spawnEnemyOnEdge(
  target: Vec2,
  bounds: ScreenBounds,
  config: RunConfig,
  options: SpawnEnemyOptions,
): DissipationNode {
  const { tier, waveIndex, isBoss, bossId, bossHpMult = 1, bossSpeedMult = 1 } = options;
  const spawnPos = pickEdgeSpawn(bounds);
  const dx = target.x - spawnPos.x;
  const dy = target.y - spawnPos.y;
  const distance = Math.hypot(dx, dy) || 1;
  const speed = getEnemySpeed(config, tier, waveIndex, bossSpeedMult);
  const maxHp = getEnemyMaxHp(config, tier, waveIndex, bossHpMult);

  return {
    x: spawnPos.x,
    y: spawnPos.y,
    vx: (dx / distance) * speed,
    vy: (dy / distance) * speed,
    hp: maxHp,
    maxHp,
    tier,
    shape: 'hex',
    flashTimer: 0,
    isBoss,
    bossId,
    moveSpeed: speed,
  };
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
    const speed = node.moveSpeed;

    node.vx = (dx / distance) * speed;
    node.vy = (dy / distance) * speed;
    node.x += node.vx * deltaSeconds;
    node.y += node.vy * deltaSeconds;

    if (isEnemyHittingCore(node, target)) {
      onPlayerHit(node);
      nodes.splice(index, 1);
    }
  }
}
