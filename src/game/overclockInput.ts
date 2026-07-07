import type { MutableRefObject } from 'react';
import { isOverclockUnlocked } from '../store/upgradeCatalog';
import { useGameStore } from '../store/useGameStore';
import { getOverclockDurationMs, tryActivateOverclock, type OverclockState } from './activeSkill';

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

  const { gameState, upgrades } = useGameStore.getState();
  if (gameState !== 'PLAYING') return;
  if (!isOverclockUnlocked(upgrades)) return;

  tryActivateOverclock(overclockRef.current, getOverclockDurationMs());
}
