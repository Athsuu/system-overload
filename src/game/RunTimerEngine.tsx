import { useTick } from '@pixi/react';
import { useCallback, type MutableRefObject } from 'react';
import { useGameStore } from '../store/useGameStore';
import {
  getOverclockCooldownMs,
  getOverclockDurationMs,
  type OverclockState,
} from './activeSkill';
import { syncOverclockDisplay } from './overclockDisplay';
import { applyTimeOverload } from './overload';
import { getRunConfig } from './runConfig';
import { scaleDeltaSeconds } from './runTimeScale';

interface RunTimerEngineProps {
  isPlaying: boolean;
  overclockRef: MutableRefObject<OverclockState>;
}

export function RunTimerEngine({ isPlaying, overclockRef }: RunTimerEngineProps) {
  const tick = useCallback(
    (ticker: { deltaMS: number }) => {
      const store = useGameStore.getState();
      if (store.gameState !== 'PLAYING') return;

      const config = getRunConfig(store.upgrades);
      const deltaSeconds = scaleDeltaSeconds(ticker.deltaMS / 1000);
      const heatMult = overclockRef.current.active ? 0.6 : 1;
      applyTimeOverload(config, deltaSeconds, heatMult);
    },
    [overclockRef],
  );

  useTick({ callback: tick, isEnabled: isPlaying });

  return null;
}

export function tickOverclockFromStore(
  overclockRef: MutableRefObject<OverclockState>,
  deltaMs: number,
): void {
  const cooldownMs = getOverclockCooldownMs();

  const state = overclockRef.current;
  if (state.active) {
    state.activeTimerMs -= deltaMs;
    if (state.activeTimerMs <= 0) {
      state.active = false;
      state.cooldownTimerMs = cooldownMs;
    }
    return;
  }

  if (state.cooldownTimerMs > 0) {
    state.cooldownTimerMs = Math.max(0, state.cooldownTimerMs - deltaMs);
  }

  syncOverclockDisplay(state.active, state.cooldownTimerMs, cooldownMs);
}

export { getOverclockDurationMs, getOverclockCooldownMs };
