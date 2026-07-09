import { DARK_HEX } from '../theme/darkHexTerminal';

export const ARENA_PADDING = 40;
export const FLASH_DURATION_MS = 200;

export interface Vec2 {
  x: number;
  y: number;
}

export interface ScreenBounds {
  width: number;
  height: number;
  padding: number;
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

export { DARK_HEX };
