import type { AnchoredNodes, UpgradeId } from '../store/upgradeCatalog';

/** Rendement générique appliqué à la contribution de base d'un module ancré et actif. */
export const ANCHOR_SUPERCHARGE_YIELD_MULTIPLIER = 2;

/** Pénalité additive de Surcharge (Heat) globale, par module ancré actif. */
export const ANCHOR_SUPERCHARGE_HEAT_PENALTY_PERCENT = 25;

/** Cycles réussis nécessaires pour gagner +1 Anchor Fragment. */
export const ANCHOR_CYCLES_PER_FRAGMENT = 3;

export function isNodeAnchored(anchoredNodes: AnchoredNodes, id: UpgradeId): boolean {
  return anchoredNodes[id] !== undefined;
}

export function isNodeAnchorActive(anchoredNodes: AnchoredNodes, id: UpgradeId): boolean {
  return anchoredNodes[id] === true;
}

/** ×2 (ou ×1) à multiplier sur la contribution de base d'un module — voir Tâche 2. */
export function getAnchorMultiplier(anchoredNodes: AnchoredNodes, id: UpgradeId): number {
  return isNodeAnchorActive(anchoredNodes, id) ? ANCHOR_SUPERCHARGE_YIELD_MULTIPLIER : 1;
}

export function getActiveAnchorCount(anchoredNodes: AnchoredNodes): number {
  return Object.values(anchoredNodes).filter(Boolean).length;
}

/** Multiplicateur global à appliquer à passiveHeatPerSec — +25 % additif par module ancré actif. */
export function getAnchorHeatMultiplier(anchoredNodes: AnchoredNodes): number {
  return 1 + (getActiveAnchorCount(anchoredNodes) * ANCHOR_SUPERCHARGE_HEAT_PENALTY_PERCENT) / 100;
}
