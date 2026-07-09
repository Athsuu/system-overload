import { COMBAT_SFX_FREQUENCY } from './frequencyMap';
import { playBandpassNoiseBurst, playSineClick } from './synthPrimitives';
import type { GameSfxId } from './types';

function combatPitchJitter(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function resolveCombatJitter(sfxId: keyof typeof COMBAT_SFX_FREQUENCY): number {
  const profile = COMBAT_SFX_FREQUENCY[sfxId];
  if (!profile.jitter) return 1;
  return combatPitchJitter(profile.jitter.min, profile.jitter.max);
}

/** Dry descent — kill foundation only. */
function playPurgeHitBase(
  context: AudioContext,
  destination: AudioNode,
  startOffset = 0,
  jitter = 1,
): void {
  const [descent] = COMBAT_SFX_FREQUENCY.purgeHit.layers;

  playSineClick(context, destination, {
    startHz: descent.startHz * jitter,
    endHz: descent.endHz * jitter,
    attack: 0.005,
    decay: 0.033,
    peakGain: 0.1109,
    filterHz: descent.filterHz,
    startOffset,
    oscillatorType: 'sine',
  });
}

/** Arcade impact — raw tick + gritty swoop (PurgeHit only). */
function playPurgeHitImpact(
  context: AudioContext,
  destination: AudioNode,
  startOffset = 0,
  jitter = 1,
): void {
  const [descent] = COMBAT_SFX_FREQUENCY.purgeHit.layers;
  const strikeHz = descent.startHz * 1.42 * jitter;
  const bodyStartHz = descent.startHz * jitter;
  const bodyEndHz = descent.endHz * 0.82 * jitter;

  playSineClick(context, destination, {
    startHz: strikeHz,
    endHz: strikeHz * 0.76,
    attack: 0.001,
    decay: 0.011,
    peakGain: 0.078,
    filterHz: 6200,
    startOffset,
    oscillatorType: 'square',
  });

  playSineClick(context, destination, {
    startHz: strikeHz * 2,
    endHz: strikeHz * 1.62,
    attack: 0.001,
    decay: 0.008,
    peakGain: 0.006,
    filterHz: 7000,
    startOffset: startOffset + 0.001,
    oscillatorType: 'square',
  });

  playSineClick(context, destination, {
    startHz: bodyStartHz,
    endHz: bodyEndHz,
    attack: 0.001,
    decay: 0.032,
    peakGain: 0.048,
    filterHz: 3600,
    startOffset: startOffset + 0.002,
    oscillatorType: 'triangle',
  });

  playSineClick(context, destination, {
    startHz: bodyStartHz,
    endHz: bodyEndHz,
    attack: 0.001,
    decay: 0.022,
    peakGain: 0.01,
    filterHz: 4600,
    startOffset: startOffset + 0.002,
    oscillatorType: 'square',
  });

  playBandpassNoiseBurst(context, destination, {
    duration: 0.01,
    peakGain: 0.009,
    centerHz: 2460 * jitter,
    q: 1.05,
    highpassHz: 960,
    startOffset: startOffset + 0.002,
  });
}

/** Warm Descent kill bloom — same family, slightly longer second layer. */
function playPurgeKillTail(
  context: AudioContext,
  destination: AudioNode,
  startOffset = 0,
  jitter = 1,
): void {
  const bloom = COMBAT_SFX_FREQUENCY.purgeKill.layers[1];

  playSineClick(context, destination, {
    startHz: bloom.startHz * jitter,
    endHz: bloom.endHz * jitter,
    attack: 0.01,
    decay: 0.09,
    peakGain: 0.0875,
    filterHz: bloom.filterHz,
    startOffset: startOffset + 0.012,
    oscillatorType: 'sine',
  });
}

/** Warm Terminal purge — descent hit + kill bloom. */
export function playGameSfx(
  context: AudioContext,
  destination: AudioNode,
  sfxId: GameSfxId,
  startOffset = 0,
): void {
  const jitter = resolveCombatJitter(sfxId === 'purgeHit' ? 'purgeHit' : 'purgeKill');

  if (sfxId === 'purgeHit') {
    playPurgeHitImpact(context, destination, startOffset, jitter);
    return;
  }

  playPurgeHitBase(context, destination, startOffset, jitter);
  playPurgeKillTail(context, destination, startOffset, jitter);
}
