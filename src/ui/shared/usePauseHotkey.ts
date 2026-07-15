import { useEffect } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useGameStore } from '../../store/useGameStore';
import { isTutorialRunSpotlightActive } from '../../tutorial/tutorialRunSpotlight';

export function usePauseHotkey(): void {
  const togglePause = useGameStore((state) => state.togglePause);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Escape') return;

      const settingsOpen = useSettingsStore.getState().isOpen;
      if (settingsOpen) {
        event.preventDefault();
        useSettingsStore.getState().closeSettings();
        return;
      }

      const gameState = useGameStore.getState().gameState;
      if (gameState !== 'PLAYING' && gameState !== 'PAUSED') return;
      if (isTutorialRunSpotlightActive()) return;

      event.preventDefault();
      togglePause();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [togglePause]);
}
