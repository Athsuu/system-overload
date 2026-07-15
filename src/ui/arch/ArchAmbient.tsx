import { useEffect } from 'react';
import { ArchChannelLabel, ArchChannelPanel } from './ArchChannelPanel';
import { ArchGlitchLine } from './ArchGlitchText';
import { ArchTypewriterGlitchText } from './ArchTypewriterGlitchText';
import { useArchAmbient } from '../../tutorial/useArchAmbient';
import { markArchAmbientHeard } from '../../tutorial/archAmbientPersistence';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useGameStore } from '../../store/useGameStore';
import { isTutorialCoachVisible } from '../../tutorial/tutorialCoachVisibility';
import { useTutorialCoach } from '../../tutorial/useTutorialCoach';
import { useGameStrings } from '../../i18n/useGameStrings';

const ARCH_CYAN = '#38bdf8';
const HUB_AMBIENT_MS = 5000;

function shouldShowHubAmbient(gameState: string, isSettingsOpen: boolean): boolean {
  if (isSettingsOpen) return false;
  if (gameState === 'PAUSED' || gameState === 'MAIN_MENU' || gameState === 'PLAYING') return false;
  return gameState === 'MENU';
}

/** ARCH ambient lines on hub screens — still uses the advisory panel. Run uses {@link ArchRunDialogue}. */
export function ArchAmbient() {
  const gameState = useGameStore((state) => state.gameState);
  const isSettingsOpen = useSettingsStore((state) => state.isOpen);
  const tutorialEnabled = isTutorialCoachVisible(gameState, isSettingsOpen);
  const { activeStep } = useTutorialCoach(tutorialEnabled);
  const strings = useGameStrings();

  const ambientEnabled = shouldShowHubAmbient(gameState, isSettingsOpen) && !activeStep;
  const { activeLine } = useArchAmbient(ambientEnabled);

  useEffect(() => {
    if (!ambientEnabled || !activeLine) return;
    const lineId = activeLine.id;
    const scope = activeLine.persistScope;
    const timeoutId = window.setTimeout(() => {
      markArchAmbientHeard(lineId, scope);
    }, HUB_AMBIENT_MS);
    return () => window.clearTimeout(timeoutId);
  }, [activeLine?.id, activeLine?.persistScope, ambientEnabled]);

  const dismissActive = () => {
    if (!activeLine) return;
    markArchAmbientHeard(activeLine.id, activeLine.persistScope);
  };

  if (!ambientEnabled || !activeLine) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[24]">
      {/* Colé au lanceur de run (CycleRunLauncher · bottom-8) */}
      <div className="so-animate-fade-in-slow pointer-events-auto absolute bottom-[12.75rem] left-1/2 max-w-[min(340px,calc(100vw-2rem))] -translate-x-1/2 px-4">
        <ArchChannelPanel paddingClassName="px-4 py-3 pr-12" onSkip={dismissActive}>
          <ArchChannelLabel>{strings.arch.channelLabel}</ArchChannelLabel>
          <p className="mt-1 text-[16px] font-semibold tracking-[0.18em]" style={{ color: ARCH_CYAN }}>
            <ArchGlitchLine text={strings.arch.name} variant="title" />
          </p>
          <p className="mt-2 text-[17px] leading-relaxed text-white/60">
            <ArchTypewriterGlitchText text={activeLine.text} />
          </p>
        </ArchChannelPanel>
      </div>
    </div>
  );
}
