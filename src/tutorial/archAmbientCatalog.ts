import { getGameStrings } from '../i18n';
import { getBreachPercent } from '../game/runConfig';
import { BOSS_WAVE_INDEX } from '../game/waveScaling';
import { BREACH_URGENT_THRESHOLD } from '../theme/darkHexTerminal';
import type { ArchAmbientPersistScope } from './archAmbientPersistence';
import { isArchAmbientHeard } from './archAmbientPersistence';
import { getSnapshotCycle, type TutorialSnapshot } from './tutorialCatalog';

export interface ArchAmbientLine {
  id: string;
  text: string;
  screens: TutorialSnapshot['gameState'][];
  unlockWhen: (snapshot: TutorialSnapshot) => boolean;
  /** Only show after ARCH intro tutorial step is dismissed. */
  requiresArchMet: boolean;
  /** run = once per run · profile = once per save (hub / legacy). */
  persistScope: ArchAmbientPersistScope;
}

export function getArchAmbientLines(): ArchAmbientLine[] {
  const A = getGameStrings().archAmbient;

  return [
    {
      id: 'first_run',
      text: A.firstRun,
      screens: ['PLAYING'],
      requiresArchMet: true,
      persistScope: 'run',
      unlockWhen: (s) => s.signals.runsStarted >= 1 && s.waveIndex === 1 && s.wavePhase !== 'intermission',
    },
    {
      id: 'wave_midpoint',
      text: A.waveMidpoint,
      screens: ['PLAYING'],
      requiresArchMet: true,
      persistScope: 'run',
      unlockWhen: (s) => s.waveIndex === 5 && s.wavePhase !== 'intermission',
    },
    {
      id: 'overload_critical',
      text: A.overloadCritical,
      screens: ['PLAYING'],
      requiresArchMet: true,
      persistScope: 'run',
      unlockWhen: (s) => getBreachPercent(s.breachProgress, s.upgrades) >= BREACH_URGENT_THRESHOLD,
    },
    {
      id: 'boss_incoming',
      text: A.bossIncoming,
      screens: ['PLAYING'],
      requiresArchMet: true,
      persistScope: 'run',
      unlockWhen: (s) => s.waveIndex >= BOSS_WAVE_INDEX || s.wavePhase === 'boss',
    },
    {
      id: 'flux_drive_ready',
      text: A.fluxDrive,
      screens: ['MENU'],
      requiresArchMet: true,
      persistScope: 'profile',
      unlockWhen: (s) => s.upgrades.fluxDrive >= 1 && getSnapshotCycle(s) === 1,
    },
  ];
}

export function getActiveArchAmbient(
  snapshot: TutorialSnapshot,
  archIntroDismissed: boolean,
): ArchAmbientLine | null {
  for (const line of getArchAmbientLines()) {
    if (isArchAmbientHeard(line.id, line.persistScope)) continue;
    if (line.requiresArchMet && !archIntroDismissed) continue;
    if (!line.screens.includes(snapshot.gameState)) continue;
    if (!line.unlockWhen(snapshot)) continue;
    return line;
  }
  return null;
}
