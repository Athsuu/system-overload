import { useEffect } from 'react';
import { isDevInvincible } from '../dev/devFlags';
import { isMeltdownReached } from './runConfig';
import { useGameStore } from '../store/useGameStore';

export function useBreachEndWatcher(): void {
  const gameState = useGameStore((state) => state.gameState);
  const breachProgress = useGameStore((state) => state.breachProgress);
  const upgrades = useGameStore((state) => state.upgrades);
  const endRun = useGameStore((state) => state.endRun);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    if (isDevInvincible()) return;
    if (!isMeltdownReached(breachProgress, upgrades)) return;
    endRun('defeat_breach');
  }, [breachProgress, gameState, endRun, upgrades]);
}
