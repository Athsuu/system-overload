import { useApplication, useTick } from '@pixi/react';
import { useCallback, type MutableRefObject, type RefObject } from 'react';
import { useGameStore } from '../store/useGameStore';
import { getScreenBounds } from './constants';
import { spawnEnemyOnEdge } from './enemyMovement';
import { pushSpawnFlash, type GameEffect } from './effects';
import { getRunConfig } from './runConfig';
import type { DissipationNode } from './types';
import { getWaveDefinition, REGULAR_WAVE_COUNT } from './waveConfig';

type WaveState = 'spawning' | 'combat' | 'intermission';

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
  waveRuntimeRef: MutableRefObject<WaveRuntime>;
}

function createWaveRuntime(): WaveRuntime {
  return {
    state: 'spawning',
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

export function WaveEngine({
  isPlaying,
  nodesRef,
  effectsRef,
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

      const runtime = waveRuntimeRef.current;
      const waveDef = getWaveDefinition(runtime.waveIndex);
      if (!waveDef) return;

      const bounds = getScreenBounds(app.screen.width, app.screen.height);
      const config = getRunConfig(store.upgrades, store.runModuleLevels);

      if (runtime.state === 'intermission') {
        runtime.intermissionMs -= ticker.deltaMS;
        if (runtime.intermissionMs <= 0) {
          runtime.waveIndex += 1;
          runtime.spawnGroupIndex = 0;
          runtime.spawnedInGroup = 0;
          runtime.spawnAccumulatorMs = 0;
          runtime.state = 'spawning';

          const nextWave = getWaveDefinition(runtime.waveIndex);
          store.setWaveIndex(runtime.waveIndex);
          store.setWavePhase(nextWave?.isBoss ? 'boss' : 'combat');
          store.setShowWaveClear(false);
        }
        return;
      }

      const spawnGroup = waveDef.spawns[runtime.spawnGroupIndex];
      if (runtime.state === 'spawning' && spawnGroup) {
        if (spawnGroup.intervalMs <= 0 || runtime.spawnedInGroup >= spawnGroup.count) {
          if (runtime.spawnGroupIndex < waveDef.spawns.length - 1) {
            runtime.spawnGroupIndex += 1;
            runtime.spawnedInGroup = 0;
            runtime.spawnAccumulatorMs = 0;
          } else {
            runtime.state = 'combat';
          }
        } else {
          runtime.spawnAccumulatorMs += ticker.deltaMS;
          while (
            runtime.spawnAccumulatorMs >= spawnGroup.intervalMs &&
            runtime.spawnedInGroup < spawnGroup.count
          ) {
            runtime.spawnAccumulatorMs -= spawnGroup.intervalMs;
            runtime.spawnedInGroup += 1;
            const spawned = spawnEnemyOnEdge(bounds, config, {
              tier: spawnGroup.tier,
              waveIndex: runtime.waveIndex,
              isBoss: waveDef.isBoss,
              bossHpMult: waveDef.bossHpMult ?? 1,
              bossSpeedMult: waveDef.bossSpeedMult ?? 1,
            });
            pushSpawnFlash(
              effectsRef.current ?? [],
              spawned.x,
              spawned.y,
              spawned.tier,
              spawned.isBoss ?? false,
            );
            nodes.push(spawned);
          }
        }
      }

      if (runtime.state === 'combat' && nodes.length === 0) {
        if (waveDef.isBoss) {
          store.endRun('victory_boss');
          return;
        }

        if (runtime.waveIndex >= REGULAR_WAVE_COUNT + 1) {
          return;
        }

        runtime.state = 'intermission';
        runtime.intermissionMs = waveDef.interWaveMs;
        store.setWavePhase('intermission');
        store.setShowWaveClear(true);
      }
    },
    [app.screen.height, app.screen.width, effectsRef, isPlaying, nodesRef, waveRuntimeRef],
  );

  useTick({ callback: tick, isEnabled: isPlaying });

  return null;
}
