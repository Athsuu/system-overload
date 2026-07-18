/**
 * Profils skill du robot playtest (`weak` / `medium` / `strong`).
 * Medium ≈ comportement V1 (~780 px/s) pour ne pas invalider l’intuition PO d’un coup.
 */

export type DevAutoplaySkillId = 'weak' | 'medium' | 'strong';

export interface DevAutoplaySkillProfile {
  id: DevAutoplaySkillId;
  label: string;
  /** Vitesse curseur max (px/s écran). */
  cursorMaxSpeedPxPerSec: number;
  /** Imprécision de visée autour de la cible (px). */
  aimJitterPx: number;
  /** Probabilité de bruit sous-optimal au retarget. */
  suboptimalChance: number;
  /** Délai min/max avant re-évaluation (ms). */
  reactionDelayMs: readonly [number, number];
  /** Écart de score minimum pour abandonner la cible actuelle. */
  retargetHysteresis: number;
  /** Anticipation trajectoire (s). */
  aimPredictSec: number;
  /** Lissage du suivi de la cible (ms). */
  aimFollowSmoothMs: number;
  /** Coût de déplacement (score / px depuis le curseur). */
  moveCostPerPx: number;
}

export const DEV_AUTOPLAY_SKILL_PROFILES: Record<
  DevAutoplaySkillId,
  DevAutoplaySkillProfile
> = {
  weak: {
    id: 'weak',
    label: 'Faible',
    cursorMaxSpeedPxPerSec: 520,
    aimJitterPx: 28,
    suboptimalChance: 0.22,
    reactionDelayMs: [420, 620],
    retargetHysteresis: 55,
    aimPredictSec: 0.12,
    aimFollowSmoothMs: 200,
    moveCostPerPx: 0.02,
  },
  medium: {
    id: 'medium',
    label: 'Moyen',
    cursorMaxSpeedPxPerSec: 780,
    aimJitterPx: 18,
    suboptimalChance: 0.12,
    reactionDelayMs: [320, 480],
    retargetHysteresis: 42,
    aimPredictSec: 0.15,
    aimFollowSmoothMs: 140,
    moveCostPerPx: 0.015,
  },
  strong: {
    id: 'strong',
    label: 'Fort',
    cursorMaxSpeedPxPerSec: 980,
    aimJitterPx: 10,
    suboptimalChance: 0.04,
    reactionDelayMs: [200, 340],
    retargetHysteresis: 28,
    aimPredictSec: 0.18,
    aimFollowSmoothMs: 100,
    moveCostPerPx: 0.01,
  },
};

export const DEFAULT_DEV_AUTOPLAY_SKILL: DevAutoplaySkillId = 'medium';

export function getDevAutoplaySkillProfile(
  skillId: DevAutoplaySkillId,
): DevAutoplaySkillProfile {
  return DEV_AUTOPLAY_SKILL_PROFILES[skillId];
}
