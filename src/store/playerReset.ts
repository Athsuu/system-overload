import { clearSkillTreeViewport } from '../ui/useSkillTreePan';
import { clearTutorialProgress } from '../tutorial/tutorialPersistence';
import { clearArchAmbientHeard } from '../tutorial/archAmbientPersistence';
import { resetTutorialSignals } from '../tutorial/tutorialSignals';
import { clearSave } from './persistence';
import { clearSettings } from './settingsPersistence';

/** Efface progression, tutoriels et vue skill tree — conserve les réglages (volume, langue). */
export function clearProgressionData(): void {
  clearSave();
  clearSkillTreeViewport();
  clearTutorialProgress();
  clearArchAmbientHeard();
  resetTutorialSignals();
}

/** Efface toutes les données joueur (progression, réglages, position skill tree). */
export function clearAllPlayerData(): void {
  clearProgressionData();
  clearSettings();
}
