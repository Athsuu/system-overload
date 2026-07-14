import type { CoreProtocolState } from '../store/coreProtocolCatalog';

/** Palette Monolithe — verre dépoli cyan, détaché de la grille hexagonale du hub. */
export const SEED_PROTOCOL_VISUAL = {
  accent: '#38bdf8',
  accentGlow: 'rgba(56, 189, 248, 0.55)',
  accentMuted: '#7dd3fc',
  spineLine: 'rgba(125, 211, 252, 0.28)',
  glassBg: 'rgba(14, 22, 30, 0.42)',
  glassBgSelected: 'rgba(20, 38, 50, 0.62)',
  glassBorder: 'rgba(148, 178, 194, 0.14)',
} as const;

export interface CoreProtocolTierVisual {
  border: string;
  background: string;
  glow: string;
  textColor: string;
  titleColor: string;
  pipColor: string;
  opacity: number;
}

export function getCoreProtocolTierVisual(
  state: CoreProtocolState,
  isSelected: boolean,
  level: number,
): CoreProtocolTierVisual {
  if (state === 'available') {
    return {
      border: isSelected
        ? `${SEED_PROTOCOL_VISUAL.accent}77`
        : level > 0
          ? `${SEED_PROTOCOL_VISUAL.accent}44`
          : SEED_PROTOCOL_VISUAL.glassBorder,
      background: isSelected ? SEED_PROTOCOL_VISUAL.glassBgSelected : SEED_PROTOCOL_VISUAL.glassBg,
      glow: isSelected
        ? `0 0 30px ${SEED_PROTOCOL_VISUAL.accentGlow}`
        : level > 0
          ? `0 0 16px ${SEED_PROTOCOL_VISUAL.accentGlow}`
          : 'none',
      textColor: 'rgba(226, 244, 255, 0.55)',
      titleColor: SEED_PROTOCOL_VISUAL.accentMuted,
      pipColor: SEED_PROTOCOL_VISUAL.accent,
      opacity: 1,
    };
  }

  return {
    border: SEED_PROTOCOL_VISUAL.glassBorder,
    background: 'rgba(10, 14, 18, 0.32)',
    glow: 'none',
    textColor: 'rgba(148, 163, 184, 0.4)',
    titleColor: 'rgba(148, 163, 184, 0.55)',
    pipColor: 'rgba(148, 163, 184, 0.35)',
    opacity: 0.62,
  };
}
