import { useGameStore } from '../store/useGameStore';
import { getSkillState, type UpgradeId } from '../store/upgradeCatalog';
import {
  CORE_POSITION,
  CORE_RADIUS,
  getNodePosition,
  SKILL_TREE_NODES,
  TREE_CANVAS,
} from '../store/skillTree';
import {
  getHexagonEdgePoint,
  getNodeHexRadius,
  hexagonPoints,
} from './skillTreeGeometry';
import { SkillTreeNode } from './SkillTreeNode';
import { SkillTreeTooltip } from './SkillTreeTooltip';
import { getEdgeVisual, SKILL_TREE_VISUAL } from './skillTreeTheme';

interface SkillTreeProps {
  selectedId: UpgradeId | null;
  onSelectSkill: (id: UpgradeId) => void;
  onClearSelection: () => void;
}

export function SkillTree({ selectedId, onSelectSkill, onClearSelection }: SkillTreeProps) {
  const bankShards = useGameStore((state) => state.bankShards);
  const upgrades = useGameStore((state) => state.upgrades);

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
        <radialGradient id="coreRadial" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={SKILL_TREE_VISUAL.coreFillTop} stopOpacity={0.95} />
          <stop offset="100%" stopColor={SKILL_TREE_VISUAL.coreFillBottom} stopOpacity={0.6} />
        </radialGradient>

        <radialGradient id="ambientRed" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff4d00" stopOpacity={0.08} />
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
        cx={CORE_POSITION.x}
        cy={CORE_POSITION.y}
        rx={480}
        ry={420}
        fill="url(#ambientRed)"
      />

      {SKILL_TREE_NODES.map((node) => {
        if (!node.parentId) return null;
        const from = getNodePosition(node.parentId);
        const to = node.position;
        const fromRadius = getNodeHexRadius(node.parentId);
        const toRadius = getNodeHexRadius(node.id);
        const p1 = getHexagonEdgePoint(from.x, from.y, fromRadius, to.x, to.y);
        const p2 = getHexagonEdgePoint(to.x, to.y, toRadius, from.x, from.y);
        const unlocked =
          getSkillState(node.id, 0, upgrades, node.requires) !== 'locked';
        const edge = getEdgeVisual(unlocked);

        return (
          <g key={`edge-${node.id}`}>
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={edge.glow}
              strokeWidth={unlocked ? 7 : 2}
              strokeLinecap="round"
              opacity={unlocked ? 0.25 : 0.12}
            />
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={edge.stroke}
              strokeWidth={unlocked ? 2 : 1}
              strokeLinecap="round"
              opacity={unlocked ? 0.95 : 0.5}
              filter={unlocked ? 'url(#edgeGlow)' : undefined}
            />
          </g>
        );
      })}

      <polygon
        points={hexagonPoints(CORE_POSITION.x, CORE_POSITION.y, CORE_RADIUS + 12)}
        fill={SKILL_TREE_VISUAL.coreGlow}
        opacity={0.12}
        filter="url(#nodeGlow)"
      />
      <polygon
        points={hexagonPoints(CORE_POSITION.x, CORE_POSITION.y, CORE_RADIUS + 5)}
        fill="none"
        stroke={SKILL_TREE_VISUAL.gold}
        strokeWidth={1}
        strokeOpacity={0.5}
      />
      <polygon
        points={hexagonPoints(CORE_POSITION.x, CORE_POSITION.y, CORE_RADIUS)}
        fill="url(#coreRadial)"
        stroke={SKILL_TREE_VISUAL.edgeActive}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <text
        x={CORE_POSITION.x}
        y={CORE_POSITION.y + 5}
        textAnchor="middle"
        fontSize={10}
        fill={SKILL_TREE_VISUAL.gold}
        fontWeight={700}
        letterSpacing={2}
      >
        KERNEL
      </text>

      {SKILL_TREE_NODES.map((node) => (
        <SkillTreeNode
          key={node.id}
          x={node.position.x}
          y={node.position.y}
          icon={node.icon}
          level={upgrades[node.id]}
          state={getSkillState(node.id, bankShards, upgrades, node.requires)}
          isSelected={selectedId === node.id}
          onSelect={() => onSelectSkill(node.id)}
        />
      ))}

      {selectedId && <SkillTreeTooltip selectedId={selectedId} />}
    </svg>
  );
}
