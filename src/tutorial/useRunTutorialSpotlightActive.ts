import { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { isTutorialCoachVisible } from './tutorialCoachVisibility';
import {
  isTutorialRunSpotlightActive,
  subscribeTutorialRunSpotlight,
} from './tutorialRunSpotlight';

export function useRunTutorialSpotlightActive(): boolean {
  const gameState = useGameStore((state) => state.gameState);
  const isSettingsOpen = useSettingsStore((state) => state.isOpen);
  const enabled = isTutorialCoachVisible(gameState, isSettingsOpen);
  const [active, setActive] = useState(() => isTutorialRunSpotlightActive());

  useEffect(() => {
    if (!enabled) {
      setActive(false);
      return;
    }

    setActive(isTutorialRunSpotlightActive());
    return subscribeTutorialRunSpotlight(() => {
      setActive(isTutorialRunSpotlightActive());
    });
  }, [enabled]);

  return enabled && active;
}
