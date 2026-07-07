import type { ScreenBounds, Vec2 } from './constants';
import { getEnemyHexRadius } from './constants';
import {
  getEnemyMaxHp,
  getEnemySpeed,
  type RunConfig,
} from './runConfig';
import type { DissipationNode } from './types';

function pointOnEdge(
  edge: number,
  pad: number,
  width: number,
  height: number,
  innerW: number,
  innerH: number,
  t: number,
): Vec2 {
  switch (edge) {
    case 0:
      return { x: pad + innerW * t, y: pad };
    case 1:
      return { x: pad + innerW * t, y: height - pad };
    case 2:
      return { x: pad, y: pad + innerH * t };
    default:
      return { x: width - pad, y: pad + innerH * t };
  }
}

function pickFlowEndpoints(bounds: ScreenBounds): { spawn: Vec2; exit: Vec2 } {
  const spawnEdge = Math.floor(Math.random() * 4);
  const exitEdge = spawnEdge < 2 ? 1 - spawnEdge : 5 - spawnEdge;
  const pad = bounds.padding;
  const innerW = bounds.width - pad * 2;
  const innerH = bounds.height - pad * 2;

  return {
    spawn: pointOnEdge(spawnEdge, pad, bounds.width, bounds.height, innerW, innerH, Math.random()),
    exit: pointOnEdge(exitEdge, pad, bounds.width, bounds.height, innerW, innerH, Math.random()),
  };
}

export interface SpawnEnemyOptions {
  tier: number;
  waveIndex: number;
  isBoss?: boolean;
  bossHpMult?: number;
  bossSpeedMult?: number;
}

function createFlowEnemy(
  bounds: ScreenBounds,
  config: RunConfig,
  options: SpawnEnemyOptions,
): DissipationNode {
  const { tier, waveIndex, isBoss, bossHpMult = 1, bossSpeedMult = 1 } = options;
  const { spawn, exit } = pickFlowEndpoints(bounds);
  const speed = getEnemySpeed(config, tier, waveIndex, bossSpeedMult);
  const maxHp = getEnemyMaxHp(config, tier, waveIndex, bossHpMult);

  return {
    x: spawn.x,
    y: spawn.y,
    flowTargetX: exit.x,
    flowTargetY: exit.y,
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

export function spawnEnemyOnEdge(
  bounds: ScreenBounds,
  config: RunConfig,
  options: SpawnEnemyOptions,
): DissipationNode {
  return createFlowEnemy(bounds, config, options);
}

export function spawnStarterNodes(
  count: number,
  nodes: DissipationNode[],
  bounds: ScreenBounds,
  config: RunConfig,
): void {
  for (let index = 0; index < count; index += 1) {
    nodes.push(
      createFlowEnemy(bounds, config, {
        tier: 0,
        waveIndex: 1,
      }),
    );
  }
}

function hasEscapedArena(node: DissipationNode, bounds: ScreenBounds): boolean {
  const margin = getEnemyHexRadius(node.tier, node.isBoss ?? false) * 0.35;
  const pad = bounds.padding;
  return (
    node.x < pad - margin ||
    node.x > bounds.width - pad + margin ||
    node.y < pad - margin ||
    node.y > bounds.height - pad + margin
  );
}

export function tickEnemyMovement(
  nodes: DissipationNode[],
  bounds: ScreenBounds,
  deltaSeconds: number,
  onFlowEscape: (node: DissipationNode) => void,
): void {
  for (let index = nodes.length - 1; index >= 0; index -= 1) {
    const node = nodes[index];
    const dx = node.flowTargetX - node.x;
    const dy = node.flowTargetY - node.y;
    const distance = Math.hypot(dx, dy) || 1;
    const step = (node.moveSpeed * deltaSeconds) / distance;

    node.x += dx * step;
    node.y += dy * step;

    if (hasEscapedArena(node, bounds)) {
      onFlowEscape(node);
      nodes.splice(index, 1);
    }
  }
}
