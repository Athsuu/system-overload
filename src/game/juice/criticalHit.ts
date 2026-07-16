/**
 * Logique de coup critique — base + modules (ex. Critique de purge).
 */

/** Chance de critique de base (8 %), hors modules. */
export const BASE_CRITICAL_CHANCE = 0.08;

/** Multiplicateur de dégâts sur un coup critique (×2). */
export const BASE_CRITICAL_MULTIPLIER = 2;

export interface CriticalRollResult {
  isCritical: boolean;
  damage: number;
}

/** Tire un critique pour un coup donné et retourne les dégâts finaux (arrondis). */
export function rollCritical(
  baseDamage: number,
  criticalChance: number,
  criticalMultiplier: number,
): CriticalRollResult {
  const isCritical = Math.random() < criticalChance;
  const damage = isCritical ? Math.round(baseDamage * criticalMultiplier) : baseDamage;
  return { isCritical, damage };
}
