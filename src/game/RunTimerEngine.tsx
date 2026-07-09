import { useTick } from '@pixi/react';
import { useCallback, type MutableRefObject } from 'react';
import { useGameStore } from '../store/useGameStore';
import { consumeOverclockActivationRequest, tickOverclock, type OverclockState } from './overclock';
import { applyTimeOverload } from './overload';
import { getRunConfig } from './runConfig';
import { scaleDeltaMs, scaleDeltaSeconds } from './runTimeScale';

interface RunTimerEngineProps {
  isPlaying: boolean;
  overclockRef: MutableRefObject<OverclockState>;
}

export function RunTimerEngine({ isPlaying, overclockRef }: RunTimerEngineProps) {
  const tick = useCallback(
    (ticker: { deltaMS: number }) => {
      const store = useGameStore.getState();
      if (store.gameState !== 'PLAYING') return;

      consumeOverclockActivationRequest(overclockRef);
      tickOverclock(overclockRef, scaleDeltaMs(ticker.deltaMS));

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
