import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

export function usePauseHotkey(): void {
  const togglePause = useGameStore((state) => state.togglePause);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Escape') return;

      const gameState = useGameStore.getState().gameState;
      if (gameState !== 'PLAYING' && gameState !== 'PAUSED') return;

      event.preventDefault();
      togglePause();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [togglePause]);
}
