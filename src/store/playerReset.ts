import { getTutorialSteps } from '../tutorial/tutorialCatalog';
import { clearTutorialProgress, dismissSteps } from '../tutorial/tutorialPersistence';
import { clearArchAmbientHeard } from '../tutorial/archAmbientPersistence';
import { resetTutorialSignals } from '../tutorial/tutorialSignals';
import { clearModuleTreeViewport } from '../ui/useModuleTreePan';
import { clearSave } from './persistence';
import { clearSettings } from './settingsPersistence';

/** Dismiss all tutorial steps so they do not replay after a Recompile. */
export function skipTutorialsAfterRecompile(): void {
  const stepIds = getTutorialSteps().map((step) => step.id);
  dismissSteps(stepIds);
}

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
