import { ArchChannelLabel, ArchChannelPanel } from './ArchChannelPanel';
import { ArchGlitchLine, ArchGlitchText } from './ArchGlitchText';
import { useArchAmbient } from '../tutorial/useArchAmbient';
import { useSettingsStore } from '../store/useSettingsStore';
import { useGameStore } from '../store/useGameStore';
import { isTutorialCoachVisible } from '../tutorial/tutorialCoachVisibility';
import { useTutorialCoach } from '../tutorial/useTutorialCoach';
import { useGameStrings } from '../i18n/useGameStrings';

const ARCH_CYAN = '#38bdf8';

function shouldShowAmbient(gameState: string, isSettingsOpen: boolean): boolean {
  if (isSettingsOpen) return false;
  if (gameState === 'PAUSED' || gameState === 'MAIN_MENU') return false;
  return gameState === 'PLAYING' || gameState === 'MENU';
}

export function ArchAmbient() {
  const gameState = useGameStore((state) => state.gameState);
  const isSettingsOpen = useSettingsStore((state) => state.isOpen);
  const tutorialEnabled = isTutorialCoachVisible(gameState, isSettingsOpen);
  const { activeStep } = useTutorialCoach(tutorialEnabled);
  const strings = useGameStrings();

  const ambientEnabled = shouldShowAmbient(gameState, isSettingsOpen) && !activeStep;
  const { activeLine, dismissActive } = useArchAmbient(ambientEnabled);

  if (!ambientEnabled || !activeLine) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[24]">
      <div className="so-animate-fade-in-slow pointer-events-auto absolute top-28 left-1/2 max-w-[340px] -translate-x-1/2 px-4">
        <ArchChannelPanel paddingClassName="px-4 py-3 pr-12" onSkip={dismissActive}>
          <ArchChannelLabel>{strings.arch.channelLabel}</ArchChannelLabel>
          <p className="mt-1 text-[12px] font-semibold tracking-[0.18em]" style={{ color: ARCH_CYAN }}>
            <ArchGlitchLine text={strings.arch.name} variant="title" />
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-white/60">
            <ArchGlitchText text={activeLine.text} />
          </p>
        </ArchChannelPanel>
      </div>
    </div>
  );
}
