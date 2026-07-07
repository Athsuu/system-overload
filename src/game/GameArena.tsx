import { useApplication } from '@pixi/react';
import { useEffect, useRef } from 'react';
import { ensureGameAudioUnlocked } from '../audio/gameAudio';
import { applyAudioVolumes } from '../audio/hubAudio';
import { useSettingsStore } from '../store/useSettingsStore';
import { useGameStore } from '../store/useGameStore';
import { useRunTutorialSpotlightActive } from '../tutorial/useRunTutorialSpotlightActive';
import { createOverclockState, type OverclockState } from './activeSkill';
import { consumeOverclockActivationRequest, requestOverclockActivation } from './overclockInput';
import { isOverclockUnlocked } from '../store/upgradeCatalog';
import { DissipationNodes } from './DissipationNodes';
import { EffectEngine } from './EffectEngine';
import type { GameEffect } from './effects';
import { PurgeZoneEngine } from './PurgeZoneEngine';
import { purgePointerRef, resetPurgePointer } from './purgeInput';
import { RunTimerEngine, tickOverclockFromStore } from './RunTimerEngine';
import { scaleDeltaMs } from './runTimeScale';
import { resetLeakBurstTracker } from './overload';
import { resetWaveRuntime, WaveEngine } from './WaveEngine';
import type { DissipationNode } from './types';

export function GameArena() {
  const gameState = useGameStore((state) => state.gameState);
  const masterVolume = useSettingsStore((state) => state.masterVolume);
  const musicVolume = useSettingsStore((state) => state.musicVolume);
  const sfxVolume = useSettingsStore((state) => state.sfxVolume);
  const tutorialRunSpotlightActive = useRunTutorialSpotlightActive();
  const isPlaying = gameState === 'PLAYING';
  const isRunLive = isPlaying && !tutorialRunSpotlightActive;
  const { app } = useApplication();
  const nodesRef = useRef<DissipationNode[]>([]);
  const effectsRef = useRef<GameEffect[]>([]);
  const overclockRef = useRef<OverclockState>(createOverclockState());
  const waveRuntimeRef = useRef({
    state: 'active' as const,
    waveIndex: 1,
    spawnGroupIndex: 0,
    spawnedInGroup: 0,
    intermissionMs: 0,
    spawnAccumulatorMs: 0,
  });
  const prevGameStateRef = useRef(gameState);

  useEffect(() => {
    applyAudioVolumes(masterVolume, musicVolume, sfxVolume);
  }, [masterVolume, musicVolume, sfxVolume]);

  useEffect(() => {
    const prev = prevGameStateRef.current;
    const isNewRun =
      gameState === 'PLAYING' && prev !== 'PLAYING' && prev !== 'PAUSED';

    if (isNewRun) {
      nodesRef.current = [];
      effectsRef.current = [];
      resetPurgePointer();
      overclockRef.current = createOverclockState();
      resetWaveRuntime(waveRuntimeRef);
      resetLeakBurstTracker();
      useGameStore.getState().setWaveIndex(1);
      useGameStore.getState().setWavePhase('spawning');
    }

    if (gameState !== 'PLAYING') {
      resetPurgePointer();
    }

    prevGameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    if (!isPlaying) {
      effectsRef.current = [];
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = app.canvas;

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const scaleX = app.screen.width / rect.width;
      const scaleY = app.screen.height / rect.height;
      purgePointerRef.x = (clientX - rect.left) * scaleX;
      purgePointerRef.y = (clientY - rect.top) * scaleY;
      purgePointerRef.active = true;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (tutorialRunSpotlightActive) return;
      ensureGameAudioUnlocked();
      updatePointer(event.clientX, event.clientY);
    };

    const onPointerLeave = () => {
      purgePointerRef.active = false;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || useGameStore.getState().gameState !== 'PLAYING') return;
      if (tutorialRunSpotlightActive) return;
      if (!isOverclockUnlocked(useGameStore.getState().upgrades)) return;
      event.preventDefault();
      requestOverclockActivation();
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('keydown', onKeyDown);
      resetPurgePointer();
    };
  }, [app, isPlaying, tutorialRunSpotlightActive]);

  useEffect(() => {
    if (!isPlaying) return;

    let frameId = 0;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const deltaSeconds = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      if (useGameStore.getState().gameState === 'PLAYING' && !tutorialRunSpotlightActive) {
        consumeOverclockActivationRequest(overclockRef);
        tickOverclockFromStore(overclockRef, scaleDeltaMs(deltaSeconds * 1000));
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, tutorialRunSpotlightActive]);

  return (
    <>
      <PurgeZoneEngine
        isPlaying={isRunLive}
        nodesRef={nodesRef}
        effectsRef={effectsRef}
        overclockRef={overclockRef}
      />
      <EffectEngine isPlaying={isRunLive} effectsRef={effectsRef} />
      <RunTimerEngine isPlaying={isRunLive} overclockRef={overclockRef} />
      <WaveEngine
        isPlaying={isRunLive}
        nodesRef={nodesRef}
        effectsRef={effectsRef}
        waveRuntimeRef={waveRuntimeRef}
      />
      <DissipationNodes nodesRef={nodesRef} effectsRef={effectsRef} isPlaying={isRunLive} />
    </>
  );
}
