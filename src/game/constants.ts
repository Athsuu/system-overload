import { DARK_HEX, DARK_HEX_PIXI } from '../theme/darkHexTerminal';

export const CORE_RADIUS = 52;
export const ENEMY_HEX_RADIUS_T0 = 32.5;
export const ENEMY_HEX_RADIUS_T1 = 40;
export const ENEMY_HEX_RADIUS_BOSS = 55;

export const PARTICLE_RADIUS = 6;
export const PARTICLE_SPEED = 220;
export const BOLT_BASE_RADIUS = 5;
export const BOLT_FADE_MARGIN = 72;

export const ARENA_PADDING = 40;
export const FLASH_DURATION_MS = 200;

export const CORE_COLOR = DARK_HEX_PIXI.coreFill;
export const CORE_STROKE = DARK_HEX_PIXI.coreStroke;
export const CORE_GLOW = DARK_HEX_PIXI.coreGlow;
export const PARTICLE_COLOR = DARK_HEX_PIXI.flux;
export const PARTICLE_GLOW = DARK_HEX_PIXI.fluxGlow;

export interface Vec2 {
  x: number;
  y: number;
}

export interface ScreenBounds {
  width: number;
  height: number;
  padding: number;
}

export function getEnemyHexRadius(tier: number, isBoss = false): number {
  if (isBoss) return ENEMY_HEX_RADIUS_BOSS;
  return tier === 0 ? ENEMY_HEX_RADIUS_T0 : ENEMY_HEX_RADIUS_T1;
}

export function getArenaCenter(screenWidth: number, screenHeight: number): Vec2 {
  return {
    x: screenWidth / 2,
    y: screenHeight / 2,
  };
}

export function getScreenBounds(screenWidth: number, screenHeight: number): ScreenBounds {
  return {
    width: screenWidth,
    height: screenHeight,
    padding: ARENA_PADDING,
  };
}

export function isParticleOutOfBounds(
  x: number,
  y: number,
  bounds: ScreenBounds,
  margin: number,
): boolean {
  return (
    x < bounds.padding - margin ||
    x > bounds.width - bounds.padding + margin ||
    y < bounds.padding - margin ||
    y > bounds.height - bounds.padding + margin
  );
}

export { DARK_HEX };
