import type { SkillState } from '../store/upgradeCatalog';
import { DARK_HEX } from '../theme/darkHexTerminal';

export const SKILL_TREE_VISUAL = {
  canvasBg: DARK_HEX.canvasBg,
  hexGrid: DARK_HEX.hexGrid,
  edgeActive: DARK_HEX.breach,
  edgeActiveGlow: DARK_HEX.breachGlow,
  edgeLocked: DARK_HEX.edgeLocked,
  coreGlow: DARK_HEX.breach,
  coreFillTop: DARK_HEX.coreFillTop,
  coreFillBottom: DARK_HEX.coreFillBottom,
  nodeFill: DARK_HEX.nodeFill,
  gold: DARK_HEX.gold,
  goldMuted: DARK_HEX.goldMuted,
  tooltipBg: DARK_HEX.tooltipBg,
  tooltipBorder: DARK_HEX.tooltipBorder,
} as const;

export interface NodeVisualState {
  stroke: string;
  strokeWidth: number;
  iconFill: string;
  glowColor: string;
  glowOpacity: number;
  doubleBorder: boolean;
  opacity: number;
}

export function getNodeVisualState(state: SkillState, isSelected: boolean, level: number): NodeVisualState {
  if (state === 'reserved') {
    return {
      stroke: '#4a4a55',
      strokeWidth: 1.5,
      iconFill: '#64748b',
      glowColor: DARK_HEX.breach,
      glowOpacity: isSelected ? 0.12 : 0,
      doubleBorder: false,
      opacity: 0.55,
    };
  }

  if (state === 'locked') {
    return {
      stroke: DARK_HEX.lockedStroke,
      strokeWidth: 1,
      iconFill: '#6b2020',
      glowColor: DARK_HEX.breach,
      glowOpacity: 0,
      doubleBorder: false,
      opacity: 0.45,
    };
  }

  if (state === 'maxed') {
    return {
      stroke: DARK_HEX.gold,
      strokeWidth: 2,
      iconFill: '#ffffff',
      glowColor: DARK_HEX.breach,
      glowOpacity: isSelected ? 0.35 : 0.22,
      doubleBorder: true,
      opacity: 1,
    };
  }

  if (level > 0) {
    return {
      stroke: DARK_HEX.breachGlow,
      strokeWidth: 2,
      iconFill: '#ffffff',
      glowColor: DARK_HEX.breach,
      glowOpacity: isSelected ? 0.4 : 0.25,
      doubleBorder: true,
      opacity: 1,
    };
  }

  if (state === 'available') {
    return {
      stroke: DARK_HEX.breachStroke,
      strokeWidth: 2,
      iconFill: '#ffffff',
      glowColor: DARK_HEX.breach,
      glowOpacity: isSelected ? 0.35 : 0.18,
      doubleBorder: isSelected,
      opacity: 1,
    };
  }

  return {
    stroke: '#8b3030',
    strokeWidth: 1.5,
    iconFill: '#94a3b8',
    glowColor: DARK_HEX.breach,
    glowOpacity: isSelected ? 0.15 : 0.08,
    doubleBorder: false,
    opacity: 0.75,
  };
}

export function getEdgeVisual(unlocked: boolean): { stroke: string; glow: string } {
  if (unlocked) {
    return { stroke: SKILL_TREE_VISUAL.edgeActive, glow: SKILL_TREE_VISUAL.edgeActiveGlow };
  }
  return { stroke: SKILL_TREE_VISUAL.edgeLocked, glow: '#2a0505' };
}
