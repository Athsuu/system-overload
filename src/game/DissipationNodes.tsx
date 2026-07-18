import { useApplication, useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useCallback, useLayoutEffect, useRef, type MutableRefObject, type RefObject } from 'react';
import { useGameStore } from '../store/useGameStore';
import { getScreenBounds } from './constants';
import { isDevShowEnemyDebugOverlay } from '../dev/devFlags';
import { drawCorruptedProcess, tickCorruptProcessAnim } from './corruptedProcessVisual';
import { drawEnemyHpBar, EnemyDebugOverlay } from './enemyDebugOverlay';
import { tickEnemyMovement } from './enemyMovement';
import { pushFlowEscapeFlash, type GameEffect } from './effects';
import {
  createChromaticAberrationFilter,
  isChromaticAberrationActive,
  tickChromaticAberration,
  type ChromaticAberrationState,
} from './juice/chromaticAberration';
import { scaleDeltaMs, scaleDeltaSeconds } from './runTimeScale';
import type { DissipationNode } from './types';

interface DissipationNodesProps {
  nodesRef: RefObject<DissipationNode[]>;
  effectsRef: RefObject<GameEffect[]>;
  isPlaying: boolean;
  chromaticAberrationRef: MutableRefObject<ChromaticAberrationState>;
}

export function DissipationNodes({
  nodesRef,
  effectsRef,
  isPlaying,
  chromaticAberrationRef,
}: DissipationNodesProps) {
  const { app } = useApplication();
  const graphicsRef = useRef<Graphics | null>(null);
  const containerRef = useRef<Container | null>(null);
  const debugOverlayRef = useRef<EnemyDebugOverlay | null>(null);
  const aberrationFilterRef = useRef(createChromaticAberrationFilter());

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const graphics = new Graphics();
    container.addChild(graphics);
    graphicsRef.current = graphics;
    debugOverlayRef.current = new EnemyDebugOverlay(container);

    return () => {
      debugOverlayRef.current?.destroy();
      debugOverlayRef.current = null;
      container.removeChild(graphics);
      graphics.destroy();
      graphicsRef.current = null;
    };
  }, []);

  const tick = useCallback(
    (ticker: { deltaMS: number }) => {
      const graphics = graphicsRef.current;
      const nodes = nodesRef.current;
      const container = containerRef.current;
      const debugOverlay = debugOverlayRef.current;
      if (!graphics || !nodes) return;

      if (isPlaying && app?.renderer && useGameStore.getState().gameState === 'PLAYING') {
        const bounds = getScreenBounds(app.screen.width, app.screen.height);
        const deltaMs = scaleDeltaMs(ticker.deltaMS);

        tickEnemyMovement(nodes, bounds, scaleDeltaSeconds(ticker.deltaMS / 1000), (node) => {
          pushFlowEscapeFlash(effectsRef.current ?? [], node.x, node.y, node.enemyLevel);
        });
        tickCorruptProcessAnim(nodes, deltaMs);

        tickChromaticAberration(chromaticAberrationRef.current, deltaMs);
      }

      if (container) {
        container.filters = isChromaticAberrationActive(chromaticAberrationRef.current)
          ? [aberrationFilterRef.current]
          : null;
      }

      graphics.clear();
      const showDebugOverlay = isDevShowEnemyDebugOverlay();
      for (const node of nodes) {
        drawCorruptedProcess(graphics, node);
        if (showDebugOverlay) {
          drawEnemyHpBar(graphics, node);
        }
      }
      debugOverlay?.sync(nodes, showDebugOverlay);
    },
    [app, chromaticAberrationRef, effectsRef, isPlaying, nodesRef],
  );

  useTick(tick);

  return <pixiContainer ref={containerRef} />;
}
