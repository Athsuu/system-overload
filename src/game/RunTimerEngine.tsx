import { useTick } from '@pixi/react';
import { useCallback, useRef, type MutableRefObject } from 'react';
import { useGameStore } from '../store/useGameStore';
import { BREACH_URGENT_THRESHOLD } from '../theme/darkHexTerminal';
import { triggerScreenShake, type ScreenShakeState } from './juice/screenShake';
import { consumeOverclockActivationRequest, tickOverclock, type OverclockState } from './overclock';
import { applyTimeOverload } from './overload';
import { addRunElapsedMs } from './runElapsed';
import { getBreachPercent, getRunConfig } from './runConfig';
import { scaleDeltaMs, scaleDeltaSeconds } from './runTimeScale';

interface RunTimerEngineProps {
  isPlaying: boolean;
  overclockRef: MutableRefObject<OverclockState>;
  screenShakeRef: MutableRefObject<ScreenShakeState>;
}

export function RunTimerEngine({ isPlaying, overclockRef, screenShakeRef }: RunTimerEngineProps) {
  const wasOverloadUrgentRef = useRef(false);

  const tick = useCallback(
    (ticker: { deltaMS: number }) => {
      const store = useGameStore.getState();
      if (store.gameState !== 'PLAYING') return;

      consumeOverclockActivationRequest(overclockRef);
      const scaledDeltaMs = scaleDeltaMs(ticker.deltaMS);
      addRunElapsedMs(scaledDeltaMs);
      tickOverclock(overclockRef, scaledDeltaMs);

      const config = getRunConfig(store.upgrades);
      const deltaSeconds = scaleDeltaSeconds(ticker.deltaMS / 1000);
      const heatMult = overclockRef.current.active ? 0.6 : 1;
      applyTimeOverload(config, deltaSeconds, heatMult);

      const breachPercent = getBreachPercent(store.breachProgress, store.upgrades);
      const isOverloadUrgent = breachPercent >= BREACH_URGENT_THRESHOLD;
      if (isOverloadUrgent && !wasOverloadUrgentRef.current) {
        triggerScreenShake(screenShakeRef.current, 'overloadUrgent');
      }
      wasOverloadUrgentRef.current = isOverloadUrgent;
    },
    [overclockRef, screenShakeRef],
  );

  useTick({ callback: tick, isEnabled: isPlaying });

  return null;
}
