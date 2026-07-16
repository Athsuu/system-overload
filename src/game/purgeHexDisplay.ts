import { RUN_STAT_BASE } from './moduleEffects';
import { getGameLocale, getGameStrings } from '../i18n';

/**
 * Unité joueur pour les portées AOE / aimant.
 * 1 hex = rayon de purge de base Node-0 (px moteur) — les px restent internes.
 */
export const PURGE_HEX_PX = RUN_STAT_BASE.basePurgeRadius;

export function pixelsToHex(px: number): number {
  if (!Number.isFinite(px) || px <= 0) return 0;
  return px / PURGE_HEX_PX;
}

/** Affiche une portée joueur, ex. `1,3 hex` (FR) / `1.3 hex` (EN). */
export function formatHexRadius(px: number): string {
  const unit = getGameStrings().playerStats.hexUnit;
  const value = pixelsToHex(px);
  const fixed = value.toFixed(1);
  const num = getGameLocale() === 'fr' ? fixed.replace('.', ',') : fixed;
  return `${num} ${unit}`;
}
