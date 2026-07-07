import type { GameSfxId } from './types';

function now(context: AudioContext): number {
  return context.currentTime;
}

function connectThroughLowpass(
  context: AudioContext,
  source: AudioNode,
  destination: AudioNode,
  frequency = 700,
): void {
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = frequency;
  filter.Q.value = 0.6;
  source.connect(filter);
  filter.connect(destination);
}

function playSoftTone(
  context: AudioContext,
  destination: AudioNode,
  frequency: number,
  startOffset: number,
  attack: number,
  decay: number,
  peakGain: number,
  filterHz: number,
  oscillatorType: OscillatorType = 'sine',
): void {
  const t = now(context) + startOffset;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = oscillatorType;
  osc.frequency.setValueAtTime(frequency, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(frequency * 0.72, 48), t + decay);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peakGain, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  osc.connect(gain);
  connectThroughLowpass(context, gain, destination, filterHz);
  osc.start(t);
  osc.stop(t + decay + 0.04);
}

function playDigitalTick(context: AudioContext, destination: AudioNode): void {
  const t = now(context);
  const freq = 900 + Math.random() * 140;
  const osc = context.createOscillator();
  const gain = context.createGain();
  const hp = context.createBiquadFilter();

  osc.type = 'square';
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.035);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.052, t + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.042);
  hp.type = 'highpass';
  hp.frequency.value = 380;
  hp.Q.value = 0.7;

  osc.connect(gain);
  gain.connect(hp);
  hp.connect(destination);
  osc.start(t);
  osc.stop(t + 0.05);
}

/** Synth lofi — swap for AudioBuffer playback later without changing call sites. */
export function playGameSfx(context: AudioContext, destination: AudioNode, id: GameSfxId): void {
  switch (id) {
    case 'purgeHit': {
      playDigitalTick(context, destination);
      break;
    }
    case 'purgeKill': {
      const pitchJitter = 0.97 + Math.random() * 0.05;
      playSoftTone(
        context,
        destination,
        76 * pitchJitter,
        0,
        0.006,
        0.28,
        0.12,
        420,
        'sine',
      );
      playSoftTone(
        context,
        destination,
        152 * pitchJitter,
        0.055,
        0.01,
        0.24,
        0.065,
        560,
        'triangle',
      );
      playSoftTone(
        context,
        destination,
        228 * pitchJitter,
        0.09,
        0.014,
        0.18,
        0.03,
        720,
        'sine',
      );
      break;
    }
  }
}
