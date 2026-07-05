import { useTick } from '@pixi/react';
import { Container, FillGradient, Graphics } from 'pixi.js';
import { useLayoutEffect, useRef, type MutableRefObject } from 'react';
import { useGameStore } from '../store/useGameStore';
import { BREACH_URGENT_THRESHOLD, DARK_HEX_PIXI } from '../theme/darkHexTerminal';
import type { OverclockState } from './activeSkill';
import { CORE_RADIUS, CORE_STROKE } from './constants';
import { drawRotatedFlatTopHexFill, drawRotatedFlatTopHexStroke } from './hexDraw';
import type { PlayerState } from './playerMovement';
import { getBreachCap } from './runConfig';

interface PlayerCoreProps {
  playerRef: MutableRefObject<PlayerState>;
  overclockRef: MutableRefObject<OverclockState>;
}

const KERNEL_FILL = 0x120808;
const KERNEL_GOLD = 0xc5a059;
const IDLE_BREATH_HZ = 0.5;
const URGENT_BREATH_HZ = 1.35;
const IDLE_CORE_ROTATION = 0.00032;
const URGENT_CORE_ROTATION = 0.00055;
const OVERCLOCK_RING_ROTATION = 0.0025;
const IDLE_CORE_SCALE_AMP = 0.028;
const URGENT_CORE_SCALE_AMP = 0.045;

const KERNEL_GLOW_GRADIENT = new FillGradient({
  type: 'radial',
  center: { x: 0.5, y: 0.5 },
  innerRadius: 0,
  outerCenter: { x: 0.5, y: 0.5 },
  outerRadius: 0.5,
  colorStops: [
    { offset: 0, color: 'rgba(255, 77, 0, 0.42)' },
    { offset: 0.28, color: 'rgba(255, 107, 43, 0.2)' },
    { offset: 0.58, color: 'rgba(255, 77, 0, 0.07)' },
    { offset: 1, color: 'rgba(255, 77, 0, 0)' },
  ],
  textureSpace: 'local',
});

const KERNEL_GLOW_URGENT_GRADIENT = new FillGradient({
  type: 'radial',
  center: { x: 0.5, y: 0.5 },
  innerRadius: 0,
  outerCenter: { x: 0.5, y: 0.5 },
  outerRadius: 0.5,
  colorStops: [
    { offset: 0, color: 'rgba(255, 107, 43, 0.55)' },
    { offset: 0.22, color: 'rgba(255, 77, 0, 0.28)' },
    { offset: 0.52, color: 'rgba(255, 60, 0, 0.09)' },
    { offset: 1, color: 'rgba(255, 77, 0, 0)' },
  ],
  textureSpace: 'local',
});

function drawRadialGlowShadow(
  graphics: Graphics,
  cx: number,
  cy: number,
  radius: number,
  gradient: FillGradient,
  alpha: number,
): void {
  graphics.circle(cx, cy, radius);
  graphics.fill({ fill: gradient, alpha });
}

function renderPlayer(
  graphics: Graphics,
  player: PlayerState,
  overclockActive: boolean,
  elapsedMs: number,
): void {
  graphics.clear();

  const store = useGameStore.getState();
  const breachCap = getBreachCap(store.upgrades);
  const breachPercent = breachCap > 0 ? (store.breachProgress / breachCap) * 100 : 0;
  const isUrgent = breachPercent >= BREACH_URGENT_THRESHOLD;
  const breachRatio = breachPercent / 100;

  const elapsedSec = elapsedMs * 0.001;
  const breathHz = isUrgent ? URGENT_BREATH_HZ : IDLE_BREATH_HZ;
  const breath = Math.sin(elapsedSec * Math.PI * 2 * breathHz);
  const scaleAmp = isUrgent ? URGENT_CORE_SCALE_AMP : IDLE_CORE_SCALE_AMP;
  const coreScale = 1 + breath * scaleAmp;
  const coreRotation = elapsedMs * (isUrgent ? URGENT_CORE_ROTATION : IDLE_CORE_ROTATION);
  const coreRadius = CORE_RADIUS * coreScale;

  const glowBase = CORE_RADIUS + 8 + breachRatio * 12 + breath * (isUrgent ? 8 : 5);
  const glowRadius = glowBase * 1.35;
  const glowAlpha = isUrgent ? 0.88 + breachRatio * 0.12 : 0.72 + breachRatio * 0.08;
  const glowGradient = isUrgent ? KERNEL_GLOW_URGENT_GRADIENT : KERNEL_GLOW_GRADIENT;

  drawRadialGlowShadow(
    graphics,
    player.x,
    player.y + 3,
    glowRadius,
    glowGradient,
    glowAlpha,
  );

  if (overclockActive) {
    const ocRotation = elapsedMs * OVERCLOCK_RING_ROTATION;
    drawRotatedFlatTopHexStroke(
      graphics,
      player.x,
      player.y,
      coreRadius + 18,
      ocRotation,
      DARK_HEX_PIXI.breach,
      2,
      0.5 + breath * 0.15,
    );
  }

  drawRotatedFlatTopHexFill(
    graphics,
    player.x,
    player.y,
    coreRadius,
    coreRotation,
    KERNEL_FILL,
  );

  drawRotatedFlatTopHexStroke(
    graphics,
    player.x,
    player.y,
    coreRadius * 0.68,
    coreRotation,
    KERNEL_GOLD,
    1,
    isUrgent ? 0.55 + breath * 0.12 : 0.4 + breath * 0.1,
  );

  const outerStroke = isUrgent ? DARK_HEX_PIXI.breach : CORE_STROKE;
  drawRotatedFlatTopHexStroke(
    graphics,
    player.x,
    player.y,
    coreRadius,
    coreRotation,
    outerStroke,
    2.5,
    isUrgent ? 0.95 : 0.85,
  );

  const coreDotRadius = 3.5 + breath * (isUrgent ? 1.2 : 0.8);
  graphics.circle(player.x, player.y, coreDotRadius);
  graphics.fill({
    color: isUrgent ? DARK_HEX_PIXI.breachGlow : KERNEL_GOLD,
    alpha: isUrgent ? 0.85 + breath * 0.1 : 0.65 + breath * 0.15,
  });
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
    renderPlayer(
      graphics,
      playerRef.current,
      overclockRef.current.active,
      performance.now(),
    );
  });

  return <pixiContainer ref={containerRef} />;
}
