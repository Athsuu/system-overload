import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import type { TutorialSnapshot } from './tutorialCatalog';
import { getActiveArchAmbient } from './archAmbientCatalog';
import {
  loadHeardArchAmbientIds,
  markArchAmbientHeard,
  subscribeArchAmbient,
} from './archAmbientPersistence';
import { isStepDismissed, subscribeTutorialProgress } from './tutorialPersistence';
import { getTutorialSignals, subscribeTutorialSignals } from './tutorialSignals';

export function useArchAmbient(enabled: boolean) {
  const gameState = useGameStore((state) => state.gameState);
  const breachProgress = useGameStore((state) => state.breachProgress);
  const runShards = useGameStore((state) => state.runShards);
  const bankShards = useGameStore((state) => state.bankShards);
  const upgrades = useGameStore((state) => state.upgrades);
  const prestigeUnlocked = useGameStore((state) => state.prestigeUnlocked);
  const waveIndex = useGameStore((state) => state.waveIndex);
  const wavePhase = useGameStore((state) => state.wavePhase);
  const runOutcome = useGameStore((state) => state.runOutcome);

  const [ambientRevision, setAmbientRevision] = useState(0);
  const [signalRevision, setSignalRevision] = useState(0);
  const [progressRevision, setProgressRevision] = useState(0);

  useEffect(() => subscribeArchAmbient(() => setAmbientRevision((n) => n + 1)), []);
  useEffect(() => subscribeTutorialSignals(() => setSignalRevision((n) => n + 1)), []);
  useEffect(() => subscribeTutorialProgress(() => setProgressRevision((n) => n + 1)), []);

  const heardIds = useMemo(() => {
    void ambientRevision;
    return new Set(loadHeardArchAmbientIds());
  }, [ambientRevision]);

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
      dismissedIds: new Set<string>(),
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
    signalRevision,
  ]);

  const archIntroDismissed = useMemo(() => {
    void progressRevision;
    return isStepDismissed('welcome');
  }, [progressRevision]);

  const activeLine = useMemo(() => {
    if (!enabled) return null;
    return getActiveArchAmbient(snapshot, heardIds, archIntroDismissed);
  }, [enabled, snapshot, heardIds, archIntroDismissed]);

  const dismissActive = useCallback(() => {
    if (!activeLine) return;
    markArchAmbientHeard(activeLine.id);
  }, [activeLine]);

  useEffect(() => {
    if (!activeLine) return;
    const timeoutId = window.setTimeout(() => {
      markArchAmbientHeard(activeLine.id);
    }, 5000);
    return () => window.clearTimeout(timeoutId);
  }, [activeLine?.id]);

  return { activeLine, dismissActive };
}
