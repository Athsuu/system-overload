import { useGameStore } from '../../store/useGameStore';

/** Compteur runtime — source de vérité en hot path. */
export const runKillsRef = { current: 0 };

export function resetRunKills(): void {
  runKillsRef.current = 0;
  useGameStore.getState().setRunKills(0);
}

/** Incrémente kills + sync store (basse fréquence : 1× par kill). */
export function registerEnemyKill(): number {
  runKillsRef.current += 1;
  useGameStore.getState().setRunKills(runKillsRef.current);
  return runKillsRef.current;
}
