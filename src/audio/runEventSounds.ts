import { RUN_EVENT_SFX_FREQUENCY } from './frequencyMap';
import { audioNow, connectLowpass, playNoiseBurst, playSineClick } from './synthPrimitives';
import type { RunEventSfxId } from './types';

function playWarmLayer(
  context: AudioContext,
  destination: AudioNode,
  layer: { startHz: number; endHz: number; filterHz: number },
  {
    attack,
    decay,
    peakGain,
    startOffset = 0,
    oscillatorType = 'sine',
  }: {
    attack: number;
    decay: number;
    peakGain: number;
    startOffset?: number;
    oscillatorType?: OscillatorType;
  },
): void {
  playSineClick(context, destination, {
    startHz: layer.startHz,
    endHz: layer.endHz,
    attack,
    decay,
    peakGain,
    filterHz: layer.filterHz,
    startOffset,
    oscillatorType,
  });
}

function runJitter(eventId: RunEventSfxId): number {
  const profile = RUN_EVENT_SFX_FREQUENCY[eventId];
  if (!profile.jitter) return 1;
  return profile.jitter.min + Math.random() * (profile.jitter.max - profile.jitter.min);
}

function playWaveClear(context: AudioContext, destination: AudioNode, startOffset = 0): void {
  const layers = RUN_EVENT_SFX_FREQUENCY.waveClear.layers;
  const timings = [
    { attack: 0.02, decay: 0.48, peakGain: 0.058, offset: 0 },
    { attack: 0.025, decay: 0.42, peakGain: 0.042, offset: 0.06 },
    { attack: 0.03, decay: 0.35, peakGain: 0.028, offset: 0.11 },
  ];
  layers.forEach((layer, index) => {
    const timing = timings[index];
    playWarmLayer(context, destination, layer, {
      attack: timing.attack,
      decay: timing.decay,
      peakGain: timing.peakGain,
      startOffset: startOffset + timing.offset,
    });
  });
}

function playWaveResume(context: AudioContext, destination: AudioNode, startOffset = 0): void {
  const jitter = runJitter('waveResume');
  const layers = RUN_EVENT_SFX_FREQUENCY.waveResume.layers;
  playWarmLayer(
    context,
    destination,
    { ...layers[0], startHz: layers[0].startHz * jitter, endHz: layers[0].endHz * jitter },
    { attack: 0.012, decay: 0.14, peakGain: 0.04, startOffset },
  );
  playWarmLayer(
    context,
    destination,
    { ...layers[1], startHz: layers[1].startHz * jitter, endHz: layers[1].endHz * jitter },
    { attack: 0.01, decay: 0.1, peakGain: 0.024, startOffset: startOffset + 0.03 },
  );
}

function playBreachWarning(context: AudioContext, destination: AudioNode, startOffset = 0): void {
  const layers = RUN_EVENT_SFX_FREQUENCY.breachWarning.layers;
  const offsets = [0, 0.14, 0.28, 0.2];
  const decays = [0.2, 0.18, 0.16, 0.14];
  const gains = [0.052, 0.04, 0.028, 0.022];
  layers.forEach((layer, index) => {
    playWarmLayer(context, destination, layer, {
      attack: index === 0 ? 0.015 : 0.012 - index * 0.002,
      decay: decays[index],
      peakGain: gains[index],
      startOffset: startOffset + offsets[index],
    });
  });
}

function playMeltdown(context: AudioContext, destination: AudioNode, startOffset = 0): void {
  const layers = RUN_EVENT_SFX_FREQUENCY.meltdown.layers;
  playNoiseBurst(context, destination, 0.12, 0.022, 3000, startOffset);
  playWarmLayer(context, destination, layers[0], {
    attack: 0.03,
    decay: 0.82,
    peakGain: 0.075,
    startOffset: startOffset + 0.04,
  });
  playWarmLayer(context, destination, layers[1], {
    attack: 0.04,
    decay: 0.9,
    peakGain: 0.045,
    startOffset: startOffset + 0.12,
    oscillatorType: 'triangle',
  });

  const tail = layers[2];
  const t = audioNow(context) + startOffset + 0.35;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(tail.startHz, t);
  osc.frequency.exponentialRampToValueAtTime(tail.endHz, t + 0.55);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.035, t + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.62);
  osc.connect(gain);
  connectLowpass(context, gain, destination, tail.filterHz);
  osc.start(t);
  osc.stop(t + 0.68);
}

function playVictory(context: AudioContext, destination: AudioNode, startOffset = 0): void {
  const layers = RUN_EVENT_SFX_FREQUENCY.victory.layers;
  const noteTimings = [
    { decay: 0.55, gain: 0.05, offset: 0 },
    { decay: 0.5, gain: 0.046, offset: 0.1 },
    { decay: 0.48, gain: 0.042, offset: 0.2 },
    { decay: 0.72, gain: 0.055, offset: 0.32 },
    { decay: 0.85, gain: 0.03, offset: 0.42 },
  ];
  layers.forEach((layer, index) => {
    const timing = noteTimings[index];
    playWarmLayer(context, destination, layer, {
      attack: index < 4 ? 0.025 : 0.04,
      decay: timing.decay,
      peakGain: timing.gain,
      startOffset: startOffset + timing.offset,
    });
  });
}

function playBossIncoming(context: AudioContext, destination: AudioNode, startOffset = 0): void {
  const [click, bloom] = RUN_EVENT_SFX_FREQUENCY.bossIncoming.layers;
  playWarmLayer(context, destination, click, {
    attack: 0.002,
    decay: 0.055,
    peakGain: 0.026,
    startOffset,
  });
  playWarmLayer(context, destination, bloom, {
    attack: 0.018,
    decay: 0.32,
    peakGain: 0.042,
    startOffset: startOffset + 0.045,
  });
}

/** Warm Terminal run events. */
export function playRunEventSfx(
  context: AudioContext,
  destination: AudioNode,
  eventId: RunEventSfxId,
  startOffset = 0,
): void {
  switch (eventId) {
    case 'waveClear':
      playWaveClear(context, destination, startOffset);
      break;
    case 'waveResume':
      playWaveResume(context, destination, startOffset);
      break;
    case 'breachWarning':
      playBreachWarning(context, destination, startOffset);
      break;
    case 'meltdown':
      playMeltdown(context, destination, startOffset);
      break;
    case 'victory':
      playVictory(context, destination, startOffset);
      break;
    case 'bossIncoming':
      playBossIncoming(context, destination, startOffset);
      break;
  }
}
