import type { SkillState } from '../store/upgradeCatalog';
import { NODE_RADIUS } from '../store/skillTree';
import { hexagonPoints } from './skillTreeGeometry';
import { getNodeVisualState, SKILL_TREE_VISUAL } from './skillTreeTheme';

interface SkillTreeNodeProps {
  x: number;
  y: number;
  icon: string;
  level: number;
  state: SkillState;
  isSelected: boolean;
  onSelect: () => void;
}

export function SkillTreeNode({
  x,
  y,
  icon,
  level,
  state,
  isSelected,
  onSelect,
}: SkillTreeNodeProps) {
  const radius = NODE_RADIUS;
  const visual = getNodeVisualState(state, isSelected, level);
  const isLocked = state === 'locked';

  return (
    <g
      data-skill-node
      style={{ cursor: isLocked ? 'not-allowed' : 'pointer', opacity: visual.opacity }}
      onPointerDown={(event) => {
        event.stopPropagation();
        if (!isLocked) onSelect();
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
        <text x={x} y={y + 5} textAnchor="middle" fontSize={20} fill={visual.iconFill} fontWeight={600}>
          ?
        </text>
      ) : (
        <text
          x={x}
          y={y + 5}
          textAnchor="middle"
          fontSize={18}
          fill={visual.iconFill}
          fontWeight={700}
        >
          {icon}
        </text>
      )}
    </g>
  );
}
