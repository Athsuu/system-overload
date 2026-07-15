import type { GameState } from '../store/useGameStore';

export function isDevInRun(gameState: GameState): boolean {
  return gameState === 'PLAYING' || gameState === 'PAUSED';
}
