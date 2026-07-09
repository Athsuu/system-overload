import { create } from 'zustand';
import { applyAudioVolumes } from '../audio/sfxApi';
import { initLanguageModeFromSettings, setLanguageMode as applyLanguageMode } from '../i18n';
import type { LanguageMode } from '../i18n/types';
import {
  loadSettings,
  saveSettings,
  type SettingsData,
} from './settingsPersistence';

export type SettingsSection = 'audio' | 'language' | 'controls';

interface SettingsStore {
  isOpen: boolean;
  activeSection: SettingsSection;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  languageMode: LanguageMode;
  openSettings: () => void;
  closeSettings: () => void;
  setActiveSection: (section: SettingsSection) => void;
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setLanguageMode: (mode: LanguageMode) => void;
}

const persisted = loadSettings();
initLanguageModeFromSettings();

function clampVolume(volume: number): number {
  return Math.min(100, Math.max(0, Math.round(volume)));
}

function pickAudioSettings(state: SettingsStore): SettingsData {
  const saved = loadSettings();
  return {
    ...saved,
    masterVolume: state.masterVolume,
    musicVolume: state.musicVolume,
    sfxVolume: state.sfxVolume,
    languageMode: state.languageMode,
  };
}

function persistAudioVolumes(state: SettingsStore): void {
  const data = pickAudioSettings(state);
  saveSettings(data);
  applyAudioVolumes(data.masterVolume, data.musicVolume, data.sfxVolume);
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  isOpen: false,
  activeSection: 'audio',
  masterVolume: persisted.masterVolume,
  musicVolume: persisted.musicVolume,
  sfxVolume: persisted.sfxVolume,
  languageMode: persisted.languageMode,
  openSettings: () => set({ isOpen: true, activeSection: 'audio' }),
  closeSettings: () => set({ isOpen: false }),
  setActiveSection: (section) => {
    if (section === 'controls') return;
    set({ activeSection: section });
  },
  setMasterVolume: (volume) => {
    const masterVolume = clampVolume(volume);
    set({ masterVolume });
    persistAudioVolumes(get());
  },
  setMusicVolume: (volume) => {
    const musicVolume = clampVolume(volume);
    set({ musicVolume });
    persistAudioVolumes(get());
  },
  setSfxVolume: (volume) => {
    const sfxVolume = clampVolume(volume);
    set({ sfxVolume });
    persistAudioVolumes(get());
  },
  setLanguageMode: (mode) => {
    set({ languageMode: mode });
    applyLanguageMode(mode);
    const data = pickAudioSettings(get());
    saveSettings(data);
  },
}));

persistAudioVolumes(useSettingsStore.getState());
