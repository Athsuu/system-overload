import { BOSS_KILL_THRESHOLD } from '../game/horde';
import { useGameStore, type GameState } from '../store/useGameStore';
import {
  devRequestForceBoss,
  devRequestKillAll,
  devRequestKillJump,
} from './devFlags';

export function devKillAllEnemies(): void {
  devRequestKillAll();
}

export function devSetBreachProgress(percent: number): void {
  const breachProgress = Math.min(110, Math.max(0, percent));
  useGameStore.setState({ breachProgress });
}

export function devForceEndBreach(): void {
  const state = useGameStore.getState();
  if (state.gameState !== 'PLAYING') return;
  state.endRun('defeat_breach');
}

export function devForceVictoryBoss(): void {
  const state = useGameStore.getState();
  if (state.gameState !== 'PLAYING') return;
  state.endRun('victory_boss');
}

export function devJumpToKills(kills: number): void {
  const target = Math.max(0, Math.min(BOSS_KILL_THRESHOLD, Math.floor(kills)));
  const state = useGameStore.getState();
  if (state.gameState !== 'PLAYING' && state.gameState !== 'PAUSED') {
    state.startRun();
  }
  if (useGameStore.getState().gameState === 'PAUSED') {
    useGameStore.setState({ gameState: 'PLAYING' });
  }
  devRequestKillJump(target);
}

export function devForceBossSpawn(): void {
  const state = useGameStore.getState();
  if (state.gameState !== 'PLAYING' && state.gameState !== 'PAUSED') {
    state.startRun();
  }
  if (useGameStore.getState().gameState === 'PAUSED') {
    useGameStore.setState({ gameState: 'PLAYING' });
  }
  devRequestForceBoss();
}

export function devGetBossKillThreshold(): number {
  return BOSS_KILL_THRESHOLD;
}

export function devSetGameState(gameState: GameState): void {
  useGameStore.setState({ gameState });
}
