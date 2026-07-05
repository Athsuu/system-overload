import { useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { DARK_HEX_PIXI } from '../theme/darkHexTerminal';
import { CORE_RADIUS } from './constants';
import {
  drawCorruptDeathEffect,
  drawCorruptSpawnFlash,
} from './corruptedProcessVisual';
import type { GameEffect } from './effects';
import { tickEffects } from './effects';
import {
  drawFlatTopHexFill,
  drawFlatTopHexStroke,
  drawRotatedFlatTopHexFill,
  drawRotatedFlatTopHexStroke,
} from './hexDraw';

interface EffectEngineProps {
  isPlaying: boolean;
  effectsRef: RefObject<GameEffect[]>;
}

function drawBoltHit(graphics: Graphics, effect: GameEffect): void {
  const progress = effect.elapsedMs / effect.durationMs;
  const alpha = 1 - progress;
  const flashRadius = 4 + progress * 10;

  drawRotatedFlatTopHexFill(
    graphics,
    effect.x,
    effect.y,
    flashRadius,
    effect.rotation,
    DARK_HEX_PIXI.flux,
    alpha * 0.95,
  );
  drawRotatedFlatTopHexStroke(
    graphics,
    effect.x,
    effect.y,
    flashRadius,
    effect.rotation,
    DARK_HEX_PIXI.breach,
    2,
    alpha * 0.9,
  );

  for (let shard = 0; shard < 3; shard += 1) {
    const angle = effect.rotation + (shard * Math.PI * 2) / 3;
    const dist = 3 + progress * 16;
    const shardX = effect.x + Math.cos(angle) * dist;
    const shardY = effect.y + Math.sin(angle) * dist;
    const shardRadius = Math.max(1.2, 2.8 - progress * 1.2);
    drawRotatedFlatTopHexFill(
      graphics,
      shardX,
      shardY,
      shardRadius,
      angle,
      DARK_HEX_PIXI.breachGlow,
      alpha * 0.75,
    );
  }
}

function drawMuzzleFlash(graphics: Graphics, effect: GameEffect): void {
  const progress = effect.elapsedMs / effect.durationMs;
  const alpha = (1 - progress) * 0.85;
  const radius = 4 + progress * 8;
  drawRotatedFlatTopHexFill(
    graphics,
    effect.x,
    effect.y,
    radius,
    effect.rotation,
    DARK_HEX_PIXI.breachGlow,
    alpha * 0.45,
  );
  drawRotatedFlatTopHexStroke(
    graphics,
    effect.x,
    effect.y,
    radius,
    effect.rotation,
    DARK_HEX_PIXI.breach,
    1.5,
    alpha,
  );
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
      case 'boltHit':
        drawBoltHit(graphics, effect);
        break;
      case 'muzzleFlash':
        drawMuzzleFlash(graphics, effect);
        break;
      case 'death':
        drawCorruptDeathEffect(graphics, effect);
        break;
      case 'spawn':
        drawCorruptSpawnFlash(graphics, effect);
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
