import { useGameStore } from '../../store/useGameStore';
import { getModuleState, getUpgradeDefinition, type UpgradeId } from '../../store/upgradeCatalog';
import {
  NODE0_HUB_POSITION,
  NODE_RADIUS,
  getNodePosition,
  getRevealedGraphNodes,
  getModuleGlyphId,
  getUpgradeBranch,
  type TreeNodeId,
  TREE_CANVAS,
} from '../../store/moduleTree';
import { axialToPixel } from '../../store/moduleTreeHexGrid';
import type { DevModuleTreeDraftEntry, DraftParentId } from '../../dev/moduleTreeEditor/devModuleTreeDraft';
import { getDraftPosition, resolveEdgeParentKey } from '../../dev/moduleTreeEditor/devModuleTreeDraft';
import {
  getHexagonEdgePoint,
  getNodeHexRadius,
  getNodeHexStartAngle,
} from './moduleTreeGeometry';
import { ModuleTreeNode } from './ModuleTreeNode';
import { ModuleTreeDraftNode } from './ModuleTreeDraftNode';
import { ModuleTreeHexGridOverlay } from './ModuleTreeHexGridOverlay';
import { getEdgeVisual } from './moduleTreeTheme';
import type { HexGridHoverInfo } from '../../store/moduleTreeHexGrid';

interface ModuleTreeProps {
  selectedId: TreeNodeId | null;
  onSelectModule: (id: TreeNodeId) => void;
  onClearSelection: () => void;
  showHexGrid?: boolean;
  editorMode?: boolean;
  selectedParentId?: DraftParentId | null;
  draftEntries?: readonly DevModuleTreeDraftEntry[];
  onHexGridHover?: (info: HexGridHoverInfo | null, clientX: number, clientY: number) => void;
  onHexCellClick?: (q: number, r: number) => void;
  onEditorPickParent?: (parentId: DraftParentId) => void;
  onEditorLinkParent?: (draftId: string) => void;
  onEditorDeleteDraft?: (draftId: string) => void;
  editorPickParentMode?: boolean;
}

function renderEdge(
  key: string,
  from: { x: number; y: number },
  to: { x: number; y: number },
  fromKey: TreeNodeId | 'core' | string,
  toKey: TreeNodeId | string,
  toRadius: number,
) {
  const fromRadius =
    fromKey === 'core'
      ? getNodeHexRadius('node0Boot')
      : typeof fromKey === 'string' && fromKey.startsWith('placeholder_')
        ? NODE_RADIUS
        : getNodeHexRadius(fromKey as TreeNodeId);
  const fromAngleKey =
    fromKey === 'core'
      ? 'node0Boot'
      : typeof fromKey === 'string' && fromKey.startsWith('placeholder_')
        ? 'purgeStrike'
        : (fromKey as TreeNodeId);
  const toAngleKey = typeof toKey === 'string' && toKey.startsWith('placeholder_') ? 'purgeStrike' : (toKey as TreeNodeId);

  const p1 = getHexagonEdgePoint(
    from.x,
    from.y,
    fromRadius,
    to.x,
    to.y,
    getNodeHexStartAngle(fromAngleKey),
  );
  const p2 = getHexagonEdgePoint(
    to.x,
    to.y,
    toRadius,
    from.x,
    from.y,
    getNodeHexStartAngle(toAngleKey),
  );
  const edge = getEdgeVisual(true);

  return (
    <g key={key}>
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
}

export function ModuleTree({
  selectedId,
  onSelectModule,
  onClearSelection,
  showHexGrid = false,
  editorMode = false,
  selectedParentId = null,
  draftEntries = [],
  onHexGridHover,
  onHexCellClick,
  onEditorPickParent,
  onEditorLinkParent,
  onEditorDeleteDraft,
  editorPickParentMode = false,
}: ModuleTreeProps) {
  const bankShards = useGameStore((state) => state.bankShards);
  const bankAnchorFragments = useGameStore((state) => state.bankAnchorFragments);
  const upgrades = useGameStore((state) => state.upgrades);

  const revealedNodes = getRevealedGraphNodes(upgrades);
  const upgradeNodes = revealedNodes.filter((node) => node.kind === 'upgrade');

  return (
    <svg
      width={TREE_CANVAS.width}
      height={TREE_CANVAS.height}
      viewBox={`0 0 ${TREE_CANVAS.width} ${TREE_CANVAS.height}`}
      className="block select-none overflow-visible"
      onPointerDown={(event) => {
        const target = event.target as Element;
        if (
          target.closest('[data-module-node]') ||
          target.closest('[data-module-tooltip]') ||
          target.closest('[data-module-hex-grid]')
        ) {
          return;
        }
        onClearSelection();
      }}
    >
      <defs>
        <radialGradient id="ambientHub" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c5a059" stopOpacity={0.08} />
          <stop offset="55%" stopColor="#ff4d00" stopOpacity={0.04} />
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
        fill="url(#ambientHub)"
      />

      {showHexGrid && onHexGridHover && (
        <ModuleTreeHexGridOverlay
          editorMode={editorMode}
          selectedParentId={selectedParentId}
          editorLinkMode={editorMode && !editorPickParentMode && Boolean(selectedParentId)}
          drafts={draftEntries}
          onHoverChange={onHexGridHover}
          onCellClick={onHexCellClick}
        />
      )}

      {revealedNodes.map((node) => {
        if (node.parentId === 'root') return null;
        const parentKey = resolveEdgeParentKey(node.parentId) as TreeNodeId | 'core';
        const from = getNodePosition(parentKey);
        const to = node.position;
        return renderEdge(
          `edge-${node.id}`,
          from,
          to,
          parentKey,
          node.id,
          getNodeHexRadius(node.id),
        );
      })}

      {draftEntries.flatMap((entry) =>
        entry.parentIds.map((parentId, parentIndex) => {
          const from = getDraftPosition(parentId);
          const to = axialToPixel(entry.q, entry.r);
          return renderEdge(
            `draft-edge-${entry.id}-${parentIndex}`,
            from,
            to,
            resolveEdgeParentKey(parentId),
            entry.id,
            NODE_RADIUS,
          );
        }),
      )}

      {upgradeNodes.map((node) => {
        const upgradeId = node.id as UpgradeId;
        const branch = getUpgradeBranch(upgradeId);
        return (
          <ModuleTreeNode
            key={node.id}
            id={upgradeId}
            x={node.position.x}
            y={node.position.y}
            glyph={getModuleGlyphId(upgradeId, branch)}
            level={upgrades[upgradeId]}
            isRoot={upgradeId === 'node0Boot'}
            state={getModuleState(
              upgradeId,
              bankShards,
              bankAnchorFragments,
              upgrades,
              node.requires,
            )}
            isSelected={selectedId === node.id}
            isUncapped={!Number.isFinite(getUpgradeDefinition(upgradeId).maxLevel)}
            isEditorParent={editorMode && selectedParentId === upgradeId}
            onEditorPickParent={editorPickParentMode ? onEditorPickParent : undefined}
            onSelect={() => onSelectModule(node.id)}
          />
        );
      })}

      {draftEntries.map((entry) => {
        const position = axialToPixel(entry.q, entry.r);
        return (
          <ModuleTreeDraftNode
            key={entry.id}
            id={entry.id}
            x={position.x}
            y={position.y}
            isSelected={false}
            isEditorParent={editorMode && selectedParentId === entry.id}
            onEditorPickParent={editorPickParentMode ? onEditorPickParent : undefined}
            onEditorLinkParent={!editorPickParentMode ? onEditorLinkParent : undefined}
            onDelete={editorMode ? onEditorDeleteDraft : undefined}
          />
        );
      })}
    </svg>
  );
}
