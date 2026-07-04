import { useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useCallback, useLayoutEffect, useRef, type MutableRefObject, type RefObject } from 'react';
import { useGameStore } from '../store/useGameStore';
import { DARK_HEX_PIXI } from '../theme/darkHexTerminal';
import {
  FLASH_DURATION_MS,
  getEnemyHexRadius,
  lerpFillColor,
  NODE_FLASH_COLOR,
  NODE_SHELL_COLOR,
} from './constants';
import { drawFlatTopHexHpFill, drawFlatTopHexFill, drawFlatTopHexStroke } from './hexDraw';
import { tickEnemyMovement } from './enemyMovement';
import { pushKernelImpactFlash, type GameEffect } from './effects';
import { applyImpactOverload } from './overload';
import { tickNodeFlashes } from './NodeSpawner';
import type { PlayerState } from './playerMovement';
import { getPlayerPosition } from './playerMovement';
import { getRunConfig } from './runConfig';
import type { DissipationNode } from './types';

interface DissipationNodesProps {
  nodesRef: RefObject<DissipationNode[]>;
  effectsRef: RefObject<GameEffect[]>;
  isPlaying: boolean;
  playerRef: MutableRefObject<PlayerState>;
}

function drawEnemyShell(graphics: Graphics, node: DissipationNode): void {
  const radius = getEnemyHexRadius(node.tier, node.isBoss);
  const strokeColor = node.isBoss ? DARK_HEX_PIXI.breach : NODE_SHELL_COLOR;
  const strokeWidth = node.isBoss ? 3 : 2;
  drawFlatTopHexStroke(graphics, node.x, node.y, radius, strokeColor, strokeWidth);
}

function drawEnemyFill(graphics: Graphics, node: DissipationNode): void {
  const hpRatio = Math.max(0, node.hp / node.maxHp);
  const fillColor = node.isBoss ? DARK_HEX_PIXI.breachGlow : lerpFillColor(hpRatio);
  const radius = getEnemyHexRadius(node.tier, node.isBoss);
  drawFlatTopHexHpFill(graphics, node.x, node.y, radius, hpRatio, fillColor);
}

function drawEnemyFlash(graphics: Graphics, node: DissipationNode, flashAlpha: number): void {
  const radius = getEnemyHexRadius(node.tier, node.isBoss) + 8 * flashAlpha;
  drawFlatTopHexFill(graphics, node.x, node.y, radius, NODE_FLASH_COLOR, 0.35 * flashAlpha);
}

function drawEnemyTrail(graphics: Graphics, node: DissipationNode): void {
  const speed = Math.hypot(node.vx, node.vy);
  if (speed < 1) return;

  const tailLength = node.isBoss ? 22 : 14;
  const nx = node.vx / speed;
  const ny = node.vy / speed;

  graphics.moveTo(node.x, node.y);
  graphics.lineTo(node.x - nx * tailLength, node.y - ny * tailLength);
  graphics.stroke({ color: NODE_SHELL_COLOR, width: node.isBoss ? 2 : 1, alpha: 0.25 });
}

function renderNodes(graphics: Graphics, nodes: DissipationNode[]) {
  graphics.clear();

  for (const node of nodes) {
    drawEnemyTrail(graphics, node);

    if (node.flashTimer > 0) {
      const flashAlpha = node.flashTimer / FLASH_DURATION_MS;
      drawEnemyFlash(graphics, node, flashAlpha);
    }

    drawEnemyShell(graphics, node);
    drawEnemyFill(graphics, node);
  }
}

export function DissipationNodes({
  nodesRef,
  effectsRef,
  isPlaying,
  playerRef,
}: DissipationNodesProps) {
  const graphicsRef = useRef<Graphics | null>(null);
  const containerRef = useRef<Container | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const graphics = new Graphics();
    container.addChild(graphics);
    graphicsRef.current = graphics;

    return () => {
      container.removeChild(graphics);
      graphics.destroy();
      graphicsRef.current = null;
    };
  }, []);

  const tick = useCallback(
    (ticker: { deltaMS: number }) => {
      const graphics = graphicsRef.current;
      const nodes = nodesRef.current;
      if (!graphics || !nodes) return;

      if (isPlaying && useGameStore.getState().gameState === 'PLAYING') {
        const target = getPlayerPosition(playerRef.current);
        const config = getRunConfig(
          useGameStore.getState().upgrades,
          useGameStore.getState().runDraftLevels,
        );
        const deltaSeconds = ticker.deltaMS / 1000;

        tickEnemyMovement(nodes, target, deltaSeconds, (node) => {
          applyImpactOverload(config, node.tier);
          pushKernelImpactFlash(effectsRef.current ?? [], target.x, target.y);
        });

        tickNodeFlashes(nodes, ticker.deltaMS);
      }

      renderNodes(graphics, nodes);
    },
    [effectsRef, isPlaying, nodesRef, playerRef],
  );

  useTick(tick);

  return <pixiContainer ref={containerRef} />;
}
