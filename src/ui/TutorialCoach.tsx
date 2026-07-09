import { useCallback, useEffect, useState } from 'react';
import { isTutorialCoachVisible } from '../tutorial/tutorialCoachVisibility';
import { SPOTLIGHT_MOVE_DURATION_MS } from '../tutorial/tutorialSpotlightMotion';
import { useTutorialCoach } from '../tutorial/useTutorialCoach';
import { ArchChannelLabel, ArchChannelPanel, type ArchChannelGroupNav } from './ArchChannelPanel';
import { ArchGlitchLine } from './ArchGlitchText';
import { ArchTypewriterGlitchText } from './ArchTypewriterGlitchText';
import {
  TutorialTransitionOverlay,
  type TutorialNavDirection,
} from './TutorialTransitionOverlay';
import { useSettingsStore } from '../store/useSettingsStore';
import { useGameStore } from '../store/useGameStore';

const ARCH_CYAN = '#38bdf8';

interface TutorialCardProps {
  label: string;
  title: string;
  body: string;
  footnote?: string;
  featured: boolean;
  glitchIntensity?: 'normal' | 'heavy';
  bodyGlitchChance?: number;
  titleGlitchChance?: number;
  onSkip: () => void;
  groupNav?: ArchChannelGroupNav;
}

function TutorialCard({
  label,
  title,
  body,
  footnote,
  featured,
  glitchIntensity = 'normal',
  bodyGlitchChance,
  titleGlitchChance,
  onSkip,
  groupNav,
}: TutorialCardProps) {
  return (
    <ArchChannelPanel featured={featured} onSkip={onSkip} groupNav={groupNav}>
      <ArchChannelLabel>{label}</ArchChannelLabel>
      <h2
        className={`mt-1.5 font-normal tracking-[0.12em] ${featured ? 'text-lg' : 'text-base'}`}
        style={{ color: ARCH_CYAN }}
      >
        <ArchGlitchLine text={title} variant="title" intensity={glitchIntensity} glitchChance={titleGlitchChance} />
      </h2>
      <p className={`mt-3 leading-relaxed text-white/65 ${featured ? 'text-[18px]' : 'text-[17px]'}`}>
        <ArchTypewriterGlitchText
          text={body}
          glitchIntensity={glitchIntensity}
          glitchChance={bodyGlitchChance}
        />
      </p>
      {footnote && (
        <p className="mt-3 text-[14px] tracking-[0.12em] text-white/35 uppercase">{footnote}</p>
      )}
    </ArchChannelPanel>
  );
}

export function TutorialCoach() {
  const gameState = useGameStore((state) => state.gameState);
  const isSettingsOpen = useSettingsStore((state) => state.isOpen);
  const enabled = isTutorialCoachVisible(gameState, isSettingsOpen);
  const {
    activeStep,
    displayStep,
    dismissCurrent,
    goToNextInGroup,
    goToPreviousInGroup,
    canGoNextInGroup,
    canGoPreviousInGroup,
    isLastStepInGroup,
    hasGroupNavigation,
  } = useTutorialCoach(enabled);

  const [navDirection, setNavDirection] = useState<TutorialNavDirection>(0);

  useEffect(() => {
    if (navDirection === 0) return;
    const timeoutId = window.setTimeout(() => setNavDirection(0), SPOTLIGHT_MOVE_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [displayStep?.id, navDirection]);

  const handleNext = useCallback(() => {
    setNavDirection(1);
    goToNextInGroup();
  }, [goToNextInGroup]);

  const handlePrevious = useCallback(() => {
    setNavDirection(-1);
    goToPreviousInGroup();
  }, [goToPreviousInGroup]);

  if (!enabled || !activeStep || !displayStep) return null;

  const isFeatured = displayStep.display === 'featured';

  const card = (
    <TutorialCard
      label={displayStep.label}
      title={displayStep.title}
      body={displayStep.body}
      footnote={displayStep.footnote}
      featured={isFeatured || displayStep.display === 'spotlight'}
      glitchIntensity={displayStep.glitchIntensity}
      bodyGlitchChance={displayStep.bodyGlitchChance}
      titleGlitchChance={displayStep.titleGlitchChance}
      onSkip={dismissCurrent}
      groupNav={
        hasGroupNavigation
          ? {
              canGoPrevious: canGoPreviousInGroup,
              canGoNext: canGoNextInGroup,
              isLastInGroup: isLastStepInGroup,
              onPrevious: handlePrevious,
              onNext: handleNext,
            }
          : undefined
      }
    />
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-[25]">
      <TutorialTransitionOverlay
        stepId={displayStep.id}
        anchor={displayStep.anchor}
        display={displayStep.display}
        navDirection={navDirection}
        showCenterDim={isFeatured && displayStep.anchor === 'featured-center'}
        showSkillTreeGradient={isFeatured && displayStep.anchor === 'featured-skill-tree'}
      >
        {card}
      </TutorialTransitionOverlay>
    </div>
  );
}
