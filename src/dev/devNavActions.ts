import { devRequestKillAll, devRequestWaveJump } from './devFlags';
import { getWaveDefinition, WAVE_DEFINITIONS } from '../game/waveConfig';
import { useGameStore, type GameState } from '../store/useGameStore';

const DEV_MAX_WAVE_INDEX = WAVE_DEFINITIONS[WAVE_DEFINITIONS.length - 1]?.wave ?? 11;

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

export function devJumpToWave(waveIndex: number): void {
  const targetWave = Math.max(1, Math.min(DEV_MAX_WAVE_INDEX, Math.floor(waveIndex)));
  if (!getWaveDefinition(targetWave)) return;

  const state = useGameStore.getState();
  if (state.gameState !== 'PLAYING' && state.gameState !== 'PAUSED') {
    state.startRun();
  }
  if (useGameStore.getState().gameState === 'PAUSED') {
    useGameStore.setState({ gameState: 'PLAYING' });
  }

  devRequestWaveJump(targetWave);
}

export function devGetMaxWaveIndex(): number {
  return DEV_MAX_WAVE_INDEX;
}

export function devSetGameState(gameState: GameState): void {
  useGameStore.setState({ gameState });
}
