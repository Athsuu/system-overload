import { useApplication, useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useCallback, useLayoutEffect, useRef, type RefObject } from 'react';
import { useGameStore } from '../store/useGameStore';
import { getScreenBounds } from './constants';
import { isDevInvincible, isDevShowEnemyHpBars } from '../dev/devFlags';
import { drawCorruptedProcess, tickCorruptProcessAnim } from './corruptedProcessVisual';
import { drawEnemyHpBar } from './enemyHpBar';
import { tickEnemyMovement } from './enemyMovement';
import { pushFlowEscapeFlash, type GameEffect } from './effects';
import { applyImpactOverload } from './overload';
import { getRunConfig } from './runConfig';
import { scaleDeltaMs, scaleDeltaSeconds } from './runTimeScale';
import type { DissipationNode } from './types';

interface DissipationNodesProps {
  nodesRef: RefObject<DissipationNode[]>;
  effectsRef: RefObject<GameEffect[]>;
  isPlaying: boolean;
}

export function DissipationNodes({ nodesRef, effectsRef, isPlaying }: DissipationNodesProps) {
  const { app } = useApplication();
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
        const bounds = getScreenBounds(app.screen.width, app.screen.height);
        const config = getRunConfig(useGameStore.getState().upgrades);
        const deltaMs = scaleDeltaMs(ticker.deltaMS);

        tickEnemyMovement(nodes, bounds, scaleDeltaSeconds(ticker.deltaMS / 1000), (node) => {
          if (isDevInvincible()) return;
          applyImpactOverload(config, node.waveIndex);
          pushFlowEscapeFlash(effectsRef.current ?? [], node.x, node.y, node.waveIndex);
        });
        tickCorruptProcessAnim(nodes, deltaMs);
      }

      graphics.clear();
      const showHpBars = isDevShowEnemyHpBars();
      for (const node of nodes) {
        drawCorruptedProcess(graphics, node);
        if (showHpBars) {
          drawEnemyHpBar(graphics, node);
        }
      }
    },
    [app.screen.height, app.screen.width, effectsRef, isPlaying, nodesRef],
  );

  useTick(tick);

  return <pixiContainer ref={containerRef} />;
}
