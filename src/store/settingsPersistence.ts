import type { LanguageMode } from '../i18n/types';

const SETTINGS_KEY = 'system-overload-settings';

export interface SettingsData {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  fluxDriveEnabled: boolean;
  languageMode: LanguageMode;
}

export const DEFAULT_SETTINGS: SettingsData = {
  masterVolume: 50,
  musicVolume: 42,
  sfxVolume: 58,
  fluxDriveEnabled: false,
  languageMode: 'auto',
};

function clampVolume(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function parseLanguageMode(value: unknown): LanguageMode {
  if (value === 'auto' || value === 'fr' || value === 'en') return value;
  return DEFAULT_SETTINGS.languageMode;
}

export function loadSettings(): SettingsData {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };

    const parsed = JSON.parse(raw) as Partial<SettingsData>;
    return {
      masterVolume: clampVolume(parsed.masterVolume, DEFAULT_SETTINGS.masterVolume),
      musicVolume: clampVolume(parsed.musicVolume, DEFAULT_SETTINGS.musicVolume),
      sfxVolume: clampVolume(parsed.sfxVolume, DEFAULT_SETTINGS.sfxVolume),
      fluxDriveEnabled:
        typeof parsed.fluxDriveEnabled === 'boolean'
          ? parsed.fluxDriveEnabled
          : DEFAULT_SETTINGS.fluxDriveEnabled,
      languageMode: parseLanguageMode(parsed.languageMode),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(data: SettingsData): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
}

export function saveFluxDriveEnabled(enabled: boolean): void {
  saveSettings({ ...loadSettings(), fluxDriveEnabled: enabled });
}

export function clearSettings(): void {
  localStorage.removeItem(SETTINGS_KEY);
}
