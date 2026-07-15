import { useEffect } from 'react';
import { ARCH_RUN_DIALOGUE_MS, useArchAmbient } from '../../tutorial/useArchAmbient';
import { markArchAmbientHeard } from '../../tutorial/archAmbientPersistence';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useGameStore } from '../../store/useGameStore';
import { isTutorialCoachVisible } from '../../tutorial/tutorialCoachVisibility';
import { useTutorialCoach } from '../../tutorial/useTutorialCoach';
import { ArchRunDialogueCard } from './ArchRunDialogueCard';

export function ArchRunDialogue() {
  const gameState = useGameStore((state) => state.gameState);
  const isSettingsOpen = useSettingsStore((state) => state.isOpen);
  const tutorialEnabled = isTutorialCoachVisible(gameState, isSettingsOpen);
  const { activeStep } = useTutorialCoach(tutorialEnabled);

  const ambientEnabled = gameState === 'PLAYING' && !isSettingsOpen && !activeStep;
  const { activeLine } = useArchAmbient(ambientEnabled);

  useEffect(() => {
    if (!ambientEnabled || !activeLine) return;
    const lineId = activeLine.id;
    const scope = activeLine.persistScope;
    const timeoutId = window.setTimeout(() => {
      markArchAmbientHeard(lineId, scope);
    }, ARCH_RUN_DIALOGUE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [activeLine?.id, activeLine?.persistScope, ambientEnabled]);

  if (!ambientEnabled || !activeLine) return null;

  return (
    <div
      data-arch-anchor="run-dialogue"
      className="pointer-events-none absolute inset-x-0 bottom-[5rem] z-[22] flex justify-center px-6"
    >
      <ArchRunDialogueCard
        key={activeLine.id}
        lineKey={activeLine.id}
        text={activeLine.text}
        animate
      />
    </div>
  );
}
