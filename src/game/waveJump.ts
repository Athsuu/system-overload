import type { MutableRefObject, RefObject } from 'react';
import { useGameStore } from '../store/useGameStore';
import type { GameEffect } from './effects';
import type { LootPickup } from './loot';
import type { DissipationNode } from './types';
import { getWaveDefinition } from './waveConfig';

interface WaveRuntime {
  state: 'active' | 'intermission';
  waveIndex: number;
  spawnGroupIndex: number;
  spawnedInGroup: number;
  intermissionMs: number;
  spawnAccumulatorMs: number;
}

export function jumpToWaveIndex(
  waveIndex: number,
  runtimeRef: MutableRefObject<WaveRuntime>,
  nodesRef: RefObject<DissipationNode[]>,
  effectsRef: RefObject<GameEffect[]>,
  pickupsRef?: RefObject<LootPickup[]>,
): boolean {
  const waveDef = getWaveDefinition(waveIndex);
  if (!waveDef) return false;

  const nodes = nodesRef.current;
  if (nodes) {
    nodes.length = 0;
  }

  const effects = effectsRef.current;
  if (effects) {
    effects.length = 0;
  }

  const pickups = pickupsRef?.current;
  if (pickups) {
    pickups.length = 0;
  }

  runtimeRef.current = {
    state: 'active',
    waveIndex,
    spawnGroupIndex: 0,
    spawnedInGroup: 0,
    intermissionMs: 0,
    spawnAccumulatorMs: 0,
  };

  const store = useGameStore.getState();
  store.setWaveIndex(waveIndex);
  store.setWavePhase(waveDef.isBoss ? 'boss' : 'spawning');
  store.setShowWaveClear(false);

  return true;
}
