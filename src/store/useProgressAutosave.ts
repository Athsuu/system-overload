import { useEffect } from 'react';
import { useGameStore } from './useGameStore';

/** Sauvegarde automatique avant fermeture / rechargement de l'onglet. */
export function useProgressAutosave(): void {
  useEffect(() => {
    const onBeforeUnload = () => {
      const state = useGameStore.getState();
      if (state.gameState === 'MAIN_MENU') return;

      state.persistProgressSnapshot();
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);
}
