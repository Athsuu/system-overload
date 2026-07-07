import type { GameLocale } from './types';

export function detectGameLocale(): GameLocale {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language?.toLowerCase() ?? 'en';
  return lang.startsWith('fr') ? 'fr' : 'en';
}
