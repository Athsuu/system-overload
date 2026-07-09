import { UI_BACK_FREQUENCY, UI_CONFIRM_FREQUENCY } from './frequencyMap';
import { playSineClick } from './synthPrimitives';

const CONFIRM_GAIN = [0.048, 0.036] as const;
const BACK_GAIN = [0.04, 0.026] as const;
const CONFIRM_OFFSETS = [0, 0.055] as const;
const BACK_OFFSETS = [0, 0.038] as const;

/** Affirmative action — short rising warm pulse (oui, confirmer, acheter). */
export function playUiConfirm(context: AudioContext, destination: AudioNode): void {
  UI_CONFIRM_FREQUENCY.layers.forEach((layer, index) => {
    playSineClick(context, destination, {
      startHz: layer.startHz,
      endHz: layer.endHz,
      attack: index === 0 ? 0.006 : 0.005,
      decay: index === 0 ? 0.12 : 0.095,
      peakGain: CONFIRM_GAIN[index],
      filterHz: layer.filterHz,
      startOffset: CONFIRM_OFFSETS[index],
    });
  });
}

/** Cancel / back — short descending pulse, distinct from locked/error. */
export function playUiBack(context: AudioContext, destination: AudioNode): void {
  UI_BACK_FREQUENCY.layers.forEach((layer, index) => {
    playSineClick(context, destination, {
      startHz: layer.startHz,
      endHz: layer.endHz,
      attack: index === 0 ? 0.005 : 0.004,
      decay: index === 0 ? 0.11 : 0.085,
      peakGain: BACK_GAIN[index],
      filterHz: layer.filterHz,
      startOffset: BACK_OFFSETS[index],
    });
  });
}
