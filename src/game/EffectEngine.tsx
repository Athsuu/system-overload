import { useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { DARK_HEX_PIXI } from '../theme/darkHexTerminal';
import { getEnemyHexRadius } from './enemyClass';
import {
  drawCorruptDeathEffect,
  drawCorruptSpawnFlash,
} from './corruptedProcessVisual';
import type { GameEffect } from './effects';
import { tickEffects } from './effects';
import { scaleDeltaMs } from './runTimeScale';
import {
  drawFlatTopHexFill,
  drawFlatTopHexStroke,
} from './hexDraw';

interface EffectEngineProps {
  isPlaying: boolean;
  effectsRef: RefObject<GameEffect[]>;
}

function drawPurgeHit(graphics: Graphics, effect: GameEffect): void {
  const progress = effect.elapsedMs / effect.durationMs;
  const alpha = (1 - progress) * 0.85;
  const baseRadius = getEnemyHexRadius(effect.enemyClass);
  const ringRadius = baseRadius * (0.92 + progress * 0.35);

  drawFlatTopHexStroke(
    graphics,
    effect.x,
    effect.y,
    ringRadius,
    DARK_HEX_PIXI.purgeGlow,
    1.5,
    alpha,
  );
  drawFlatTopHexStroke(
    graphics,
    effect.x,
    effect.y,
    ringRadius * 0.88,
    DARK_HEX_PIXI.purge,
    0.75,
    alpha * 0.55,
  );
}

function drawFlowEscapeFlash(graphics: Graphics, effect: GameEffect): void {
  const progress = effect.elapsedMs / effect.durationMs;
  const alpha = (1 - progress) * 0.65;
  const radius = 14 + progress * 22;
  drawFlatTopHexStroke(graphics, effect.x, effect.y, radius, DARK_HEX_PIXI.breach, 2, alpha);
  drawFlatTopHexFill(graphics, effect.x, effect.y, radius * 0.85, DARK_HEX_PIXI.breachGlow, alpha * 0.18);
}

function renderEffects(graphics: Graphics, effects: GameEffect[]): void {
  graphics.clear();

  for (const effect of effects) {
    switch (effect.kind) {
      case 'purgeHit':
        drawPurgeHit(graphics, effect);
        break;
      case 'death':
        drawCorruptDeathEffect(graphics, effect);
        break;
      case 'spawn':
        drawCorruptSpawnFlash(graphics, effect);
        break;
      case 'flowEscape':
        drawFlowEscapeFlash(graphics, effect);
        break;
      default:
        break;
    }
  }
}

export function EffectEngine({ isPlaying, effectsRef }: EffectEngineProps) {
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

  useEffect(() => {
    if (!isPlaying) {
      graphicsRef.current?.clear();
    }
  }, [isPlaying]);

  const tick = useCallback(
    (ticker: { deltaMS: number }) => {
      const graphics = graphicsRef.current;
      const effects = effectsRef.current;
      if (!graphics || !effects) return;

      if (isPlaying) {
        tickEffects(effects, scaleDeltaMs(ticker.deltaMS));
      }

      renderEffects(graphics, effects);
    },
    [effectsRef, isPlaying],
  );

  useTick(tick);

  return <pixiContainer ref={containerRef} />;
}
