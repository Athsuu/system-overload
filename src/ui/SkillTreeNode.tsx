import type { SkillState } from '../store/upgradeCatalog';
import type { SkillGlyphId } from '../store/skillTree';
import { NODE_RADIUS } from '../store/skillTree';
import { getNodeHexRadius } from './skillTreeGeometry';
import { triggerSfx } from '../audio/sfxApi';
import { hexagonPoints } from './skillTreeGeometry';
import { SkillTreeBranchGlyph } from './skillTreeBranchIcons';
import { getNodeVisualState, getRootNodeVisualState, SKILL_TREE_VISUAL } from './skillTreeTheme';

interface SkillTreeNodeProps {
  x: number;
  y: number;
  glyph: SkillGlyphId | null;
  level: number;
  state: SkillState;
  isSelected: boolean;
  isRoot?: boolean;
  onSelect: () => void;
}

export function SkillTreeNode({
  x,
  y,
  glyph,
  level,
  state,
  isSelected,
  isRoot = false,
  onSelect,
}: SkillTreeNodeProps) {
  const radius = isRoot ? getNodeHexRadius('node0Boot') : NODE_RADIUS;
  const visual = isRoot
    ? getRootNodeVisualState(isSelected, level)
    : getNodeVisualState(state, isSelected, level);
  const isLocked = state === 'locked';
  const isReserved = state === 'reserved';

  return (
    <g
      data-skill-node
      className={isSelected ? 'so-skill-tree-node--active' : undefined}
      style={{ cursor: isLocked ? 'not-allowed' : 'pointer', opacity: visual.opacity }}
      onPointerDown={(event) => {
        event.stopPropagation();
        if (isLocked) {
          triggerSfx('nodeLocked');
          return;
        }
        if (!isReserved) {
          triggerSfx('nodeSelect');
        }
        onSelect();
      }}
    >
      {visual.glowOpacity > 0 && (
        <polygon
          points={hexagonPoints(x, y, radius + 8)}
          fill={visual.glowColor}
          opacity={visual.glowOpacity}
          filter="url(#nodeGlow)"
        />
      )}

      {visual.doubleBorder && (
        <polygon
          points={hexagonPoints(x, y, radius + 4)}
          fill="none"
          stroke={isSelected ? SKILL_TREE_VISUAL.gold : visual.stroke}
          strokeWidth={1}
          strokeOpacity={isSelected ? 0.85 : 0.45}
        />
      )}

      <polygon
        points={hexagonPoints(x, y, radius)}
        fill={SKILL_TREE_VISUAL.nodeFill}
        stroke={visual.stroke}
        strokeWidth={visual.strokeWidth}
        strokeLinejoin="round"
      />

      {isLocked ? (
        <text x={x} y={y + 5} textAnchor="middle" fontSize={24} fill={visual.iconFill} fontWeight={600}>
          ?
        </text>
      ) : state === 'reserved' ? (
        <text x={x} y={y + 4} textAnchor="middle" fontSize={15} fill={visual.iconFill} fontWeight={600}>
          ···
        </text>
      ) : glyph ? (
        <SkillTreeBranchGlyph glyph={glyph} x={x} y={y} color={visual.iconFill} />
      ) : null}
    </g>
  );
}
