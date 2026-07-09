import { HEX_PULSE_FREQUENCY, type HexPulseVariant } from './frequencyMap';
import { playSineClick } from './synthPrimitives';

export type { HexPulseVariant } from './frequencyMap';

const VARIANT_GAIN: Record<HexPulseVariant, { lowGain: number; highGain: number }> = {
  normal: { lowGain: 0.09, highGain: 0.055 },
  soft: { lowGain: 0.075, highGain: 0.045 },
  strong: { lowGain: 0.1, highGain: 0.065 },
  denied: { lowGain: 0.055, highGain: 0.035 },
};

export function playHexPulse(
  context: AudioContext,
  destination: AudioNode,
  variant: HexPulseVariant = 'normal',
): void {
  const freq = HEX_PULSE_FREQUENCY[variant];
  const gain = VARIANT_GAIN[variant];

  playSineClick(context, destination, {
    startHz: freq.low.startHz,
    endHz: freq.low.endHz,
    attack: 0.005,
    decay: 0.07,
    peakGain: gain.lowGain,
    filterHz: freq.low.filterHz,
  });
  playSineClick(context, destination, {
    startHz: freq.high.startHz,
    endHz: freq.high.endHz,
    attack: 0.004,
    decay: 0.05,
    peakGain: gain.highGain,
    filterHz: freq.high.filterHz,
    startOffset: 0.028,
  });
}
