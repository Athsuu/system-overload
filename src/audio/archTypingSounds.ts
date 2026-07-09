import { ARCH_TYPING_FREQUENCY } from './frequencyMap';
import { playBandpassNoiseBurst, playSineClick } from './synthPrimitives';

/** Single ARCH dialogue keystroke — dry terminal tick with micro pitch variance. */
export function playArchTypingTick(context: AudioContext, destination: AudioNode): void {
  const profile = ARCH_TYPING_FREQUENCY;
  const jitter = profile.jitter
    ? profile.jitter.min + Math.random() * (profile.jitter.max - profile.jitter.min)
    : 1;
  const [body, grain] = profile.layers;

  playSineClick(context, destination, {
    startHz: body.startHz * jitter,
    endHz: body.endHz * jitter,
    attack: 0.001,
    decay: 0.02,
    peakGain: 0.011,
    filterHz: body.filterHz,
    oscillatorType: 'square',
  });

  playBandpassNoiseBurst(context, destination, {
    duration: 0.009,
    peakGain: 0.0055,
    centerHz: grain.startHz * jitter,
    q: 1.05,
    highpassHz: 820,
  });
}
