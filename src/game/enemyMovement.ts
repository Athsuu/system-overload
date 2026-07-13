import type { ScreenBounds, Vec2 } from './constants';
import { getEnemyHexRadius } from './enemyClass';
import type { EnemyClass } from './enemyClass';
import {
  getEnemyMaxHp,
  getEnemySpeed,
  getLatencySlowMultiplier,
  getRunConfig,
  type RunConfig,
} from './runConfig';
import type { DissipationNode } from './types';
import { purgePointerRef } from './purgeInput';
import { isEnemyInPurgeZone } from './purgeZone';
import { useGameStore } from '../store/useGameStore';

function pointOnEdge(
  edge: number,
  pad: number,
  width: number,
  height: number,
  innerW: number,
  innerH: number,
  t: number,
  inset: number,
): Vec2 {
  switch (edge) {
    case 0:
      return { x: pad + innerW * t, y: pad + inset };
    case 1:
      return { x: pad + innerW * t, y: height - pad - inset };
    case 2:
      return { x: pad + inset, y: pad + innerH * t };
    default:
      return { x: width - pad - inset, y: pad + innerH * t };
  }
}

function pickFlowEndpoints(bounds: ScreenBounds, inset: number): { spawn: Vec2; exit: Vec2 } {
  const spawnEdge = Math.floor(Math.random() * 4);
  const exitEdge = spawnEdge < 2 ? 1 - spawnEdge : 5 - spawnEdge;
  const pad = bounds.padding;
  const innerW = bounds.width - pad * 2;
  const innerH = bounds.height - pad * 2;

  return {
    spawn: pointOnEdge(
      spawnEdge,
      pad,
      bounds.width,
      bounds.height,
      innerW,
      innerH,
      Math.random(),
      inset,
    ),
    exit: pointOnEdge(
      exitEdge,
      pad,
      bounds.width,
      bounds.height,
      innerW,
      innerH,
      Math.random(),
      inset,
    ),
  };
}

function buildFlowVelocity(spawn: Vec2, exit: Vec2): { vx: number; vy: number; flowDistance: number } {
  const dx = exit.x - spawn.x;
  const dy = exit.y - spawn.y;
  const flowDistance = Math.hypot(dx, dy) || 1;
  return {
    vx: dx / flowDistance,
    vy: dy / flowDistance,
    flowDistance,
  };
}

function portalWrapEnemy(node: DissipationNode, bounds: ScreenBounds): void {
  const pad = bounds.padding;
  const innerW = bounds.width - pad * 2;
  const innerH = bounds.height - pad * 2;
  if (innerW <= 0 || innerH <= 0) return;

  const minX = pad;
  const maxX = bounds.width - pad;
  const minY = pad;
  const maxY = bounds.height - pad;

  while (node.x < minX) node.x += innerW;
  while (node.x > maxX) node.x -= innerW;
  while (node.y < minY) node.y += innerH;
  while (node.y > maxY) node.y -= innerH;
}

export interface SpawnEnemyOptions {
  waveIndex: number;
  enemyClass?: EnemyClass;
}

function createFlowEnemy(
  bounds: ScreenBounds,
  config: RunConfig,
  options: SpawnEnemyOptions,
): DissipationNode {
  const { waveIndex, enemyClass = 'normal' } = options;
  const edgeInset = getEnemyHexRadius(enemyClass) * 0.35;
  const { spawn, exit } = pickFlowEndpoints(bounds, edgeInset);
  const speed = getEnemySpeed(config, waveIndex, enemyClass);
  const maxHp = getEnemyMaxHp(config, waveIndex, enemyClass);
  const flow = buildFlowVelocity(spawn, exit);

  return {
    x: spawn.x,
    y: spawn.y,
    vx: flow.vx,
    vy: flow.vy,
    flowDistance: flow.flowDistance,
    distanceTraveled: 0,
    hp: maxHp,
    maxHp,
    waveIndex,
    flashTimer: 0,
    satelliteAngle: Math.random() * Math.PI * 2,
    hexAngle: Math.atan2(flow.vy, flow.vx),
    corruptSeed: Math.random() * 10000,
    enemyClass,
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

export function tickEnemyMovement(
  nodes: DissipationNode[],
  bounds: ScreenBounds,
  deltaSeconds: number,
  onFlowEscape: (node: DissipationNode) => void,
): void {
  const store = useGameStore.getState();
  const slowLevel = store.upgrades.latencyInjection || 0;
  const slowMult = getLatencySlowMultiplier(slowLevel);
  const config = getRunConfig(store.upgrades);

  for (let index = nodes.length - 1; index >= 0; index -= 1) {
    const node = nodes[index];
    const remaining = node.flowDistance - node.distanceTraveled;
    if (remaining <= 0) {
      onFlowEscape(node);
      nodes.splice(index, 1);
      continue;
    }

    let speed = node.moveSpeed;
    if (
      slowLevel > 0 &&
      purgePointerRef.active &&
      isEnemyInPurgeZone(node, purgePointerRef.x, purgePointerRef.y, config.purgeRadius)
    ) {
      speed *= slowMult;
    }

    const step = Math.min(speed * deltaSeconds, remaining);
    node.x += node.vx * step;
    node.y += node.vy * step;
    node.distanceTraveled += step;
    portalWrapEnemy(node, bounds);

    if (node.distanceTraveled >= node.flowDistance) {
      onFlowEscape(node);
      nodes.splice(index, 1);
    }
  }
}
