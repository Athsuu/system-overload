/** Hub ambient — the_mountain-ambient (user-provided) */
const HUB_MUSIC_URL = '/hub-ambient.mp3';

const HUB_MUSIC_GAIN = 0.2;
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
  hubMusicFilter.frequency.value = 2800;
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
