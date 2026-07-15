import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { syncDevAutoplayGuard } from './devAutoplayGuard';
import { isDevMenuEnabled } from './isDevMenuEnabled';

export function useDevAutoplayGuard(): void {
  useEffect(() => {
    if (!isDevMenuEnabled()) return;

    const runGuard = () => {
      const { gameState, runOutcome } = useGameStore.getState();
      syncDevAutoplayGuard(gameState, runOutcome);
    };

    runGuard();
    return useGameStore.subscribe((state, prevState) => {
      if (state.gameState !== prevState.gameState || state.runOutcome !== prevState.runOutcome) {
        runGuard();
      }
    });
  }, []);
}
