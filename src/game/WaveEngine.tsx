import { useApplication, useTick } from '@pixi/react';
import { useCallback, type MutableRefObject, type RefObject } from 'react';
import { consumeDevWaveJump } from '../dev/devFlags';
import { triggerRunEventSfx } from '../audio/sfxApi';
import { useGameStore } from '../store/useGameStore';
import { getScreenBounds } from './constants';
import { getEnemyClassFromBossWave } from './enemyClass';
import { spawnEnemyOnEdge } from './enemyMovement';
import { pushSpawnFlash, type GameEffect } from './effects';
import type { LootPickup } from './loot';
import { getRunConfig, getCycleSpawnIntervalMs, getCycleSpawnQuota, getCycleWaveMaxAlive, getSpawnIntervalMs, getWaveMaxAlive } from './runConfig';
import { scaleDeltaMs } from './runTimeScale';
import type { DissipationNode } from './types';
import { jumpToWaveIndex } from './waveJump';
import { getWaveDefinition, getWaveSpawnCount, REGULAR_WAVE_COUNT } from './waveConfig';

type WaveState = 'active' | 'intermission';

interface WaveRuntime {
  state: WaveState;
  waveIndex: number;
  spawnGroupIndex: number;
  spawnedInGroup: number;
  intermissionMs: number;
  spawnAccumulatorMs: number;
}

interface WaveEngineProps {
  isPlaying: boolean;
  nodesRef: RefObject<DissipationNode[]>;
  effectsRef: RefObject<GameEffect[]>;
  pickupsRef: RefObject<LootPickup[]>;
  waveRuntimeRef: MutableRefObject<WaveRuntime>;
}

function createWaveRuntime(): WaveRuntime {
  return {
    state: 'active',
    waveIndex: 1,
    spawnGroupIndex: 0,
    spawnedInGroup: 0,
    intermissionMs: 0,
    spawnAccumulatorMs: 0,
  };
}

export function resetWaveRuntime(ref: MutableRefObject<WaveRuntime>): void {
  ref.current = createWaveRuntime();
}

function trySpawnFromGroup(
  nodes: DissipationNode[],
  bounds: ReturnType<typeof getScreenBounds>,
  config: ReturnType<typeof getRunConfig>,
  waveDef: NonNullable<ReturnType<typeof getWaveDefinition>>,
  _spawnGroup: (typeof waveDef.spawns)[number],
  runtime: WaveRuntime,
  effects: GameEffect[],
  waveSpawnQuota: number,
  waveMaxAlive: number,
): void {
  if (runtime.spawnedInGroup >= waveSpawnQuota) return;
  if (nodes.length >= waveMaxAlive) return;

  const spawned = spawnEnemyOnEdge(bounds, config, {
    waveIndex: runtime.waveIndex,
    enemyClass: getEnemyClassFromBossWave(waveDef.isBoss),
  });
  pushSpawnFlash(effects, spawned.x, spawned.y, spawned.waveIndex, spawned.enemyClass);
  nodes.push(spawned);
  runtime.spawnedInGroup += 1;
}

export function WaveEngine({
  isPlaying,
  nodesRef,
  effectsRef,
  pickupsRef,
  waveRuntimeRef,
}: WaveEngineProps) {
  const { app } = useApplication();

  const tick = useCallback(
    (ticker: { deltaMS: number }) => {
      if (!isPlaying) return;

      const nodes = nodesRef.current;
      if (!nodes) return;

      const store = useGameStore.getState();
      if (store.gameState !== 'PLAYING') return;

      const pendingWave = consumeDevWaveJump();
      if (pendingWave !== null) {
        jumpToWaveIndex(pendingWave, waveRuntimeRef, nodesRef, effectsRef, pickupsRef);
        return;
      }

      const runtime = waveRuntimeRef.current;
      const waveDef = getWaveDefinition(runtime.waveIndex);
      if (!waveDef) return;

      const bounds = getScreenBounds(app.screen.width, app.screen.height);
      const config = getRunConfig(store.upgrades);
      const effects = effectsRef.current ?? [];

      const spawnGroup = waveDef.spawns[runtime.spawnGroupIndex];
      const scaleSpawns = !waveDef.isBoss;
      const baseSpawnCount = spawnGroup
        ? scaleSpawns
          ? getCycleSpawnQuota(spawnGroup.count)
          : spawnGroup.count
        : 0;
      const waveSpawnQuota = spawnGroup
        ? getWaveSpawnCount(runtime.waveIndex, baseSpawnCount, config.starterNodes)
        : 0;

      if (runtime.state === 'intermission') {
        runtime.intermissionMs -= scaleDeltaMs(ticker.deltaMS);
        if (runtime.intermissionMs <= 0) {
          runtime.waveIndex += 1;
          runtime.spawnGroupIndex = 0;
          runtime.spawnedInGroup = 0;
          runtime.spawnAccumulatorMs = 0;
          runtime.state = 'active';

          const nextWave = getWaveDefinition(runtime.waveIndex);
          store.setWaveIndex(runtime.waveIndex);
          store.setWavePhase(nextWave?.isBoss ? 'boss' : 'spawning');
          store.setShowWaveClear(false);
          if (nextWave?.isBoss) {
            triggerRunEventSfx('bossIncoming');
          } else {
            triggerRunEventSfx('waveResume');
          }
        }
        return;
      }

      if (spawnGroup) {
        const quotaMet = runtime.spawnedInGroup >= waveSpawnQuota;
        const waveMaxAlive = scaleSpawns
          ? getCycleWaveMaxAlive(spawnGroup.maxAlive, config)
          : getWaveMaxAlive(spawnGroup.maxAlive, config);
        const spawnIntervalMs = scaleSpawns
          ? getCycleSpawnIntervalMs(spawnGroup.intervalMs, config)
          : getSpawnIntervalMs(spawnGroup.intervalMs, config);

        if (!quotaMet) {
          const spawnDelta = Math.min(scaleDeltaMs(ticker.deltaMS), spawnIntervalMs);

          if (spawnIntervalMs <= 0) {
            if (nodes.length < waveMaxAlive) {
              trySpawnFromGroup(
                nodes,
                bounds,
                config,
                waveDef,
                spawnGroup,
                runtime,
                effects,
                waveSpawnQuota,
                waveMaxAlive,
              );
            }
          } else {
            runtime.spawnAccumulatorMs += spawnDelta;
            if (
              runtime.spawnAccumulatorMs >= spawnIntervalMs &&
              runtime.spawnedInGroup < waveSpawnQuota &&
              nodes.length < waveMaxAlive
            ) {
              runtime.spawnAccumulatorMs -= spawnIntervalMs;
              trySpawnFromGroup(
                nodes,
                bounds,
                config,
                waveDef,
                spawnGroup,
                runtime,
                effects,
                waveSpawnQuota,
                waveMaxAlive,
              );
            }
          }
        }

        if (nodes.length > 0) {
          store.setWavePhase(waveDef.isBoss ? 'boss' : 'combat');
        } else if (!quotaMet) {
          store.setWavePhase('spawning');
        }

        const groupComplete =
          runtime.spawnedInGroup >= waveSpawnQuota &&
          runtime.spawnGroupIndex >= waveDef.spawns.length - 1;

        if (groupComplete && nodes.length === 0) {
          if (waveDef.isBoss) {
            triggerRunEventSfx('victory');
            store.endRun('victory_boss');
            return;
          }

          if (runtime.waveIndex >= REGULAR_WAVE_COUNT + 1) {
            return;
          }

          runtime.state = 'intermission';
          runtime.intermissionMs = waveDef.interWaveMs;
          store.setWavePhase('intermission');
          triggerRunEventSfx('waveClear');
          store.setShowWaveClear(true);
        }
      }
    },
    [app.screen.height, app.screen.width, effectsRef, isPlaying, nodesRef, pickupsRef, waveRuntimeRef],
  );

  useTick({ callback: tick, isEnabled: isPlaying });

  return null;
}
