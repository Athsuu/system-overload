import type { MutableRefObject } from 'react';
import { isOverclockUnlocked } from '../../store/upgradeCatalog';
import { useGameStore } from '../../store/useGameStore';
import { isNodeAnchorActive } from '../anchorSupercharge';
import { getOverclockDurationMs, tryActivateOverclock, type OverclockState } from './state';
import { syncOverclockDisplay } from './display';

export const overclockInputRef = {
  activateRequested: false,
};

export function requestOverclockActivation(): void {
  overclockInputRef.activateRequested = true;
}

export function consumeOverclockActivationRequest(
  overclockRef: MutableRefObject<OverclockState>,
): void {
  if (!overclockInputRef.activateRequested) return;
  overclockInputRef.activateRequested = false;

  const { gameState, upgrades, anchoredNodes } = useGameStore.getState();
  if (gameState !== 'PLAYING') return;
  if (!isOverclockUnlocked(upgrades)) return;

  const anchorActive = isNodeAnchorActive(anchoredNodes, 'overclock');
  if (tryActivateOverclock(overclockRef.current, getOverclockDurationMs(anchorActive))) {
    syncOverclockDisplay(overclockRef.current);
  }
}
