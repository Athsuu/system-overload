import type { GameState } from '../store/useGameStore';

export function isTutorialCoachVisible(gameState: GameState, isSettingsOpen: boolean): boolean {
  if (isSettingsOpen) return false;
  if (gameState === 'PAUSED' || gameState === 'MAIN_MENU') return false;
  return (
    gameState === 'MENU' ||
    gameState === 'PLAYING' ||
    gameState === 'UPGRADING' ||
    gameState === 'RUN_END'
  );
}
