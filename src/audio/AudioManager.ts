import {
  isHubMusicPlaying,
  playHubSfx as playHubSfxSound,
  preloadHubMusic,
  startHubMusic,
  stopHubMusic,
} from './hubSounds';
import { playGameSfx as playGameSfxSound } from './gameSounds';
import { loadSettings } from '../store/settingsPersistence';
import type { GameSfxId, HubSfxId } from './types';

class AudioManager {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicBusGain: GainNode | null = null;
  private sfxBusGain: GainNode | null = null;
  private unlocked = false;
  private ambientWanted = false;

  private masterVolumeNorm = loadSettings().masterVolume / 100;
  private musicVolumeNorm = loadSettings().musicVolume / 100;
  private sfxVolumeNorm = loadSettings().sfxVolume / 100;

  private ensureContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
      this.masterGain = this.context.createGain();
      this.musicBusGain = this.context.createGain();
      this.sfxBusGain = this.context.createGain();

      this.musicBusGain.connect(this.masterGain);
      this.sfxBusGain.connect(this.masterGain);
      this.masterGain.connect(this.context.destination);

      this.applyBusGains();
    }
    return this.context;
  }

  private applyBusGains(): void {
    if (!this.context || !this.masterGain || !this.musicBusGain || !this.sfxBusGain) return;
    const t = this.context.currentTime;
    this.setGainValue(this.masterGain, this.masterVolumeNorm, t);
    this.setGainValue(this.musicBusGain, this.musicVolumeNorm, t);
    this.setGainValue(this.sfxBusGain, this.sfxVolumeNorm, t);
  }

  private setGainValue(node: GainNode, value: number, time: number): void {
    node.gain.cancelScheduledValues(time);
    node.gain.setValueAtTime(value, time);
  }

  private getMusicBusGain(): GainNode | null {
    this.ensureContext();
    return this.musicBusGain;
  }

  ensureUnlocked(): void {
    const context = this.ensureContext();
    if (context.state === 'suspended') {
      void context.resume();
    }
    this.unlocked = true;
    this.tryStartMusic();
  }

  unlockAndPlay(): void {
    this.ensureUnlocked();
  }

  async unlock(): Promise<void> {
    const context = this.ensureContext();
    if (context.state === 'suspended') {
      await context.resume();
    }
    this.unlocked = true;
    this.tryStartMusic();
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }

  applyVolumes(master: number, music: number, sfx: number): void {
    this.masterVolumeNorm = Math.min(1, Math.max(0, master));
    this.musicVolumeNorm = Math.min(1, Math.max(0, music));
    this.sfxVolumeNorm = Math.min(1, Math.max(0, sfx));
    this.applyBusGains();
  }

  startHubAmbient(): void {
    this.ambientWanted = true;
    preloadHubMusic();
    this.tryStartMusic();
  }

  private tryStartMusic(): void {
    if (!this.ambientWanted || !this.unlocked) return;
    if (isHubMusicPlaying()) return;

    const context = this.ensureContext();
    const musicBus = this.getMusicBusGain();
    if (!musicBus) return;
    startHubMusic(context, musicBus);
  }

  stopHubAmbient(): void {
    this.ambientWanted = false;
    if (!this.context || !isHubMusicPlaying()) return;
    stopHubMusic(this.context);
  }

  playHubSfx(id: HubSfxId): void {
    this.ensureUnlocked();
    const context = this.context;
    const sfxBus = this.sfxBusGain;
    if (!context || !sfxBus || context.state === 'suspended') return;
    playHubSfxSound(context, sfxBus, id);
  }

  playGameSfx(id: GameSfxId): void {
    this.ensureUnlocked();
    const context = this.context;
    const sfxBus = this.sfxBusGain;
    if (!context || !sfxBus || context.state === 'suspended') return;
    playGameSfxSound(context, sfxBus, id);
  }
}

export const audioManager = new AudioManager();
