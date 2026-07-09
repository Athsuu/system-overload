import type { ModuleState } from '../store/upgradeCatalog';
import type { ModuleGlyphId } from '../store/moduleTree';
import { NODE_RADIUS } from '../store/moduleTree';
import { getNodeHexRadius } from './moduleTreeGeometry';
import { triggerSfx } from '../audio/sfxApi';
import { hexagonPoints } from './moduleTreeGeometry';
import { ModuleTreeBranchGlyph } from './moduleTreeBranchIcons';
import { getNodeVisualState, getRootNodeVisualState, MODULE_TREE_VISUAL } from './moduleTreeTheme';

interface ModuleTreeNodeProps {
  x: number;
  y: number;
  glyph: ModuleGlyphId | null;
  level: number;
  state: ModuleState;
  isSelected: boolean;
  isRoot?: boolean;
  onSelect: () => void;
}

export function ModuleTreeNode({
  x,
  y,
  glyph,
  level,
  state,
  isSelected,
  isRoot = false,
  onSelect,
}: ModuleTreeNodeProps) {
  const radius = isRoot ? getNodeHexRadius('node0Boot') : NODE_RADIUS;
  const visual = isRoot
    ? getRootNodeVisualState(isSelected, level)
    : getNodeVisualState(state, isSelected, level);
  const isLocked = state === 'locked';
  const isReserved = state === 'reserved';

  return (
    <g
      data-module-node
      className={isSelected ? 'so-module-tree-node--active' : undefined}
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
          stroke={isSelected ? MODULE_TREE_VISUAL.gold : visual.stroke}
          strokeWidth={1}
          strokeOpacity={isSelected ? 0.85 : 0.45}
        />
      )}

      <polygon
        points={hexagonPoints(x, y, radius)}
        fill={MODULE_TREE_VISUAL.nodeFill}
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
        <ModuleTreeBranchGlyph glyph={glyph} x={x} y={y} color={visual.iconFill} />
      ) : null}
    </g>
  );
}
