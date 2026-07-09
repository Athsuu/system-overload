export function audioNow(context: AudioContext): number {
  return context.currentTime;
}

export function connectLowpass(
  context: AudioContext,
  source: AudioNode,
  destination: AudioNode,
  frequency: number,
  q = 0.55,
): void {
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = frequency;
  filter.Q.value = q;
  source.connect(filter);
  filter.connect(destination);
}

export function connectHighpass(
  context: AudioContext,
  source: AudioNode,
  destination: AudioNode,
  frequency: number,
  q = 0.7,
): void {
  const filter = context.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = frequency;
  filter.Q.value = q;
  source.connect(filter);
  filter.connect(destination);
}

export interface SineClickParams {
  startHz: number;
  endHz: number;
  attack: number;
  decay: number;
  peakGain: number;
  filterHz: number;
  startOffset?: number;
  oscillatorType?: OscillatorType;
}

export function playSineClick(
  context: AudioContext,
  destination: AudioNode,
  {
    startHz,
    endHz,
    attack,
    decay,
    peakGain,
    filterHz,
    startOffset = 0,
    oscillatorType = 'sine',
  }: SineClickParams,
): void {
  const t = audioNow(context) + startOffset;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = oscillatorType;
  osc.frequency.setValueAtTime(startHz, t);
  if (endHz !== startHz) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(endHz, 40), t + decay);
  }
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peakGain, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  osc.connect(gain);
  connectLowpass(context, gain, destination, filterHz);
  osc.start(t);
  osc.stop(t + decay + 0.04);
}

export function playNoiseBurst(
  context: AudioContext,
  destination: AudioNode,
  duration: number,
  peakGain: number,
  filterHz: number,
  startOffset = 0,
): void {
  const t = audioNow(context) + startOffset;
  const bufferSize = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = context.createBufferSource();
  source.buffer = buffer;
  const gain = context.createGain();
  gain.gain.setValueAtTime(peakGain, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  source.connect(gain);
  connectLowpass(context, gain, destination, filterHz);
  source.start(t);
  source.stop(t + duration + 0.02);
}

/** High-mid grain — lows cut, bandpass for glitch crackle texture. */
export function playBandpassNoiseBurst(
  context: AudioContext,
  destination: AudioNode,
  {
    duration,
    peakGain,
    centerHz,
    q = 1.15,
    highpassHz = 720,
    startOffset = 0,
  }: {
    duration: number;
    peakGain: number;
    centerHz: number;
    q?: number;
    highpassHz?: number;
    startOffset?: number;
  },
): void {
  const t = audioNow(context) + startOffset;
  const bufferSize = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) ** 1.4;
  }
  const source = context.createBufferSource();
  source.buffer = buffer;
  const bandpass = context.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = centerHz;
  bandpass.Q.value = q;
  const highpass = context.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = highpassHz;
  highpass.Q.value = 0.65;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peakGain, t + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  source.connect(bandpass);
  bandpass.connect(highpass);
  highpass.connect(gain);
  gain.connect(destination);
  source.start(t);
  source.stop(t + duration + 0.02);
}

/** Descending filter sweep on noise — dissolution / collapse texture. */
export function playNoiseFilterSweep(
  context: AudioContext,
  destination: AudioNode,
  {
    duration,
    peakGain,
    filterStartHz,
    filterEndHz,
    startOffset = 0,
  }: {
    duration: number;
    peakGain: number;
    filterStartHz: number;
    filterEndHz: number;
    startOffset?: number;
  },
): void {
  const t = audioNow(context) + startOffset;
  const bufferSize = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) ** 0.85;
  }
  const source = context.createBufferSource();
  source.buffer = buffer;
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0.7;
  filter.frequency.setValueAtTime(filterStartHz, t);
  filter.frequency.exponentialRampToValueAtTime(Math.max(filterEndHz, 80), t + duration);
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peakGain, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  source.start(t);
  source.stop(t + duration + 0.03);
}
