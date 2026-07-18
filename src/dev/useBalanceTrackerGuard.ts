import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { syncBalanceTrackerGuard } from './balanceTracker/guard';
import { isDevMenuEnabled } from './isDevMenuEnabled';

export function useBalanceTrackerGuard(): void {
  useEffect(() => {
    if (!isDevMenuEnabled()) return;

    const runGuard = () => {
      const { gameState, runOutcome } = useGameStore.getState();
      syncBalanceTrackerGuard(gameState, runOutcome);
    };

    runGuard();
    return useGameStore.subscribe((state, prevState) => {
      if (state.gameState !== prevState.gameState || state.runOutcome !== prevState.runOutcome) {
        runGuard();
      }
    });
  }, []);
}
