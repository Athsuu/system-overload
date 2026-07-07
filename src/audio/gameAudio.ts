import { audioManager } from './AudioManager';
import type { GameSfxId } from './types';

export function unlockGameAudio(): Promise<void> {
  return audioManager.unlock();
}

export function playGameSfx(id: GameSfxId): void {
  audioManager.playGameSfx(id);
}

export function isGameAudioUnlocked(): boolean {
  return audioManager.isUnlocked();
}

export function ensureGameAudioUnlocked(): void {
  if (!isGameAudioUnlocked()) {
    void unlockGameAudio();
  }
}
