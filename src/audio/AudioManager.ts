import { MUSIC_BUS_TRIM, RUN_EVENT_MUSIC_DUCK, SFX_BUS_FILTERS, SFX_BUS_TRIM } from './audioMix';
import {
  isHubMusicPlaying,
  preloadHubMusic,
  startHubMusic,
  stopHubMusic,
} from './hubMusic';
import { playGameSfx as playGameSfxSound } from './combatSounds';
import { playHubSfx as playHubSfxSound } from './hubUiSounds';
import { loadSettings } from '../store/settingsPersistence';
import { playRunEventSfx as playRunEventSfxSound } from './runEventSounds';
import type { GameSfxId, HubSfxId, RunEventSfxId } from './types';

interface SfxBusRoute {
  context: AudioContext;
  bus: GainNode;
}

class AudioManager {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicBusGain: GainNode | null = null;
  private uiBusGain: GainNode | null = null;
  private combatBusGain: GainNode | null = null;
  private runEventBusGain: GainNode | null = null;
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
      this.uiBusGain = this.context.createGain();
      this.combatBusGain = this.context.createGain();
      this.runEventBusGain = this.context.createGain();

      this.connectFilteredBus(this.uiBusGain, SFX_BUS_FILTERS.ui);
      this.connectFilteredBus(this.combatBusGain, SFX_BUS_FILTERS.combat);
      this.connectFilteredBus(this.runEventBusGain, SFX_BUS_FILTERS.runEvent);
      this.musicBusGain.connect(this.masterGain);
      this.masterGain.connect(this.context.destination);

      this.applyBusGains();
    }
    return this.context;
  }

  private connectFilteredBus(
    busGain: GainNode,
    filterDef: { type: 'highpass'; frequencyHz: number; q: number },
  ): void {
    const context = this.context;
    const master = this.masterGain;
    if (!context || !master) return;

    const filter = context.createBiquadFilter();
    filter.type = filterDef.type;
    filter.frequency.value = filterDef.frequencyHz;
    filter.Q.value = filterDef.q;
    busGain.connect(filter);
    filter.connect(master);
  }

  private applyBusGains(): void {
    if (
      !this.context ||
      !this.masterGain ||
      !this.musicBusGain ||
      !this.uiBusGain ||
      !this.combatBusGain ||
      !this.runEventBusGain
    ) {
      return;
    }
    const t = this.context.currentTime;
    this.setGainValue(this.masterGain, this.masterVolumeNorm, t);
    this.setGainValue(this.musicBusGain, this.musicVolumeNorm * MUSIC_BUS_TRIM, t);
    this.setGainValue(this.uiBusGain, this.sfxVolumeNorm * SFX_BUS_TRIM.ui, t);
    this.setGainValue(this.combatBusGain, this.sfxVolumeNorm * SFX_BUS_TRIM.combat, t);
    this.setGainValue(this.runEventBusGain, this.sfxVolumeNorm * SFX_BUS_TRIM.runEvent, t);
  }

  private setGainValue(node: GainNode, value: number, time: number): void {
    node.gain.cancelScheduledValues(time);
    node.gain.setValueAtTime(value, time);
  }

  private getSfxRoute(bus: GainNode | null): SfxBusRoute | null {
    this.ensureUnlocked();
    const context = this.context;
    if (!context || !bus || context.state === 'suspended') return null;
    return { context, bus };
  }

  private duckMusicForRunEvent(eventId: RunEventSfxId): void {
    const bus = this.musicBusGain;
    const context = this.context;
    if (!bus || !context) return;

    const profile = RUN_EVENT_MUSIC_DUCK[eventId];
    const attackSec = profile.attackMs / 1000;
    const holdSec = profile.holdMs / 1000;
    const releaseSec = profile.releaseMs / 1000;
    const t = context.currentTime;
    const ducked = this.musicVolumeNorm * MUSIC_BUS_TRIM * profile.depthMult;

    bus.gain.cancelScheduledValues(t);
    bus.gain.setValueAtTime(bus.gain.value, t);
    bus.gain.linearRampToValueAtTime(ducked, t + attackSec);
    bus.gain.setValueAtTime(ducked, t + attackSec + holdSec);
    bus.gain.linearRampToValueAtTime(this.musicVolumeNorm * MUSIC_BUS_TRIM, t + attackSec + holdSec + releaseSec);
  }

  ensureUnlocked(): void {
    const context = this.ensureContext();
    if (context.state === 'suspended') {
      void context.resume();
    }
    this.unlocked = true;
    this.tryStartMusic();
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
    const musicBus = this.musicBusGain;
    if (!musicBus) return;
    startHubMusic(context, musicBus);
  }

  stopHubAmbient(): void {
    this.ambientWanted = false;
    if (!this.context || !isHubMusicPlaying()) return;
    stopHubMusic(this.context);
  }

  playHubSfx(id: HubSfxId): void {
    const route = this.getSfxRoute(this.uiBusGain);
    if (!route) return;
    playHubSfxSound(route.context, route.bus, id);
  }

  playGameSfx(id: GameSfxId, startOffsetSec = 0): void {
    const route = this.getSfxRoute(this.combatBusGain);
    if (!route) return;
    playGameSfxSound(route.context, route.bus, id, startOffsetSec);
  }

  playRunEventSfx(id: RunEventSfxId, startOffsetSec = 0): void {
    const route = this.getSfxRoute(this.runEventBusGain);
    if (!route) return;
    this.duckMusicForRunEvent(id);
    playRunEventSfxSound(route.context, route.bus, id, startOffsetSec);
  }
}

export const audioManager = new AudioManager();
