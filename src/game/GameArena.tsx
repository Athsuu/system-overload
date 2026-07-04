import { useApplication } from '@pixi/react';
import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { createOverclockState, tryActivateOverclock, type OverclockState } from './activeSkill';
import { getArenaCenter, getScreenBounds } from './constants';
import { DissipationNodes } from './DissipationNodes';
import { EffectEngine } from './EffectEngine';
import type { GameEffect } from './effects';
import { PlayerCore } from './PlayerCore';
import { ParticleEngine } from './ParticleEngine';
import {
  createPlayerState,
  resetPlayer,
  tickPlayerMovement,
  WASD_KEY_CODES,
  type PlayerState,
} from './playerMovement';
import { getOverclockDurationMs, RunTimerEngine, tickOverclockFromStore } from './RunTimerEngine';
import { spawnStarterNodes } from './NodeSpawner';
import { getRunConfig } from './runConfig';
import { resetWaveRuntime, WaveEngine } from './WaveEngine';
import type { DissipationNode } from './types';

interface WaveRuntime {
  state: 'spawning' | 'combat' | 'intermission';
  waveIndex: number;
  spawnGroupIndex: number;
  spawnedInGroup: number;
  intermissionMs: number;
  spawnAccumulatorMs: number;
}

export function GameArena() {
  const gameState = useGameStore((state) => state.gameState);
  const isPlaying = gameState === 'PLAYING';
  const isDraft = gameState === 'DRAFT';
  const isPaused = gameState === 'PAUSED';
  const isRunActive = isPlaying || isDraft || isPaused;
  const { app } = useApplication();
  const spawnCenter = getArenaCenter(app.screen.width, app.screen.height);
  const nodesRef = useRef<DissipationNode[]>([]);
  const effectsRef = useRef<GameEffect[]>([]);
  const elapsedTimeRef = useRef(0);
  const playerRef = useRef<PlayerState>(createPlayerState(spawnCenter));
  const keysRef = useRef<Set<string>>(new Set());
  const overclockRef = useRef<OverclockState>(createOverclockState());
  const waveRuntimeRef = useRef<WaveRuntime>({
    state: 'spawning',
    waveIndex: 1,
    spawnGroupIndex: 0,
    spawnedInGroup: 0,
    intermissionMs: 0,
    spawnAccumulatorMs: 0,
  });
  const prevGameStateRef = useRef(gameState);

  useEffect(() => {
    const prev = prevGameStateRef.current;
    const isNewRun =
      gameState === 'PLAYING' && prev !== 'PLAYING' && prev !== 'DRAFT' && prev !== 'PAUSED';

    if (isNewRun) {
      const center = getArenaCenter(app.screen.width, app.screen.height);
      nodesRef.current = [];
      effectsRef.current = [];
      elapsedTimeRef.current = 0;
      resetPlayer(playerRef.current, center);
      keysRef.current.clear();
      overclockRef.current = createOverclockState();
      resetWaveRuntime(waveRuntimeRef);
      useGameStore.getState().setWaveIndex(1);
      useGameStore.getState().setWavePhase('spawning');

      const config = getRunConfig(
        useGameStore.getState().upgrades,
        useGameStore.getState().runDraftLevels,
      );
      const bounds = getScreenBounds(app.screen.width, app.screen.height);
      spawnStarterNodes(config.starterNodes, center, nodesRef.current, bounds, config);
    }

    prevGameStateRef.current = gameState;
  }, [app.screen.height, app.screen.width, gameState]);

  useEffect(() => {
    if (!isPlaying) {
      effectsRef.current = [];
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying && !isDraft) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (WASD_KEY_CODES.has(event.code)) {
        keysRef.current.add(event.code);
        event.preventDefault();
        return;
      }

      if (event.code !== 'Space' || useGameStore.getState().gameState !== 'PLAYING') return;
      event.preventDefault();

      const store = useGameStore.getState();
      const durationMs =
        getOverclockDurationMs(store.runDraftLevels) + store.upgrades.rapidCycle * 200;
      tryActivateOverclock(overclockRef.current, durationMs);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (WASD_KEY_CODES.has(event.code)) {
        keysRef.current.delete(event.code);
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isPlaying, isDraft]);

  useEffect(() => {
    if (!isPlaying && !isDraft) return;

    let frameId = 0;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const deltaSeconds = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      const bounds = getScreenBounds(app.screen.width, app.screen.height);
      const config = getRunConfig(
        useGameStore.getState().upgrades,
        useGameStore.getState().runDraftLevels,
      );
      tickPlayerMovement(
        playerRef.current,
        keysRef.current,
        bounds,
        deltaSeconds,
        config.playerSpeed,
      );

      if (useGameStore.getState().gameState === 'PLAYING') {
        tickOverclockFromStore(overclockRef, deltaSeconds * 1000);
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [app.screen.height, app.screen.width, isPlaying, isDraft]);

  return (
    <>
      <PlayerCore playerRef={playerRef} overclockRef={overclockRef} />
      <EffectEngine isPlaying={isPlaying} effectsRef={effectsRef} />
      <RunTimerEngine isPlaying={isPlaying} overclockRef={overclockRef} />
      <WaveEngine
        isPlaying={isPlaying}
        nodesRef={nodesRef}
        effectsRef={effectsRef}
        playerRef={playerRef}
        waveRuntimeRef={waveRuntimeRef}
      />
      <DissipationNodes
        nodesRef={nodesRef}
        effectsRef={effectsRef}
        isPlaying={isPlaying}
        playerRef={playerRef}
      />
      <ParticleEngine
        isPlaying={isPlaying}
        isRunActive={isRunActive}
        playerRef={playerRef}
        nodesRef={nodesRef}
        effectsRef={effectsRef}
        elapsedTimeRef={elapsedTimeRef}
        overclockRef={overclockRef}
      />
    </>
  );
}
