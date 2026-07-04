import { CORE_RADIUS, type ScreenBounds, type Vec2 } from './constants';

export const PLAYER_SPEED = 180;
export const PLAYER_RADIUS = CORE_RADIUS;

export interface PlayerState {
  x: number;
  y: number;
  lastMoveX: number;
  lastMoveY: number;
}

export const WASD_KEY_CODES = new Set([
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
]);

export function createPlayerState(spawn: Vec2): PlayerState {
  return {
    x: spawn.x,
    y: spawn.y,
    lastMoveX: 0,
    lastMoveY: -1,
  };
}

export function resetPlayer(state: PlayerState, spawn: Vec2): void {
  state.x = spawn.x;
  state.y = spawn.y;
  state.lastMoveX = 0;
  state.lastMoveY = -1;
}

function getMoveDirection(keys: Set<string>): { x: number; y: number } | null {
  let x = 0;
  let y = 0;

  if (keys.has('KeyW') || keys.has('ArrowUp')) y -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) y += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;

  if (x === 0 && y === 0) return null;

  const length = Math.hypot(x, y);
  return { x: x / length, y: y / length };
}

export function clampPlayerToBounds(state: PlayerState, bounds: ScreenBounds): void {
  const margin = bounds.padding + PLAYER_RADIUS;
  state.x = Math.min(bounds.width - margin, Math.max(margin, state.x));
  state.y = Math.min(bounds.height - margin, Math.max(margin, state.y));
}

export function tickPlayerMovement(
  state: PlayerState,
  keys: Set<string>,
  bounds: ScreenBounds,
  deltaSeconds: number,
  speed = PLAYER_SPEED,
): void {
  const direction = getMoveDirection(keys);
  if (!direction) return;

  state.lastMoveX = direction.x;
  state.lastMoveY = direction.y;
  state.x += direction.x * speed * deltaSeconds;
  state.y += direction.y * speed * deltaSeconds;
  clampPlayerToBounds(state, bounds);
}

export function getPlayerPosition(state: PlayerState): Vec2 {
  return { x: state.x, y: state.y };
}

export function getPlayerFallbackAimPoint(state: PlayerState, distance = 120): Vec2 {
  return {
    x: state.x + state.lastMoveX * distance,
    y: state.y + state.lastMoveY * distance,
  };
}
