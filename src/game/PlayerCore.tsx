import { useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useLayoutEffect, useRef, type MutableRefObject } from 'react';
import { useGameStore } from '../store/useGameStore';
import { DARK_HEX_PIXI } from '../theme/darkHexTerminal';
import type { OverclockState } from './activeSkill';
import {
  CORE_COLOR,
  CORE_GLOW,
  CORE_RADIUS,
  CORE_STROKE,
} from './constants';
import { drawFlatTopHexFill, drawFlatTopHexStroke } from './hexDraw';
import type { PlayerState } from './playerMovement';

interface PlayerCoreProps {
  playerRef: MutableRefObject<PlayerState>;
  overclockRef: MutableRefObject<OverclockState>;
}

function drawRotatedHexStroke(
  graphics: Graphics,
  cx: number,
  cy: number,
  radius: number,
  rotation: number,
  color: number,
  width: number,
  alpha: number,
): void {
  const vertices = Array.from({ length: 6 }, (_, index) => {
    const angle = rotation + (index * Math.PI) / 3;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  graphics.moveTo(vertices[0].x, vertices[0].y);
  for (let i = 1; i < vertices.length; i += 1) {
    graphics.lineTo(vertices[i].x, vertices[i].y);
  }
  graphics.closePath();
  graphics.stroke({ color, width, alpha });
}

function renderPlayer(
  graphics: Graphics,
  player: PlayerState,
  overclockActive: boolean,
  rotation: number,
): void {
  graphics.clear();
  const breachProgress = useGameStore.getState().breachProgress;
  const pulse = 0.12 + (breachProgress / 100) * 0.28;
  const glowRadius = CORE_RADIUS + 10 + pulse * 8;

  if (overclockActive) {
    drawRotatedHexStroke(
      graphics,
      player.x,
      player.y,
      CORE_RADIUS + 22,
      rotation,
      DARK_HEX_PIXI.breach,
      2,
      0.55,
    );
    drawRotatedHexStroke(
      graphics,
      player.x,
      player.y,
      CORE_RADIUS + 16,
      -rotation * 1.4,
      DARK_HEX_PIXI.breachGlow,
      1,
      0.35,
    );
  }

  drawFlatTopHexFill(graphics, player.x, player.y, glowRadius, CORE_GLOW, pulse * 0.35);
  drawFlatTopHexStroke(graphics, player.x, player.y, CORE_RADIUS + 4, CORE_STROKE, 1, 0.45);
  drawFlatTopHexFill(graphics, player.x, player.y, CORE_RADIUS, CORE_COLOR);
  drawFlatTopHexStroke(graphics, player.x, player.y, CORE_RADIUS, CORE_STROKE, 2.5);
}

export function PlayerCore({ playerRef, overclockRef }: PlayerCoreProps) {
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

  useTick(() => {
    const graphics = graphicsRef.current;
    if (!graphics) return;
    const rotation = performance.now() * 0.002;
    renderPlayer(graphics, playerRef.current, overclockRef.current.active, rotation);
  });

  return <pixiContainer ref={containerRef} />;
}
