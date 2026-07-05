import { useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useCallback, useLayoutEffect, useRef, type MutableRefObject, type RefObject } from 'react';
import { useGameStore } from '../store/useGameStore';
import { drawCorruptedProcess, tickCorruptProcessAnim } from './corruptedProcessVisual';
import { tickEnemyMovement } from './enemyMovement';
import { pushKernelImpactFlash, type GameEffect } from './effects';
import { applyImpactOverload } from './overload';
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
          useGameStore.getState().runModuleLevels,
        );

        tickEnemyMovement(nodes, target, ticker.deltaMS / 1000, (node) => {
          applyImpactOverload(config, node.tier);
          pushKernelImpactFlash(effectsRef.current ?? [], target.x, target.y);
        });
        tickCorruptProcessAnim(nodes, ticker.deltaMS);
      }

      graphics.clear();
      for (const node of nodes) {
        drawCorruptedProcess(graphics, node);
      }
    },
    [effectsRef, isPlaying, nodesRef, playerRef],
  );

  useTick(tick);

  return <pixiContainer ref={containerRef} />;
}
