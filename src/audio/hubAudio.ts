import { audioManager } from './AudioManager';
import type { HubSfxId } from './types';

export function unlockHubAudio(): Promise<void> {
  return audioManager.unlock();
}

export function unlockHubAudioNow(): void {
  audioManager.ensureUnlocked();
}

export function ensureAudioUnlocked(): void {
  audioManager.ensureUnlocked();
}

export function startHubAmbient(): void {
  audioManager.startHubAmbient();
}

export function stopHubAmbient(): void {
  audioManager.stopHubAmbient();
}

export function playHubSfx(id: HubSfxId): void {
  audioManager.playHubSfx(id);
}

export function applyAudioVolumes(masterPercent: number, musicPercent: number, sfxPercent: number): void {
  audioManager.applyVolumes(masterPercent / 100, musicPercent / 100, sfxPercent / 100);
}

export function isHubAudioUnlocked(): boolean {
  return audioManager.isUnlocked();
}
