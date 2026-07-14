import { useApplication, useTick } from '@pixi/react';
import type { Container } from 'pixi.js';
import { useCallback, useEffect, useRef } from 'react';
import { applyAudioVolumes, ensureAudioUnlocked } from '../audio/sfxApi';
import { useSettingsStore } from '../store/useSettingsStore';
import { useGameStore } from '../store/useGameStore';
import { useRunTutorialSpotlightActive } from '../tutorial/useRunTutorialSpotlightActive';
import { createOverclockState, requestOverclockActivation, syncOverclockDisplay, type OverclockState } from './overclock';
import { isOverclockUnlocked } from '../store/upgradeCatalog';
import { DissipationNodes } from './DissipationNodes';
import { EffectEngine } from './EffectEngine';
import type { GameEffect } from './effects';
import { BadgeFlyParticleEngine } from './juice/BadgeFlyParticleEngine';
import { createBadgeFlyParticlePool, type BadgeFlyParticle } from './juice/badgeFlyParticles';
import { createChromaticAberrationState } from './juice/chromaticAberration';
import { createScreenShake, getScreenShakeOffset, tickScreenShake } from './juice/screenShake';
import { PurgeZoneEngine } from './PurgeZoneEngine';
import { LootPickupEngine, type LootPickup } from './loot';
import {
  activatePurgePointer,
  resetPurgePointer,
  seedPurgePointer,
  trackClientPointer,
} from './purgeInput';
import { RunTimerEngine } from './RunTimerEngine';
import { resetLeakBurstTracker, resetMeltdownGuard } from './overload';
import { scaleDeltaMs } from './runTimeScale';
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
  const pickupsRef = useRef<LootPickup[]>([]);
  const badgeParticlesRef = useRef<BadgeFlyParticle[]>(createBadgeFlyParticlePool());
  const overclockRef = useRef<OverclockState>(createOverclockState());
  const screenShakeRef = useRef(createScreenShake());
  const chromaticAberrationRef = useRef(createChromaticAberrationState());
  const arenaContainerRef = useRef<Container | null>(null);
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
      pickupsRef.current = [];
      for (const particle of badgeParticlesRef.current) {
        particle.active = false;
      }
      resetPurgePointer();
      overclockRef.current = createOverclockState();
      syncOverclockDisplay(overclockRef.current);
      screenShakeRef.current = createScreenShake();
      chromaticAberrationRef.current = createChromaticAberrationState();
      resetWaveRuntime(waveRuntimeRef);
      resetLeakBurstTracker();
      resetMeltdownGuard();
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
      pickupsRef.current = [];
    }
  }, [isPlaying]);

  // Position écran brute — indépendante de l'état de jeu (clic « Lancer la run » inclus).
  useEffect(() => {
    const onRawPointerMove = (event: PointerEvent) => {
      trackClientPointer(event.clientX, event.clientY);
    };
    const onRawPointerDown = (event: PointerEvent) => {
      trackClientPointer(event.clientX, event.clientY);
    };
    window.addEventListener('pointermove', onRawPointerMove);
    window.addEventListener('pointerdown', onRawPointerDown);
    return () => {
      window.removeEventListener('pointermove', onRawPointerMove);
      window.removeEventListener('pointerdown', onRawPointerDown);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    let seedFrameId = 0;
    let cancelled = false;
    let listenersAttached = false;

    const trySeedPurgePointer = () => {
      if (cancelled || tutorialRunSpotlightActive || !app?.renderer) return;
      if (seedPurgePointer(app)) return;
      seedFrameId = requestAnimationFrame(trySeedPurgePointer);
    };

    const attachPointerListeners = (): (() => void) | undefined => {
      if (cancelled || listenersAttached || !app?.renderer) return undefined;
      listenersAttached = true;

      const onPointerMove = (event: PointerEvent) => {
        if (tutorialRunSpotlightActive) return;
        ensureAudioUnlocked();
        trackClientPointer(event.clientX, event.clientY);
        activatePurgePointer(app, event.clientX, event.clientY);
      };

      const onPointerDown = (event: PointerEvent) => {
        if (tutorialRunSpotlightActive) return;
        trackClientPointer(event.clientX, event.clientY);
        activatePurgePointer(app, event.clientX, event.clientY);
      };

      const onPointerEnter = (event: PointerEvent) => {
        if (tutorialRunSpotlightActive) return;
        trackClientPointer(event.clientX, event.clientY);
        activatePurgePointer(app, event.clientX, event.clientY);
      };

      const onPointerLeave = () => {
        resetPurgePointer();
      };

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.code !== 'Space' || useGameStore.getState().gameState !== 'PLAYING') return;
        if (tutorialRunSpotlightActive) return;
        if (!isOverclockUnlocked(useGameStore.getState().upgrades)) return;
        event.preventDefault();
        requestOverclockActivation();
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointerenter', onPointerEnter);
      window.addEventListener('pointerleave', onPointerLeave);
      window.addEventListener('keydown', onKeyDown);

      return () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointerenter', onPointerEnter);
        window.removeEventListener('pointerleave', onPointerLeave);
        window.removeEventListener('keydown', onKeyDown);
      };
    };

    let detachListeners: (() => void) | undefined;

    const bootstrap = () => {
      if (cancelled) return;

      if (!app?.renderer) {
        seedFrameId = requestAnimationFrame(bootstrap);
        return;
      }

      detachListeners = attachPointerListeners();
      trySeedPurgePointer();
    };

    bootstrap();

    return () => {
      cancelled = true;
      cancelAnimationFrame(seedFrameId);
      detachListeners?.();
      resetPurgePointer();
    };
  }, [app, isPlaying, tutorialRunSpotlightActive]);

  const shakeTick = useCallback(
    (ticker: { deltaMS: number }) => {
      const container = arenaContainerRef.current;
      if (!container) return;

      tickScreenShake(screenShakeRef.current, scaleDeltaMs(ticker.deltaMS));
      const offset = getScreenShakeOffset(screenShakeRef.current);
      container.x = offset.x;
      container.y = offset.y;
    },
    [],
  );

  useTick({ callback: shakeTick, isEnabled: isRunLive });

  return (
    <pixiContainer ref={arenaContainerRef}>
      <PurgeZoneEngine
        isPlaying={isRunLive}
        nodesRef={nodesRef}
        effectsRef={effectsRef}
        pickupsRef={pickupsRef}
        overclockRef={overclockRef}
        screenShakeRef={screenShakeRef}
        chromaticAberrationRef={chromaticAberrationRef}
      />
      <LootPickupEngine isPlaying={isRunLive} pickupsRef={pickupsRef} badgeParticlesRef={badgeParticlesRef} />
      <BadgeFlyParticleEngine isPlaying={isRunLive} particlesRef={badgeParticlesRef} />
      <EffectEngine isPlaying={isRunLive} effectsRef={effectsRef} />
      <RunTimerEngine isPlaying={isRunLive} overclockRef={overclockRef} screenShakeRef={screenShakeRef} />
      <WaveEngine
        isPlaying={isRunLive}
        nodesRef={nodesRef}
        effectsRef={effectsRef}
        pickupsRef={pickupsRef}
        waveRuntimeRef={waveRuntimeRef}
      />
      <DissipationNodes
        nodesRef={nodesRef}
        effectsRef={effectsRef}
        isPlaying={isRunLive}
        chromaticAberrationRef={chromaticAberrationRef}
      />
    </pixiContainer>
  );
}
