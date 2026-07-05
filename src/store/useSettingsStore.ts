import { create } from 'zustand';
import {
  loadSettings,
  saveSettings,
  type SettingsData,
} from './settingsPersistence';

export type SettingsSection = 'audio' | 'language' | 'controls';

interface SettingsStore extends SettingsData {
  isOpen: boolean;
  activeSection: SettingsSection;
  openSettings: () => void;
  closeSettings: () => void;
  setActiveSection: (section: SettingsSection) => void;
  setMasterVolume: (volume: number) => void;
}

const persisted = loadSettings();

export const useSettingsStore = create<SettingsStore>((set) => ({
  isOpen: false,
  activeSection: 'audio',
  masterVolume: persisted.masterVolume,
  openSettings: () => set({ isOpen: true, activeSection: 'audio' }),
  closeSettings: () => set({ isOpen: false }),
  setActiveSection: (section) => {
    if (section === 'language' || section === 'controls') return;
    set({ activeSection: section });
  },
  setMasterVolume: (volume) => {
    const masterVolume = Math.min(100, Math.max(0, Math.round(volume)));
    set({ masterVolume });
    saveSettings({ masterVolume });
  },
}));

export function getMasterVolume(): number {
  return useSettingsStore.getState().masterVolume;
}
