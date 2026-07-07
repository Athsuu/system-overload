import { loadSettings, saveSettings } from '../store/settingsPersistence';
import { detectGameLocale } from './detectLocale';
import { EN_STRINGS } from './locales/en';
import { FR_STRINGS } from './locales/fr';
import type { GameLocale, GameStrings, LanguageMode } from './types';

const listeners = new Set<() => void>();

let languageMode: LanguageMode = loadSettings().languageMode ?? 'auto';

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function resolveLocale(mode: LanguageMode): GameLocale {
  if (mode === 'fr' || mode === 'en') return mode;
  return detectGameLocale();
}

export function getLanguageMode(): LanguageMode {
  return languageMode;
}

export function getGameLocale(): GameLocale {
  return resolveLocale(languageMode);
}

export function getGameStrings(): GameStrings {
  return getGameLocale() === 'fr' ? FR_STRINGS : EN_STRINGS;
}

export function setLanguageMode(mode: LanguageMode): void {
  if (languageMode === mode) return;
  languageMode = mode;
  const settings = loadSettings();
  saveSettings({ ...settings, languageMode: mode });
  notify();
}

export function initLanguageModeFromSettings(): void {
  languageMode = loadSettings().languageMode ?? 'auto';
}

export function subscribeLocale(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export type { GameLocale, GameStrings, LanguageMode } from './types';
