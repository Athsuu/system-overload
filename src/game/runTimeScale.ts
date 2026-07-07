import { useGameStore } from '../store/useGameStore';
import { getRunTimeScale } from './runConfig';

function readTimeScale(): number {
  const state = useGameStore.getState();
  return getRunTimeScale(state.upgrades, state.fluxDriveEnabled);
}

export function scaleDeltaMs(deltaMs: number): number {
  if (deltaMs <= 0) return deltaMs;
  return deltaMs * readTimeScale();
}

export function scaleDeltaSeconds(deltaSeconds: number): number {
  if (deltaSeconds <= 0) return deltaSeconds;
  return deltaSeconds * readTimeScale();
}
