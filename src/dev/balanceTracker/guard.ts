import type { GameState, RunOutcome } from '../../store/useGameStore';
import { appendBalanceRunRecord, isBalanceTrackerRecording } from './recorder';

export function syncBalanceTrackerGuard(
  gameState: GameState,
  runOutcome: RunOutcome | null,
): void {
  if (gameState !== 'RUN_END') return;
  if (!isBalanceTrackerRecording()) return;
  appendBalanceRunRecord(runOutcome);
}
