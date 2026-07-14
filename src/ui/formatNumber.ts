import { getGameLocale } from '../i18n';

const INTL_LOCALE_BY_GAME_LOCALE = {
  fr: 'fr-FR',
  en: 'en-US',
} as const;

/** Compact display for prices/balances that can grow unbounded (Soft Cap modules) — e.g. 1.5k, 2M. */
export function formatCompactNumber(value: number): string {
  if (value < 1000) return value.toLocaleString(INTL_LOCALE_BY_GAME_LOCALE[getGameLocale()]);
  return new Intl.NumberFormat(INTL_LOCALE_BY_GAME_LOCALE[getGameLocale()], {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
