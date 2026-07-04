import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

export function useBreachEndWatcher() {
  const gameState = useGameStore((state) => state.gameState);
  const breachProgress = useGameStore((state) => state.breachProgress);
  const upgrades = useGameStore((state) => state.upgrades);
  const endRun = useGameStore((state) => state.endRun);

  useEffect(() => {
    if (gameState !== 'PLAYING' && gameState !== 'DRAFT') return;

    const breachCap = 100 + upgrades.criticalThreshold * 10;
    if (breachProgress >= breachCap) {
      endRun('defeat_breach');
    }
  }, [breachProgress, gameState, endRun, upgrades.criticalThreshold]);
}
