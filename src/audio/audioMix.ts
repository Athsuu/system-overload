import type { RunEventSfxId } from './types';

/** Bed level for hub ambient — keeps music under UI/SFX at equal slider positions. */
export const MUSIC_BUS_TRIM = 0.58;

/** Per-category trim on the shared SFX volume slider (combat is frequent). */
export const SFX_BUS_TRIM = {
  ui: 1.18,
  combat: 0.88,
  runEvent: 1,
} as const;

export type SfxCategory = keyof typeof SFX_BUS_TRIM;

/** Bus-level EQ — carve spectral space between categories. */
export const SFX_BUS_FILTERS = {
  ui: { type: 'highpass' as const, frequencyHz: 420, q: 0.7 },
  combat: { type: 'highpass' as const, frequencyHz: 380, q: 0.65 },
  runEvent: { type: 'highpass' as const, frequencyHz: 160, q: 0.55 },
} as const;

export interface MusicDuckProfile {
  depthMult: number;
  attackMs: number;
  holdMs: number;
  releaseMs: number;
}

/** Temporary music attenuation so run feedback cuts through the ambient bed. */
export const RUN_EVENT_MUSIC_DUCK: Record<RunEventSfxId, MusicDuckProfile> = {
  waveClear: { depthMult: 0.82, attackMs: 60, holdMs: 200, releaseMs: 300 },
  waveResume: { depthMult: 0.88, attackMs: 50, holdMs: 140, releaseMs: 240 },
  bossIncoming: { depthMult: 0.62, attackMs: 70, holdMs: 380, releaseMs: 420 },
  breachWarning: { depthMult: 0.55, attackMs: 60, holdMs: 420, releaseMs: 480 },
  meltdown: { depthMult: 0.42, attackMs: 90, holdMs: 950, releaseMs: 650 },
  victory: { depthMult: 0.45, attackMs: 90, holdMs: 850, releaseMs: 580 },
};
