import { useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { DARK_HEX_PIXI } from '../theme/darkHexTerminal';
import {
  CORE_RADIUS,
  getEnemyHexRadius,
  lerpFillColor,
  NODE_FLASH_COLOR,
  NODE_SHELL_COLOR,
} from './constants';
import type { GameEffect } from './effects';
import { tickEffects } from './effects';
import {
  drawFlatTopHexFill,
  drawFlatTopHexHpFill,
  drawFlatTopHexStroke,
} from './hexDraw';

interface EffectEngineProps {
  isPlaying: boolean;
  effectsRef: RefObject<GameEffect[]>;
}

function drawHitSpark(graphics: Graphics, effect: GameEffect): void {
  const progress = effect.elapsedMs / effect.durationMs;
  const alpha = 1 - progress;
  const radius = 8 + progress * 6;
  drawFlatTopHexFill(graphics, effect.x, effect.y, radius, NODE_FLASH_COLOR, alpha * 0.6);
}

function drawDeathEffect(graphics: Graphics, effect: GameEffect): void {
  const progress = effect.elapsedMs / effect.durationMs;
  const alpha = 1 - progress;
  const radius = getEnemyHexRadius(effect.tier, effect.isBoss);
  const strokeColor = effect.isBoss ? DARK_HEX_PIXI.breach : NODE_SHELL_COLOR;
  const fillColor = effect.isBoss ? DARK_HEX_PIXI.breachGlow : lerpFillColor(1 - progress);

  drawFlatTopHexStroke(graphics, effect.x, effect.y, radius, strokeColor, 2, alpha * 0.9);
  drawFlatTopHexHpFill(graphics, effect.x, effect.y, radius, 1 - progress, fillColor);
}

function drawSpawnFlash(graphics: Graphics, effect: GameEffect): void {
  const progress = effect.elapsedMs / effect.durationMs;
  const scale = 0.55 + progress * 0.45;
  const alpha = (1 - progress) * 0.7;
  const radius = getEnemyHexRadius(effect.tier, effect.isBoss) * scale;
  const color = effect.isBoss ? DARK_HEX_PIXI.breach : DARK_HEX_PIXI.breachGlow;
  drawFlatTopHexStroke(graphics, effect.x, effect.y, radius, color, 2, alpha);
  drawFlatTopHexFill(graphics, effect.x, effect.y, radius * 0.85, color, alpha * 0.25);
}

function drawKernelImpactFlash(graphics: Graphics, effect: GameEffect): void {
  const progress = effect.elapsedMs / effect.durationMs;
  const alpha = (1 - progress) * 0.75;
  const radius = CORE_RADIUS + 8 + progress * 18;
  drawFlatTopHexStroke(graphics, effect.x, effect.y, radius, DARK_HEX_PIXI.breach, 3, alpha);
  drawFlatTopHexFill(graphics, effect.x, effect.y, radius * 0.9, DARK_HEX_PIXI.breachGlow, alpha * 0.2);
}

function drawMissRipple(graphics: Graphics, effect: GameEffect): void {
  const progress = effect.elapsedMs / effect.durationMs;
  const alpha = (1 - progress) * 0.55;
  const radius = 10 + progress * 22;
  drawFlatTopHexStroke(graphics, effect.x, effect.y, radius, DARK_HEX_PIXI.breach, 1.5, alpha);
}

function renderEffects(graphics: Graphics, effects: GameEffect[]): void {
  graphics.clear();

  for (const effect of effects) {
    switch (effect.kind) {
      case 'hitSpark':
        drawHitSpark(graphics, effect);
        break;
      case 'death':
        drawDeathEffect(graphics, effect);
        break;
      case 'spawn':
        drawSpawnFlash(graphics, effect);
        break;
      case 'kernelImpact':
        drawKernelImpactFlash(graphics, effect);
        break;
      case 'missRipple':
        drawMissRipple(graphics, effect);
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
        tickEffects(effects, ticker.deltaMS);
      }

      renderEffects(graphics, effects);
    },
    [effectsRef, isPlaying],
  );

  useTick(tick);

  return <pixiContainer ref={containerRef} />;
}
