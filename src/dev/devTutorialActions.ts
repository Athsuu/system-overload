import { clearTutorialProgress } from '../tutorial/tutorialPersistence';
import { clearArchAmbientHeard } from '../tutorial/archAmbientPersistence';
import { clearMeltdownArchRotation } from '../ui/arch/meltdownArchRotation';
import { clearVictoryArchRotation } from '../ui/arch/victoryArchRotation';
import { setTutorialRunSpotlightActive } from '../tutorial/tutorialRunSpotlight';
import { resetTutorialSignals } from '../tutorial/tutorialSignals';
import { useSettingsStore } from '../store/useSettingsStore';
import { useGameStore } from '../store/useGameStore';

export function devResetArchDialogues(): void {
  clearArchAmbientHeard();
}

export function devResetTutorial(): void {
  resetTutorialSignals();
  clearTutorialProgress();
  clearArchAmbientHeard();
  clearMeltdownArchRotation();
  clearVictoryArchRotation();
  setTutorialRunSpotlightActive(false);

  useSettingsStore.getState().closeSettings();
  if (useGameStore.getState().gameState !== 'MENU') {
    useGameStore.setState({ gameState: 'MENU' });
  }
}
