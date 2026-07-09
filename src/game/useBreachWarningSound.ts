import { useEffect, useRef } from 'react';
import { BREACH_URGENT_THRESHOLD } from '../theme/darkHexTerminal';
import { getBreachPercent } from './runConfig';
import { triggerRunEventSfx } from '../audio/sfxApi';
import { useGameStore } from '../store/useGameStore';

export function useBreachWarningSound(): void {
  const gameState = useGameStore((state) => state.gameState);
  const breachProgress = useGameStore((state) => state.breachProgress);
  const upgrades = useGameStore((state) => state.upgrades);
  const warnedRef = useRef(false);

  useEffect(() => {
    if (gameState !== 'PLAYING') {
      warnedRef.current = false;
      return;
    }

    if (getBreachPercent(breachProgress, upgrades) >= BREACH_URGENT_THRESHOLD && !warnedRef.current) {
      warnedRef.current = true;
      triggerRunEventSfx('breachWarning');
    }
  }, [breachProgress, gameState, upgrades]);
}
