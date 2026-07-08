import { DARK_HEX } from '../theme/darkHexTerminal';
import { getScalingWaveIndex } from './cycleScaling';
import { useGameStore } from '../store/useGameStore';
import { getEnemyVisualBand } from './waveScaling';

export const ENEMY_HEX_RADIUS_T0 = 42.25;
export const ENEMY_HEX_RADIUS_T1 = 52;
export const ENEMY_HEX_RADIUS_BOSS = 71.5;

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

function resolveScalingWaveIndex(localWaveIndex: number): number {
  const cycle = useGameStore.getState().activeCycle || 1;
  return getScalingWaveIndex(cycle, localWaveIndex);
}

export function getEnemyHexRadius(localWaveIndex: number, isBoss = false): number {
  if (isBoss) return ENEMY_HEX_RADIUS_BOSS;
  const band = getEnemyVisualBand(resolveScalingWaveIndex(localWaveIndex));
  if (band === 0) return ENEMY_HEX_RADIUS_T0;
  if (band === 1) return ENEMY_HEX_RADIUS_T1;
  return ENEMY_HEX_RADIUS_T1 * 1.08;
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
