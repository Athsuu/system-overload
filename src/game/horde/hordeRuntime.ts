import type { MutableRefObject } from 'react';
import type { HordeRuntime } from './types';

export function createHordeRuntime(): HordeRuntime {
  return {
    phase: 'horde',
    spawnAccumulatorMs: 0,
    bossSpawned: false,
    victoryTriggered: false,
  };
}

export function resetHordeRuntime(ref: MutableRefObject<HordeRuntime>): void {
  ref.current = createHordeRuntime();
}
