/**
 * Prestige layer — unlocked after first boss victory.
 * Full implementation deferred; types document the future API.
 */
export interface PrestigeState {
  prestigeUnlocked: boolean;
  prestigeLevel: number;
}

export const DEFAULT_PRESTIGE: PrestigeState = {
  prestigeUnlocked: false,
  prestigeLevel: 0,
};

/** Future: permanent bonuses from prestige resets (Core Fragments currency). */
export interface PrestigeBonuses {
  // placeholder for future prestige upgrade levels
}
