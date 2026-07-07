import { getGameStrings } from '../i18n';
import type { TutorialSnapshot } from './tutorialCatalog';

export interface ArchAmbientLine {
  id: string;
  text: string;
  screens: TutorialSnapshot['gameState'][];
  unlockWhen: (snapshot: TutorialSnapshot) => boolean;
  /** Only show after ARCH intro tutorial step is dismissed. */
  requiresArchMet: boolean;
}

export function getArchAmbientLines(): ArchAmbientLine[] {
  const A = getGameStrings().archAmbient;

  return [
    {
      id: 'first_run',
      text: A.firstRun,
      screens: ['PLAYING'],
      requiresArchMet: true,
      unlockWhen: (s) => s.signals.runsStarted >= 1 && s.signals.runsStarted <= 1 && s.waveIndex === 1,
    },
    {
      id: 'overload_critical',
      text: A.overloadCritical,
      screens: ['PLAYING'],
      requiresArchMet: true,
      unlockWhen: (s) => s.breachProgress >= 80,
    },
    {
      id: 'boss_incoming',
      text: A.bossIncoming,
      screens: ['PLAYING'],
      requiresArchMet: true,
      unlockWhen: (s) => s.waveIndex >= 6 || s.wavePhase === 'boss',
    },
    {
      id: 'flux_drive_ready',
      text: A.fluxDrive,
      screens: ['PLAYING', 'MENU'],
      requiresArchMet: true,
      unlockWhen: (s) => s.upgrades.fluxDrive > 0,
    },
  ];
}

export function getActiveArchAmbient(
  snapshot: TutorialSnapshot,
  heardIds: ReadonlySet<string>,
  archIntroDismissed: boolean,
): ArchAmbientLine | null {
  for (const line of getArchAmbientLines()) {
    if (heardIds.has(line.id)) continue;
    if (line.requiresArchMet && !archIntroDismissed) continue;
    if (!line.screens.includes(snapshot.gameState)) continue;
    if (!line.unlockWhen(snapshot)) continue;
    return line;
  }
  return null;
}
