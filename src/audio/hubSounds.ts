import type { HubSfxId } from './types';

/** Hub ambient — the_mountain-ambient (user-provided) */
const HUB_MUSIC_URL = '/hub-ambient.mp3';

const HUB_MUSIC_GAIN = 0.33;
const HUB_MUSIC_FADE_OUT_S = 0.6;

let hubAudio: HTMLAudioElement | null = null;
let hubMusicGain: GainNode | null = null;
let hubMusicFilter: BiquadFilterNode | null = null;
let hubMediaSource: MediaElementAudioSourceNode | null = null;
let hubMusicConnected = false;
let hubMusicPlaying = false;

function now(context: AudioContext): number {
  return context.currentTime;
}

function connectThroughLowpass(
  context: AudioContext,
  source: AudioNode,
  destination: AudioNode,
  frequency = 800,
): void {
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = frequency;
  filter.Q.value = 0.7;
  source.connect(filter);
  filter.connect(destination);
}

function playThump(
  context: AudioContext,
  destination: AudioNode,
  frequency: number,
  duration: number,
  peakGain: number,
  filterHz = 600,
): void {
  const t = now(context);
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(frequency * 0.65, 40), t + duration);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peakGain, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain);
  connectThroughLowpass(context, gain, destination, filterHz);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

function ensureHubAudioElement(): HTMLAudioElement {
  if (!hubAudio) {
    hubAudio = new Audio(HUB_MUSIC_URL);
    hubAudio.loop = true;
    hubAudio.preload = 'auto';
  }
  return hubAudio;
}

function connectHubMusic(context: AudioContext, destination: AudioNode): void {
  if (hubMusicConnected) return;

  const audio = ensureHubAudioElement();
  audio.volume = 1;
  hubMediaSource = context.createMediaElementSource(audio);
  hubMusicGain = context.createGain();
  hubMusicGain.gain.value = HUB_MUSIC_GAIN;

  hubMusicFilter = context.createBiquadFilter();
  hubMusicFilter.type = 'lowpass';
  hubMusicFilter.frequency.value = 3200;
  hubMusicFilter.Q.value = 0.55;

  hubMediaSource.connect(hubMusicGain);
  hubMusicGain.connect(hubMusicFilter);
  hubMusicFilter.connect(destination);
  hubMusicConnected = true;
}

export function preloadHubMusic(): void {
  const audio = ensureHubAudioElement();
  audio.load();
}

export function startHubMusic(context: AudioContext, destination: AudioNode): boolean {
  connectHubMusic(context, destination);
  const audio = ensureHubAudioElement();
  const gain = hubMusicGain;
  if (!gain) return false;

  if (hubMusicPlaying && !audio.paused) {
    return true;
  }

  const t = now(context);
  if (gain.gain.value < HUB_MUSIC_GAIN * 0.9) {
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(HUB_MUSIC_GAIN, t);
  }

  if (audio.paused) {
    const playResult = audio.play();
    if (playResult) {
      void playResult
        .then(() => {
          hubMusicPlaying = true;
        })
        .catch((error) => {
          console.warn('[audio] Hub music play blocked', error);
        });
    }
  } else {
    hubMusicPlaying = true;
  }

  return true;
}

export function stopHubMusic(context: AudioContext): void {
  const audio = hubAudio;
  const gain = hubMusicGain;
  if (!audio || !gain) return;

  const t = now(context);
  gain.gain.cancelScheduledValues(t);
  gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + HUB_MUSIC_FADE_OUT_S);

  window.setTimeout(() => {
    audio.pause();
    audio.currentTime = 0;
    hubMusicPlaying = false;
  }, HUB_MUSIC_FADE_OUT_S * 1000 + 50);
}

export function isHubMusicPlaying(): boolean {
  return hubMusicPlaying;
}

/** @deprecated Use startHubMusic / stopHubMusic via AudioManager */
export function createHubAmbient(context: AudioContext, destination: AudioNode): () => void {
  startHubMusic(context, destination);
  return () => stopHubMusic(context);
}

export function playHubSfx(context: AudioContext, destination: AudioNode, id: HubSfxId): void {
  switch (id) {
    case 'nodeSelect':
      playThump(context, destination, 120, 0.18, 0.14, 700);
      break;
    case 'nodeLocked':
      playThump(context, destination, 90, 0.14, 0.07, 450);
      break;
    case 'purchase': {
      const t = now(context);
      playThump(context, destination, 90, 0.22, 0.16, 550);
      const harmonic = context.createOscillator();
      const hGain = context.createGain();
      harmonic.type = 'sine';
      harmonic.frequency.setValueAtTime(180, t + 0.04);
      harmonic.frequency.exponentialRampToValueAtTime(120, t + 0.2);
      hGain.gain.setValueAtTime(0.0001, t + 0.04);
      hGain.gain.exponentialRampToValueAtTime(0.04, t + 0.06);
      hGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      harmonic.connect(hGain);
      connectThroughLowpass(context, hGain, destination, 900);
      harmonic.start(t + 0.04);
      harmonic.stop(t + 0.3);
      break;
    }
    case 'startRun': {
      playThump(context, destination, 80, 0.16, 0.12, 500);
      const t = now(context);
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, t + 0.12);
      osc.frequency.exponentialRampToValueAtTime(130, t + 0.2);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.32);
      gain.gain.setValueAtTime(0.0001, t + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.14, t + 0.132);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      osc.connect(gain);
      connectThroughLowpass(context, gain, destination, 650);
      osc.start(t + 0.12);
      osc.stop(t + 0.38);
      break;
    }
    case 'settingsOpen':
      playThump(context, destination, 150, 0.1, 0.09, 800);
      break;
    case 'settingsClose':
      playThump(context, destination, 130, 0.08, 0.07, 700);
      break;
  }
}
