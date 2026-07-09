import type { GameSfxId, HubSfxId, RunEventSfxId, SfxBusCategory, SfxId } from './types';

/** Spectral design bands — every synthesized layer must fit one of these ranges. */
export const FREQUENCY_BANDS = {
  uiNavigation: { minHz: 460, maxHz: 1320, label: 'UI navigation' },
  uiConfirmation: { minHz: 480, maxHz: 1320, label: 'UI confirm / purchase' },
  uiBack: { minHz: 480, maxHz: 880, label: 'UI cancel / back' },
  uiWarning: { minHz: 400, maxHz: 960, label: 'UI locked / denied' },
  combatImpact: { minHz: 400, maxHz: 1500, label: 'Purge hit warm descent' },
  combatKill: { minHz: 150, maxHz: 1500, label: 'Process kill dissolve' },
  runInformational: { minHz: 380, maxHz: 1180, label: 'Wave clear / resume / victory' },
  runAlert: { minHz: 480, maxHz: 1400, label: 'Boss / breach warning' },
  runCriticalLow: { minHz: 90, maxHz: 480, label: 'Meltdown collapse' },
} as const;

export type FrequencyBandId = keyof typeof FREQUENCY_BANDS;

export type HubSfxCategory = 'navigation' | 'confirmation' | 'warning' | 'back';

export interface FrequencyLayerSpec {
  startHz: number;
  endHz: number;
  filterHz: number;
  /** Filter sweep layer — startHz/endHz are EQ bounds, not oscillator pitch. */
  filterSweep?: boolean;
  /** Bandpass / crackle texture — centerHz in startHz, not a pitched note. */
  noiseTexture?: boolean;
}

export type HexPulseVariant = 'normal' | 'soft' | 'strong' | 'denied';

export interface SfxFrequencyProfile {
  band: FrequencyBandId;
  bus: SfxBusCategory;
  layers: FrequencyLayerSpec[];
  /** Optional runtime jitter multiplier applied to Hz (combat only). */
  jitter?: { min: number; max: number };
}

export interface HubSfxRoute {
  band: FrequencyBandId;
  category: HubSfxCategory;
  source: 'hexPulse' | 'uiConfirm' | 'uiBack' | 'archTyping';
  hexPulseVariant?: HexPulseVariant;
}

/**
 * Hex Pulse — canonical hub click frequencies per variant.
 * Low-layer bend: minor third down (2^(-3/12) ≈ 0,8409). High layer uses ~0,79 — do not change.
 */
export const HEX_PULSE_FREQUENCY: Record<
  HexPulseVariant,
  { band: FrequencyBandId; low: FrequencyLayerSpec; high: FrequencyLayerSpec }
> = {
  normal: {
    band: 'uiNavigation',
    low: { startHz: 620, endHz: 520.8, filterHz: 3200 },
    high: { startHz: 1240, endHz: 979.6, filterHz: 4200 },
  },
  soft: {
    band: 'uiNavigation',
    low: { startHz: 560, endHz: 470.4, filterHz: 3200 },
    high: { startHz: 1120, endHz: 884.8, filterHz: 4200 },
  },
  strong: {
    band: 'uiConfirmation',
    low: { startHz: 660, endHz: 554.4, filterHz: 3200 },
    high: { startHz: 1320, endHz: 1042.8, filterHz: 4200 },
  },
  denied: {
    band: 'uiWarning',
    low: { startHz: 480, endHz: 403.2, filterHz: 3200 },
    high: { startHz: 960, endHz: 758.4, filterHz: 4200 },
  },
};

export const UI_CONFIRM_FREQUENCY: SfxFrequencyProfile = {
  band: 'uiConfirmation',
  bus: 'ui',
  layers: [
    { startHz: 494, endHz: 587, filterHz: 3600 },
    { startHz: 740, endHz: 880, filterHz: 4200 },
  ],
};

export const UI_BACK_FREQUENCY: SfxFrequencyProfile = {
  band: 'uiBack',
  bus: 'ui',
  layers: [
    { startHz: 680, endHz: 520, filterHz: 3400 },
    { startHz: 880, endHz: 660, filterHz: 3900 },
  ],
};

export const ARCH_TYPING_FREQUENCY: SfxFrequencyProfile = {
  band: 'uiNavigation',
  bus: 'ui',
  jitter: { min: 0.92, max: 1.08 },
  layers: [
    { startHz: 880, endHz: 720, filterHz: 3600 },
    { startHz: 1760, endHz: 1500, filterHz: 3400, noiseTexture: true },
  ],
};

export const HUB_SFX_ROUTES: Record<HubSfxId, HubSfxRoute> = {
  nodeSelect: { band: 'uiNavigation', category: 'navigation', source: 'hexPulse', hexPulseVariant: 'normal' },
  settingsOpen: { band: 'uiNavigation', category: 'navigation', source: 'hexPulse', hexPulseVariant: 'soft' },
  archTyping: { band: 'uiNavigation', category: 'navigation', source: 'archTyping' },
  nodeLocked: { band: 'uiWarning', category: 'warning', source: 'hexPulse', hexPulseVariant: 'denied' },
  purchase: { band: 'uiConfirmation', category: 'confirmation', source: 'uiConfirm' },
  startRun: { band: 'uiConfirmation', category: 'confirmation', source: 'hexPulse', hexPulseVariant: 'strong' },
  uiConfirm: { band: 'uiConfirmation', category: 'confirmation', source: 'uiConfirm' },
  settingsClose: { band: 'uiBack', category: 'back', source: 'uiBack' },
  uiBack: { band: 'uiBack', category: 'back', source: 'uiBack' },
};

export const COMBAT_SFX_FREQUENCY: Record<GameSfxId, SfxFrequencyProfile> = {
  purgeHit: {
    band: 'combatImpact',
    bus: 'combat',
    jitter: { min: 0.97, max: 1.03 },
    layers: [{ startHz: 520, endHz: 420, filterHz: 3600 }],
  },
  purgeKill: {
    band: 'combatKill',
    bus: 'combat',
    jitter: { min: 0.97, max: 1.03 },
    layers: [
      { startHz: 520, endHz: 420, filterHz: 3600 },
      { startHz: 740, endHz: 600, filterHz: 5000 },
    ],
  },
};

export const RUN_EVENT_SFX_FREQUENCY: Record<RunEventSfxId, SfxFrequencyProfile> = {
  waveClear: {
    band: 'runInformational',
    bus: 'runEvent',
    layers: [
      { startHz: 392, endHz: 494, filterHz: 3800 },
      { startHz: 587, endHz: 740, filterHz: 4200 },
      { startHz: 880, endHz: 1046, filterHz: 4600 },
    ],
  },
  waveResume: {
    band: 'runInformational',
    bus: 'runEvent',
    jitter: { min: 0.97, max: 1.03 },
    layers: [
      { startHz: 560, endHz: 680, filterHz: 3400 },
      { startHz: 1120, endHz: 940, filterHz: 4000 },
    ],
  },
  breachWarning: {
    band: 'runAlert',
    bus: 'runEvent',
    layers: [
      { startHz: 580, endHz: 520, filterHz: 3600 },
      { startHz: 720, endHz: 640, filterHz: 3900 },
      { startHz: 870, endHz: 760, filterHz: 4200 },
      { startHz: 1120, endHz: 980, filterHz: 4800 },
    ],
  },
  meltdown: {
    band: 'runCriticalLow',
    bus: 'runEvent',
    layers: [
      { startHz: 440, endHz: 185, filterHz: 3400 },
      { startHz: 330, endHz: 140, filterHz: 2800 },
      { startHz: 220, endHz: 90, filterHz: 2600 },
    ],
  },
  victory: {
    band: 'runInformational',
    bus: 'runEvent',
    layers: [
      { startHz: 392, endHz: 440, filterHz: 4000 },
      { startHz: 494, endHz: 554, filterHz: 4000 },
      { startHz: 587, endHz: 659, filterHz: 4000 },
      { startHz: 740, endHz: 784, filterHz: 4000 },
      { startHz: 988, endHz: 1174, filterHz: 4500 },
    ],
  },
  bossIncoming: {
    band: 'runAlert',
    bus: 'runEvent',
    layers: [
      { startHz: 1240, endHz: 960, filterHz: 4500 },
      { startHz: 494, endHz: 587, filterHz: 3300 },
    ],
  },
};

/** Unified lookup — one entry per playable SFX id. */
export const SFX_FREQUENCY_MAP: Record<SfxId, SfxFrequencyProfile> = {
  ...COMBAT_SFX_FREQUENCY,
  ...RUN_EVENT_SFX_FREQUENCY,
  nodeSelect: profileFromHexPulse('normal'),
  settingsOpen: profileFromHexPulse('soft'),
  nodeLocked: profileFromHexPulse('denied'),
  purchase: UI_CONFIRM_FREQUENCY,
  startRun: profileFromHexPulse('strong'),
  uiConfirm: UI_CONFIRM_FREQUENCY,
  settingsClose: UI_BACK_FREQUENCY,
  uiBack: UI_BACK_FREQUENCY,
  archTyping: ARCH_TYPING_FREQUENCY,
};

function profileFromHexPulse(variant: HexPulseVariant): SfxFrequencyProfile {
  const pulse = HEX_PULSE_FREQUENCY[variant];
  return {
    band: pulse.band,
    bus: 'ui',
    layers: [pulse.low, pulse.high],
  };
}

const DEV_TOLERANCE_HZ = 8;

export function getFrequencyBand(bandId: FrequencyBandId) {
  return FREQUENCY_BANDS[bandId];
}

export function getSfxFrequencyProfile(id: SfxId): SfxFrequencyProfile {
  return SFX_FREQUENCY_MAP[id];
}

export function getHubSfxRoute(id: HubSfxId): HubSfxRoute {
  return HUB_SFX_ROUTES[id];
}

export function getHubSfxCategory(id: HubSfxId): HubSfxCategory {
  return HUB_SFX_ROUTES[id].category;
}

export function isFrequencyInBand(hz: number, bandId: FrequencyBandId, toleranceHz = DEV_TOLERANCE_HZ): boolean {
  const band = FREQUENCY_BANDS[bandId];
  return hz >= band.minHz - toleranceHz && hz <= band.maxHz + toleranceHz;
}

export function assertLayerInBand(
  layer: FrequencyLayerSpec,
  bandId: FrequencyBandId,
  context: string,
): void {
  if (layer.filterSweep || layer.noiseTexture) return;
  if (!isFrequencyInBand(layer.startHz, bandId) || !isFrequencyInBand(layer.endHz, bandId)) {
    throw new Error(
      `[frequencyMap] ${context}: layer ${layer.startHz}→${layer.endHz} Hz outside band ${bandId} (${FREQUENCY_BANDS[bandId].minHz}–${FREQUENCY_BANDS[bandId].maxHz})`,
    );
  }
}

export function assertProfileInBand(profile: SfxFrequencyProfile, context: string): void {
  for (const layer of profile.layers) {
    assertLayerInBand(layer, profile.band, context);
  }
  if (profile.jitter) {
    for (const layer of profile.layers) {
      if (layer.filterSweep || layer.noiseTexture) continue;
      const maxHz = Math.max(layer.startHz, layer.endHz) * profile.jitter.max;
      const minHz = Math.min(layer.startHz, layer.endHz) * profile.jitter.min;
      if (!isFrequencyInBand(maxHz, profile.band) || !isFrequencyInBand(minHz, profile.band)) {
        throw new Error(
          `[frequencyMap] ${context}: jitter range ${minHz.toFixed(0)}–${maxHz.toFixed(0)} Hz exceeds band ${profile.band}`,
        );
      }
    }
  }
}

function validateFrequencyMap(): void {
  for (const variant of Object.keys(HEX_PULSE_FREQUENCY) as HexPulseVariant[]) {
    const pulse = HEX_PULSE_FREQUENCY[variant];
    assertLayerInBand(pulse.low, pulse.band, `hexPulse.${variant}.low`);
    assertLayerInBand(pulse.high, pulse.band, `hexPulse.${variant}.high`);
  }

  assertProfileInBand(UI_CONFIRM_FREQUENCY, 'uiConfirm');
  assertProfileInBand(UI_BACK_FREQUENCY, 'uiBack');
  assertProfileInBand(ARCH_TYPING_FREQUENCY, 'archTyping');

  for (const id of Object.keys(COMBAT_SFX_FREQUENCY) as GameSfxId[]) {
    assertProfileInBand(COMBAT_SFX_FREQUENCY[id], `combat.${id}`);
  }

  for (const id of Object.keys(RUN_EVENT_SFX_FREQUENCY) as RunEventSfxId[]) {
    assertProfileInBand(RUN_EVENT_SFX_FREQUENCY[id], `runEvent.${id}`);
  }

  for (const id of Object.keys(HUB_SFX_ROUTES) as HubSfxId[]) {
    const route = HUB_SFX_ROUTES[id];
    const profile = SFX_FREQUENCY_MAP[id];
    if (profile.band !== route.band) {
      throw new Error(`[frequencyMap] hub.${id}: route band ${route.band} ≠ profile band ${profile.band}`);
    }
  }
}

if (import.meta.env.DEV) {
  validateFrequencyMap();
}
