const SETTINGS_KEY = 'system-overload-settings';

export interface SettingsData {
  masterVolume: number;
}

export const DEFAULT_SETTINGS: SettingsData = {
  masterVolume: 80,
};

export function loadSettings(): SettingsData {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };

    const parsed = JSON.parse(raw) as Partial<SettingsData>;
    const masterVolume =
      typeof parsed.masterVolume === 'number'
        ? Math.min(100, Math.max(0, Math.round(parsed.masterVolume)))
        : DEFAULT_SETTINGS.masterVolume;

    return { masterVolume };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(data: SettingsData): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
}
