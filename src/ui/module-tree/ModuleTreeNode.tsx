import type { UpgradeId, ModuleState } from '../../store/upgradeCatalog';
import type { ModuleGlyphId } from '../../store/moduleTree';
import { NODE_RADIUS } from '../../store/moduleTree';
import { useGameStore } from '../../store/useGameStore';
import { getNodeHexRadius, socketPoints } from './moduleTreeGeometry';
import { triggerSfx } from '../../audio/sfxApi';
import { hexagonPoints } from './moduleTreeGeometry';
import { ModuleTreeBranchGlyph } from './moduleTreeBranchIcons';
import { getNodeVisualState, getRootNodeVisualState, MODULE_TREE_VISUAL } from './moduleTreeTheme';
import { DARK_HEX } from '../../theme/darkHexTerminal';

interface ModuleTreeNodeProps {
  id: UpgradeId;
  x: number;
  y: number;
  glyph: ModuleGlyphId | null;
  level: number;
  state: ModuleState;
  isSelected: boolean;
  isRoot?: boolean;
  isUncapped?: boolean;
  isEditorParent?: boolean;
  onEditorPickParent?: (parentId: UpgradeId) => void;
  onSelect: () => void;
}

export function ModuleTreeNode({
  id,
  x,
  y,
  glyph,
  level,
  state,
  isSelected,
  isRoot = false,
  isUncapped = false,
  isEditorParent = false,
  onEditorPickParent,
  onSelect,
}: ModuleTreeNodeProps) {
  const radius = isRoot ? getNodeHexRadius('node0Boot') : NODE_RADIUS;
  const visual = isRoot
    ? getRootNodeVisualState(isSelected || isEditorParent, level)
    : getNodeVisualState(state, isSelected || isEditorParent, level);
  const isLocked = state === 'locked';
  const isReserved = state === 'reserved';

  // Sélecteur ciblé : seul ce nœud se re-rend quand SON état d'ancrage change.
  const anchored = useGameStore((store) => store.anchoredNodes[id]);
  const toggleAnchorSupercharge = useGameStore((store) => store.toggleAnchorSupercharge);
  const isAnchored = anchored !== undefined;
  const anchorActive = anchored === true;

  return (
    <g
      data-module-node
      className={isSelected || isEditorParent ? 'so-module-tree-node--active' : undefined}
      style={{ cursor: onEditorPickParent ? 'crosshair' : 'pointer', opacity: visual.opacity }}
      onPointerDown={(event) => {
        event.stopPropagation();
        if (onEditorPickParent) {
          onEditorPickParent(id);
          return;
        }
        if (isLocked) {
          triggerSfx('nodeSelect');
          onSelect();
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

      {isUncapped && (
        <polygon
          points={hexagonPoints(x, y, radius - 4)}
          fill="none"
          stroke={visual.stroke}
          strokeWidth={1}
          strokeOpacity={0.5}
        />
      )}

      {isReserved ? (
        <text x={x} y={y + 4} textAnchor="middle" fontSize={15} fill={visual.iconFill} fontWeight={600}>
          ···
        </text>
      ) : glyph ? (
        <ModuleTreeBranchGlyph glyph={glyph} x={x} y={y} color={visual.iconFill} />
      ) : isLocked ? (
        <text x={x} y={y + 5} textAnchor="middle" fontSize={24} fill={visual.iconFill} fontWeight={600}>
          ?
        </text>
      ) : null}

      {isAnchored && (
        <g
          style={{ cursor: 'pointer' }}
          onPointerDown={(event) => {
            event.stopPropagation();
            toggleAnchorSupercharge(id);
            triggerSfx('uiConfirm');
          }}
        >
          {anchorActive && (
            <line
              x1={x}
              y1={y}
              x2={x}
              y2={y + radius * Math.sin(Math.PI / 3)}
              stroke={DARK_HEX.breachGlow}
              strokeWidth={1.5}
              opacity={0.35}
            />
          )}
          <polygon
            points={socketPoints(x, y, radius)}
            fill={anchorActive ? DARK_HEX.breachGlow : '#2a2a32'}
            stroke={anchorActive ? DARK_HEX.breachGlow : '#4a4a55'}
            strokeWidth={1}
            opacity={anchorActive ? 0.9 : 0.7}
          />
        </g>
      )}
    </g>
  );
}
