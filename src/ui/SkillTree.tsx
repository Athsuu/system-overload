import { useGameStore } from '../store/useGameStore';
import { getSkillState, type UpgradeId } from '../store/upgradeCatalog';
import {
  NODE0_HUB_POSITION,
  getNodePosition,
  getRevealedGraphNodes,
  getSkillIconBranch,
  getUpgradeBranch,
  isPlaceholderId,
  type PlaceholderId,
  type TreeNodeId,
  TREE_CANVAS,
} from '../store/skillTree';
import {
  getHexagonEdgePoint,
  getNodeHexRadius,
  getNodeHexStartAngle,
} from './skillTreeGeometry';
import { SkillTreeNode } from './SkillTreeNode';
import { SkillTreePlaceholderTooltip } from './SkillTreePlaceholderTooltip';
import { SkillTreeTooltip } from './SkillTreeTooltip';
import { getEdgeVisual } from './skillTreeTheme';

interface SkillTreeProps {
  selectedId: TreeNodeId | null;
  onSelectSkill: (id: TreeNodeId) => void;
  onClearSelection: () => void;
}

function resolveEdgeParentId(parentId: TreeNodeId | 'root'): TreeNodeId | 'core' {
  if (parentId === 'root') return 'core';
  return parentId;
}

export function SkillTree({ selectedId, onSelectSkill, onClearSelection }: SkillTreeProps) {
  const bankShards = useGameStore((state) => state.bankShards);
  const bankAnchorFragments = useGameStore((state) => state.bankAnchorFragments);
  const upgrades = useGameStore((state) => state.upgrades);

  const revealedNodes = getRevealedGraphNodes(upgrades);
  const upgradeNodes = revealedNodes.filter((node) => node.kind === 'upgrade');
  const placeholderNodes = revealedNodes.filter((node) => node.kind === 'placeholder');

  return (
    <svg
      width={TREE_CANVAS.width}
      height={TREE_CANVAS.height}
      viewBox={`0 0 ${TREE_CANVAS.width} ${TREE_CANVAS.height}`}
      className="block select-none overflow-visible"
      onPointerDown={(event) => {
        const target = event.target as Element;
        if (target.closest('[data-skill-node]') || target.closest('[data-skill-tooltip]')) return;
        onClearSelection();
      }}
    >
      <defs>
        <radialGradient id="ambientRed" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff4d00" stopOpacity={0.16} />
          <stop offset="100%" stopColor="#ff4d00" stopOpacity={0} />
        </radialGradient>

        <filter id="nodeGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="edgeGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse
        cx={NODE0_HUB_POSITION.x}
        cy={NODE0_HUB_POSITION.y}
        rx={480}
        ry={420}
        fill="url(#ambientRed)"
      />

      {revealedNodes.map((node) => {
        if (node.parentId === 'root') return null;
        const from = getNodePosition(resolveEdgeParentId(node.parentId));
        const to = node.position;
        const fromKey = resolveEdgeParentId(node.parentId);
        const toKey = node.id;
        const fromRadius = getNodeHexRadius(fromKey);
        const toRadius = getNodeHexRadius(toKey);
        const p1 = getHexagonEdgePoint(
          from.x,
          from.y,
          fromRadius,
          to.x,
          to.y,
          getNodeHexStartAngle(fromKey),
        );
        const p2 = getHexagonEdgePoint(
          to.x,
          to.y,
          toRadius,
          from.x,
          from.y,
          getNodeHexStartAngle(toKey),
        );
        const edge = getEdgeVisual(true);

        return (
          <g key={`edge-${node.id}`}>
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={edge.glow}
              strokeWidth={7}
              strokeLinecap="round"
              opacity={0.25}
            />
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={edge.stroke}
              strokeWidth={2}
              strokeLinecap="round"
              opacity={0.95}
              filter="url(#edgeGlow)"
            />
          </g>
        );
      })}

      {upgradeNodes.map((node) => {
        const upgradeId = node.id as UpgradeId;
        const branch = getUpgradeBranch(upgradeId);
        return (
          <SkillTreeNode
            key={node.id}
            x={node.position.x}
            y={node.position.y}
            branch={getSkillIconBranch(upgradeId, branch)}
            level={upgrades[upgradeId]}
            state={getSkillState(
              upgradeId,
              bankShards,
              bankAnchorFragments,
              upgrades,
              node.requires,
            )}
            isSelected={selectedId === node.id}
            onSelect={() => onSelectSkill(node.id)}
          />
        );
      })}

      {placeholderNodes.map((node) => (
        <SkillTreeNode
          key={node.id}
          x={node.position.x}
          y={node.position.y}
          branch={node.branch}
          level={0}
          state="reserved"
          isSelected={selectedId === node.id}
          onSelect={() => onSelectSkill(node.id)}
        />
      ))}

      {selectedId && !isPlaceholderId(selectedId) && (
        <SkillTreeTooltip selectedId={selectedId} />
      )}

      {selectedId && isPlaceholderId(selectedId) && (
        <SkillTreePlaceholderTooltip placeholderId={selectedId as PlaceholderId} />
      )}
    </svg>
  );
}
