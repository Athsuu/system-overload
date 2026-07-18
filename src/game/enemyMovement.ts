import type { ScreenBounds, Vec2 } from './constants';
import { getEnemyHexRadius } from './encounter';
import { getAnchorMultiplier } from './anchorSupercharge';
import {
  getEnemyMaxHp,
  getEnemySpeed,
  getLatencySlowMultiplier,
  getRunConfig,
  resolveActiveCycle,
  type RunConfig,
} from './runConfig';
import type { DissipationNode } from './types';
import { purgePointerRef } from './purgeInput';
import { isEnemyInPurgeZone } from './purgeZone';
import { useGameStore } from '../store/useGameStore';
import { SPAWN_EXIT_INSET_HEX_MULT, SPAWN_OUTSET_HEX_MULT, SPAWN_OUTSET_JITTER_MAX, SPAWN_OUTSET_JITTER_MIN } from './horde/hordeConfig';

/**
 * offsetFromPad : positif = vers l’intérieur de l’arène, négatif = hors-cadre.
 */
function pointOnEdge(
  edge: number,
  pad: number,
  width: number,
  height: number,
  innerW: number,
  innerH: number,
  t: number,
  offsetFromPad: number,
): Vec2 {
  switch (edge) {
    case 0:
      return { x: pad + innerW * t, y: pad + offsetFromPad };
    case 1:
      return { x: pad + innerW * t, y: height - pad - offsetFromPad };
    case 2:
      return { x: pad + offsetFromPad, y: pad + innerH * t };
    default:
      return { x: width - pad - offsetFromPad, y: pad + innerH * t };
  }
}

function pickFlowEndpoints(
  bounds: ScreenBounds,
  spawnOffsetFromPad: number,
  exitOffsetFromPad: number,
): { spawn: Vec2; exit: Vec2 } {
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
      spawnOffsetFromPad,
    ),
    exit: pointOnEdge(
      exitEdge,
      pad,
      bounds.width,
      bounds.height,
      innerW,
      innerH,
      Math.random(),
      exitOffsetFromPad,
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

function isInsidePlayable(node: DissipationNode, bounds: ScreenBounds): boolean {
  const pad = bounds.padding;
  return (
    node.x >= pad &&
    node.x <= bounds.width - pad &&
    node.y >= pad &&
    node.y <= bounds.height - pad
  );
}

/**
 * Wrap torique uniquement une fois dans l’arène.
 * Hors-cadre (entrée depuis l’extérieur) : ne pas téléporter — sinon le spawn outset est annulé.
 */
function portalWrapEnemy(node: DissipationNode, bounds: ScreenBounds): void {
  if (!isInsidePlayable(node, bounds)) return;

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
  isBossEncounter?: boolean;
}

function createFlowEnemy(
  bounds: ScreenBounds,
  config: RunConfig,
  options: SpawnEnemyOptions,
): DissipationNode {
  const { isBossEncounter = false } = options;
  const cycle = resolveActiveCycle();
  const radius = getEnemyHexRadius(isBossEncounter);
  const outsetJitter =
    SPAWN_OUTSET_JITTER_MIN + Math.random() * (SPAWN_OUTSET_JITTER_MAX - SPAWN_OUTSET_JITTER_MIN);
  const spawnOutset = radius * SPAWN_OUTSET_HEX_MULT * outsetJitter;
  const exitInset = radius * SPAWN_EXIT_INSET_HEX_MULT;
  const { spawn, exit } = pickFlowEndpoints(bounds, -spawnOutset, exitInset);
  const speed = getEnemySpeed(config, cycle);
  const maxHp = getEnemyMaxHp(config, isBossEncounter, cycle);
  const flow = buildFlowVelocity(spawn, exit);
  const enemyLevel = cycle;

  return {
    x: spawn.x,
    y: spawn.y,
    vx: flow.vx,
    vy: flow.vy,
    flowDistance: flow.flowDistance,
    distanceTraveled: 0,
    hp: maxHp,
    maxHp,
    enemyLevel,
    isBossEncounter,
    flashTimer: 0,
    satelliteAngle: Math.random() * Math.PI * 2,
    hexAngle: Math.atan2(flow.vy, flow.vx),
    corruptSeed: Math.random() * 10000,
    moveSpeed: speed,
  };
}

function repathEnemyFlow(node: DissipationNode, bounds: ScreenBounds): void {
  const radius = getEnemyHexRadius(node.isBossEncounter);
  const outsetJitter =
    SPAWN_OUTSET_JITTER_MIN + Math.random() * (SPAWN_OUTSET_JITTER_MAX - SPAWN_OUTSET_JITTER_MIN);
  const spawnOutset = radius * SPAWN_OUTSET_HEX_MULT * outsetJitter;
  const exitInset = radius * SPAWN_EXIT_INSET_HEX_MULT;
  const { spawn, exit } = pickFlowEndpoints(bounds, -spawnOutset, exitInset);
  const flow = buildFlowVelocity(spawn, exit);
  node.x = spawn.x;
  node.y = spawn.y;
  node.vx = flow.vx;
  node.vy = flow.vy;
  node.flowDistance = flow.flowDistance;
  node.distanceTraveled = 0;
  node.hexAngle = Math.atan2(flow.vy, flow.vx);
}

export function spawnEnemyOnEdge(
  bounds: ScreenBounds,
  config: RunConfig,
  options: SpawnEnemyOptions,
): DissipationNode {
  return createFlowEnemy(bounds, config, options);
}

/**
 * Avance les ennemis. En fin de trajet : callback FX puis reposition mur aléatoire (pas de despawn).
 */
export function tickEnemyMovement(
  nodes: DissipationNode[],
  bounds: ScreenBounds,
  deltaSeconds: number,
  onFlowWrap: (node: DissipationNode) => void,
): void {
  const store = useGameStore.getState();
  const latencyLevel = store.upgrades.latencyInjection;
  const latencyMult =
    latencyLevel > 0
      ? getLatencySlowMultiplier(
          latencyLevel,
          getAnchorMultiplier(store.anchoredNodes, 'latencyInjection'),
        )
      : 1;
  const pointer = purgePointerRef;
  const config = latencyLevel > 0 ? getRunConfig(store.upgrades) : null;

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    const remaining = node.flowDistance - node.distanceTraveled;
    if (remaining <= 0) {
      onFlowWrap(node);
      repathEnemyFlow(node, bounds);
      continue;
    }

    let speed = node.moveSpeed;
    if (
      latencyMult < 1 &&
      config &&
      pointer.active &&
      isEnemyInPurgeZone(node, pointer.x, pointer.y, config.purgeRadius)
    ) {
      speed *= latencyMult;
    }

    const step = Math.min(speed * deltaSeconds, remaining);
    node.x += node.vx * step;
    node.y += node.vy * step;
    node.distanceTraveled += step;
    portalWrapEnemy(node, bounds);

    if (node.distanceTraveled >= node.flowDistance) {
      onFlowWrap(node);
      repathEnemyFlow(node, bounds);
    }
  }
}
