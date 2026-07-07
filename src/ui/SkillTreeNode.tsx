import type { SkillState } from '../store/upgradeCatalog';
import type { SkillIconBranch } from '../store/skillTree';
import { NODE_RADIUS } from '../store/skillTree';
import { playHubSfx } from '../audio/hubAudio';
import { ensureHubAudioUnlocked } from '../audio/useHubAudio';
import { hexagonPoints } from './skillTreeGeometry';
import { SkillTreeBranchGlyph } from './skillTreeBranchIcons';
import { getNodeVisualState, SKILL_TREE_VISUAL } from './skillTreeTheme';

interface SkillTreeNodeProps {
  x: number;
  y: number;
  branch: SkillIconBranch;
  level: number;
  state: SkillState;
  isSelected: boolean;
  onSelect: () => void;
}

export function SkillTreeNode({
  x,
  y,
  branch,
  level,
  state,
  isSelected,
  onSelect,
}: SkillTreeNodeProps) {
  const radius = NODE_RADIUS;
  const visual = getNodeVisualState(state, isSelected, level);
  const isLocked = state === 'locked';
  const isReserved = state === 'reserved';

  return (
    <g
      data-skill-node
      className={isSelected ? 'so-skill-tree-node--active' : undefined}
      style={{ cursor: isLocked ? 'not-allowed' : 'pointer', opacity: visual.opacity }}
      onPointerDown={(event) => {
        event.stopPropagation();
        ensureHubAudioUnlocked();
        if (isLocked) {
          playHubSfx('nodeLocked');
          return;
        }
        if (!isReserved) {
          playHubSfx('nodeSelect');
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
        <text x={x} y={y + 5} textAnchor="middle" fontSize={20} fill={visual.iconFill} fontWeight={600}>
          ?
        </text>
      ) : state === 'reserved' ? (
        <text x={x} y={y + 4} textAnchor="middle" fontSize={11} fill={visual.iconFill} fontWeight={600}>
          ···
        </text>
      ) : (
        <SkillTreeBranchGlyph branch={branch} x={x} y={y} color={visual.iconFill} />
      )}
    </g>
  );
}
