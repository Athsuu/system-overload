import { clearModuleTreeViewport } from '../ui/useModuleTreePan';
import { clearTutorialProgress } from '../tutorial/tutorialPersistence';
import { clearArchAmbientHeard } from '../tutorial/archAmbientPersistence';
import { resetTutorialSignals } from '../tutorial/tutorialSignals';
import { clearSave } from './persistence';
import { clearSettings } from './settingsPersistence';

/** Efface progression, tutoriels et vue module tree — conserve les réglages (volume, langue). */
export function clearProgressionData(): void {
  clearSave();
  clearModuleTreeViewport();
  clearTutorialProgress();
  clearArchAmbientHeard();
  resetTutorialSignals();
}

/** Efface toutes les données joueur (progression, réglages, position module tree). */
export function clearAllPlayerData(): void {
  clearProgressionData();
  clearSettings();
}
