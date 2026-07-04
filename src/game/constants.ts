import { DARK_HEX, DARK_HEX_PIXI } from '../theme/darkHexTerminal';

export const CORE_RADIUS = 52;
export const ENEMY_HEX_RADIUS_T0 = 26;
export const ENEMY_HEX_RADIUS_T1 = 32;
export const ENEMY_HEX_RADIUS_BOSS = 44;
/** @deprecated */
export const ENEMY_CIRCLE_RADIUS = ENEMY_HEX_RADIUS_T0;
/** @deprecated */
export const ENEMY_SQUARE_HALF = ENEMY_HEX_RADIUS_T1;
/** @deprecated */
export const NODE_RADIUS = ENEMY_HEX_RADIUS_T0;
/** @deprecated */
export const SQUARE_HALF_SIZE = ENEMY_HEX_RADIUS_T1;

export const PARTICLE_RADIUS = 6;
export const PARTICLE_SPEED = 220;

export const ARENA_PADDING = 40;

export const FLASH_DURATION_MS = 200;

export const CORE_COLOR = DARK_HEX_PIXI.coreFill;
export const CORE_STROKE = DARK_HEX_PIXI.coreStroke;
export const CORE_GLOW = DARK_HEX_PIXI.coreGlow;
export const NODE_SHELL_COLOR = DARK_HEX_PIXI.enemyShell;
export const NODE_FILL_FULL = DARK_HEX_PIXI.enemyFillFull;
export const NODE_FILL_LOW = DARK_HEX_PIXI.enemyFillLow;
export const NODE_FLASH_COLOR = DARK_HEX_PIXI.enemyFlash;
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

export function lerpFillColor(hpRatio: number): number {
  if (hpRatio >= 0.3) return NODE_FILL_FULL;

  const t = hpRatio / 0.3;
  const low = NODE_FILL_LOW;
  const full = NODE_FILL_FULL;
  const r = ((low >> 16) & 0xff) + (((full >> 16) & 0xff) - ((low >> 16) & 0xff)) * t;
  const g = ((low >> 8) & 0xff) + (((full >> 8) & 0xff) - ((low >> 8) & 0xff)) * t;
  const b = (low & 0xff) + ((full & 0xff) - (low & 0xff)) * t;
  return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
}

export { DARK_HEX };
