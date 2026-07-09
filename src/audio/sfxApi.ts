import { audioManager } from './AudioManager';
import type { GameSfxId, HubSfxId, RunEventSfxId } from './types';

export function ensureAudioUnlocked(): void {
  audioManager.ensureUnlocked();
}

export function unlockAudio(): Promise<void> {
  return audioManager.unlock();
}

export function isAudioUnlocked(): boolean {
  return audioManager.isUnlocked();
}

export function applyAudioVolumes(masterPercent: number, musicPercent: number, sfxPercent: number): void {
  audioManager.applyVolumes(masterPercent / 100, musicPercent / 100, sfxPercent / 100);
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

export function playGameSfx(id: GameSfxId, startOffsetSec = 0): void {
  audioManager.playGameSfx(id, startOffsetSec);
}

export function playRunEventSfx(id: RunEventSfxId, startOffsetSec = 0): void {
  audioManager.playRunEventSfx(id, startOffsetSec);
}

/** Unlock audio context (if needed) then play a hub / UI sound. */
export function triggerSfx(id: HubSfxId): void {
  ensureAudioUnlocked();
  playHubSfx(id);
}

/** Unlock audio context (if needed) then play arena combat SFX. */
export function triggerGameSfx(id: GameSfxId, startOffsetSec = 0): void {
  ensureAudioUnlocked();
  playGameSfx(id, startOffsetSec);
}

/** Unlock audio context (if needed) then play a run event SFX. */
export function triggerRunEventSfx(id: RunEventSfxId, startOffsetSec = 0): void {
  ensureAudioUnlocked();
  playRunEventSfx(id, startOffsetSec);
}

export {
  FREQUENCY_BANDS,
  getFrequencyBand,
  getHubSfxCategory,
  getHubSfxRoute,
  getSfxFrequencyProfile,
  HUB_SFX_ROUTES,
  SFX_FREQUENCY_MAP,
  type FrequencyBandId,
  type FrequencyLayerSpec,
  type HubSfxCategory,
  type SfxFrequencyProfile,
} from './frequencyMap';
