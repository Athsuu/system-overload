/**
 * Logique de coup critique — préparation moteur uniquement (pas de module UI pour l'instant).
 * Valeurs par défaut, pas encore ajustables par le joueur.
 */

/** Chance de critique par défaut (8%), avant tout futur module d'amélioration. */
export const BASE_CRITICAL_CHANCE = 0.08;

/** Multiplicateur de dégâts sur un coup critique (x2), avant tout futur module d'amélioration. */
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
