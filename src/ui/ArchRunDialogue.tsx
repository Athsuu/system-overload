import { useEffect } from 'react';
import { ArchTypewriterGlitchText } from './ArchTypewriterGlitchText';
import { ARCH_RUN_DIALOGUE_MS, useArchAmbient } from '../tutorial/useArchAmbient';
import { markArchAmbientHeard } from '../tutorial/archAmbientPersistence';
import { useSettingsStore } from '../store/useSettingsStore';
import { useGameStore } from '../store/useGameStore';
import { isTutorialCoachVisible } from '../tutorial/tutorialCoachVisibility';
import { useTutorialCoach } from '../tutorial/useTutorialCoach';
import { useGameStrings } from '../i18n/useGameStrings';

const ARCH_CYAN = '#38bdf8';

export function ArchRunDialogue() {
  const gameState = useGameStore((state) => state.gameState);
  const isSettingsOpen = useSettingsStore((state) => state.isOpen);
  const tutorialEnabled = isTutorialCoachVisible(gameState, isSettingsOpen);
  const { activeStep } = useTutorialCoach(tutorialEnabled);
  const strings = useGameStrings();

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
      <div
        key={activeLine.id}
        className="so-arch-run-dialogue so-animate-arch-run-dialogue w-full max-w-3xl text-center"
      >
        <p className="so-arch-run-dialogue-label text-[12px] tracking-[0.32em] text-white/35 uppercase">
          {strings.arch.runRelayLabel}
        </p>
        <p
          className="mt-1.5 text-[17px] font-semibold tracking-[0.22em] uppercase"
          style={{ color: ARCH_CYAN }}
        >
          {strings.arch.name}
        </p>
        <p className="so-arch-run-dialogue-body mt-3 text-[20px] leading-relaxed">
          <ArchTypewriterGlitchText text={activeLine.text} />
        </p>
      </div>
    </div>
  );
}
