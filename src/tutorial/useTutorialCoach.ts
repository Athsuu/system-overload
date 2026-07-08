import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import {
  getActiveTutorialStep,
  getTutorialGroupSteps,
  getTutorialStep,
  getTutorialSteps,
  type TutorialSnapshot,
  type TutorialStep,
} from './tutorialCatalog';
import {
  getTutorialGroupFocus,
  setTutorialGroupFocus,
  subscribeTutorialGroupFocus,
} from './tutorialNavigation';
import {
  dismissStep,
  dismissTutorialGroup,
  loadTutorialProgress,
  subscribeTutorialProgress,
} from './tutorialPersistence';
import {
  setTutorialRunSpotlightActive,
} from './tutorialRunSpotlight';
import {
  getTutorialSignals,
  subscribeTutorialSignals,
} from './tutorialSignals';
import { subscribeLocale } from '../i18n';
export interface TutorialCoachState {
  activeStep: TutorialStep | null;
  displayStep: TutorialStep | null;
  dismissCurrent: () => void;
  goToNextInGroup: () => void;
  goToPreviousInGroup: () => void;
  canGoNextInGroup: boolean;
  canGoPreviousInGroup: boolean;
  isLastStepInGroup: boolean;
  hasGroupNavigation: boolean;
  isRunSpotlight: boolean;
}

export function useTutorialCoach(enabled: boolean): TutorialCoachState {
  const gameState = useGameStore((state) => state.gameState);
  const breachProgress = useGameStore((state) => state.breachProgress);
  const runShards = useGameStore((state) => state.runShards);
  const bankShards = useGameStore((state) => state.bankShards);
  const upgrades = useGameStore((state) => state.upgrades);
  const prestigeUnlocked = useGameStore((state) => state.prestigeUnlocked);
  const waveIndex = useGameStore((state) => state.waveIndex);
  const wavePhase = useGameStore((state) => state.wavePhase);
  const runOutcome = useGameStore((state) => state.runOutcome);

  const [progressRevision, setProgressRevision] = useState(0);
  const [signalRevision, setSignalRevision] = useState(0);
  const [focusRevision, setFocusRevision] = useState(0);

  useEffect(() => subscribeTutorialProgress(() => setProgressRevision((n) => n + 1)), []);
  useEffect(() => subscribeTutorialGroupFocus(() => setFocusRevision((n) => n + 1)), []);

  useEffect(() => {
    return subscribeTutorialSignals(() => setSignalRevision((n) => n + 1));
  }, []);

  const [localeRevision, setLocaleRevision] = useState(0);

  useEffect(() => subscribeLocale(() => setLocaleRevision((n) => n + 1)), []);

  const dismissedIds = useMemo(() => {
    void progressRevision;
    return new Set(loadTutorialProgress().dismissedStepIds);
  }, [progressRevision]);

  const groupFocusStepId = useMemo(() => {
    void focusRevision;
    return getTutorialGroupFocus();
  }, [focusRevision]);

  const snapshot: TutorialSnapshot = useMemo(() => {
    void signalRevision;
    return {
      gameState,
      breachProgress,
      runShards,
      bankShards,
      upgrades,
      prestigeUnlocked,
      waveIndex,
      wavePhase,
      runOutcome,
      signals: getTutorialSignals(),
      dismissedIds,
    };
  }, [
    gameState,
    breachProgress,
    runShards,
    bankShards,
    upgrades,
    prestigeUnlocked,
    waveIndex,
    wavePhase,
    runOutcome,
    dismissedIds,
    signalRevision,
  ]);

  const activeStep = useMemo(() => {
    void localeRevision;
    if (!enabled) return null;
    return getActiveTutorialStep(snapshot);
  }, [enabled, snapshot, localeRevision]);

  const groupSteps = useMemo(() => {
    void localeRevision;
    if (!activeStep?.groupId) return [];
    return getTutorialGroupSteps(activeStep.groupId);
  }, [activeStep?.groupId, localeRevision]);

  useEffect(() => {
    if (!activeStep?.groupId) {
      setTutorialGroupFocus(null);
      return;
    }

    const steps = getTutorialGroupSteps(activeStep.groupId);
    const currentFocus = getTutorialGroupFocus();

    if (currentFocus && steps.some((step) => step.id === currentFocus)) {
      return;
    }

    setTutorialGroupFocus(activeStep.id);
  }, [activeStep?.groupId, activeStep?.id]);

  const displayStep = useMemo(() => {
    void localeRevision;
    if (!activeStep) return null;

    if (activeStep.groupId && groupFocusStepId) {
      const focused = getTutorialStep(groupFocusStepId);
      if (focused?.groupId === activeStep.groupId) {
        return focused;
      }
    }

    return activeStep;
  }, [activeStep, groupFocusStepId, localeRevision]);

  const displayIndex = useMemo(() => {
    if (!displayStep?.groupId) return -1;
    return groupSteps.findIndex((step) => step.id === displayStep.id);
  }, [displayStep, groupSteps]);

  const hasGroupNavigation = groupSteps.length > 1;
  const canGoPreviousInGroup = hasGroupNavigation && displayIndex > 0;
  const isLastStepInGroup =
    hasGroupNavigation && displayIndex >= 0 && displayIndex === groupSteps.length - 1;
  const canGoNextInGroup = hasGroupNavigation && displayIndex >= 0;
  const isRunSpotlight = displayStep?.display === 'spotlight';
  const isRunTutorialPause =
    gameState === 'PLAYING' && Boolean(displayStep?.screens.includes('PLAYING'));

  useEffect(() => {
    setTutorialRunSpotlightActive(Boolean(enabled && isRunTutorialPause));
    return () => setTutorialRunSpotlightActive(false);
  }, [enabled, isRunTutorialPause]);

  const dismissCurrent = useCallback(() => {
    if (!displayStep) return;

    if (displayStep.groupId) {
      dismissTutorialGroup(displayStep.groupId);
      return;
    }

    dismissStep(displayStep.id);
  }, [displayStep]);

  const goToNextInGroup = useCallback(() => {
    if (!displayStep?.groupId) return;

    const steps = getTutorialGroupSteps(displayStep.groupId);
    const index = steps.findIndex((step) => step.id === displayStep.id);
    if (index < 0) return;

    if (index >= steps.length - 1) {
      dismissTutorialGroup(displayStep.groupId);
      return;
    }

    const nextStep = steps[index + 1];
    dismissStep(displayStep.id);
    setTutorialGroupFocus(nextStep.id);
  }, [displayStep]);

  const goToPreviousInGroup = useCallback(() => {
    if (!displayStep?.groupId) return;

    const steps = getTutorialGroupSteps(displayStep.groupId);
    const index = steps.findIndex((step) => step.id === displayStep.id);
    if (index <= 0) return;

    setTutorialGroupFocus(steps[index - 1].id);
  }, [displayStep]);

  useEffect(() => {
    if (!enabled) return;

    for (const step of getTutorialSteps()) {
      if (snapshot.dismissedIds.has(step.id)) continue;
      if (!step.completeWhen(snapshot)) continue;
      dismissStep(step.id);
    }
  }, [enabled, snapshot]);

  return {
    activeStep,
    displayStep,
    dismissCurrent,
    goToNextInGroup,
    goToPreviousInGroup,
    canGoNextInGroup,
    canGoPreviousInGroup,
    isLastStepInGroup,
    hasGroupNavigation,
    isRunSpotlight,
  };
}
