import { useGameStore } from '../../store/useGameStore';
import { getModuleState, getUpgradeDefinition, type UpgradeId } from '../../store/upgradeCatalog';
import {
  MODULE_TREE_GRAPH,
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
import {
  resolveEdgeParentKey,
  type DevModuleTreeDraftEntry,
  type DraftParentId,
} from '../../dev/moduleTreeEditor/devModuleTreeDraft';
import type { DevModuleTreeGlobalEntry } from '../../dev/moduleTreeEditor/devModuleTreeGlobalDraft';
import type {
  DevModuleTreeEditorMode,
  ModuleTreeEditorDragState,
  ResolveParentAxial,
  ResolvePlanPosition,
} from '../../dev/moduleTreeEditor/types';
import {
  getRevealedPlaceholders,
  isProductionPlaceholderId,
} from '../../store/moduleTreePlaceholders';
import {
  getHexagonEdgePoint,
  getNodeHexRadius,
  getNodeHexStartAngle,
} from './moduleTreeGeometry';
import { ModuleTreeNode } from './ModuleTreeNode';
import { ModuleTreeDraftNode } from './ModuleTreeDraftNode';
import { ModuleTreeHexGridOverlay } from './ModuleTreeHexGridOverlay';
import { getEdgeVisual } from './moduleTreeTheme';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useMemo } from 'react';
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
  editorTreeMode?: DevModuleTreeEditorMode | 'off';
  globalPlanEntries?: readonly DevModuleTreeGlobalEntry[];
  resolvePlanPosition?: ResolvePlanPosition;
  resolveParentAxial?: ResolveParentAxial;
  onDragPointerDown?: (id: string, event: ReactPointerEvent) => void;
  dragState?: ModuleTreeEditorDragState;
  planModuleHoverEnabled?: boolean;
  onPlanModuleHover?: (moduleId: string, clientX: number, clientY: number) => void;
  onPlanModuleHoverMove?: (moduleId: string, clientX: number, clientY: number) => void;
  onPlanModuleHoverEnd?: () => void;
}

/** Skip requirement edges that are only deep unlock gates (already on the primary chain). */
function isPrimaryAncestor(ancestorId: UpgradeId, fromId: UpgradeId): boolean {
  let current = MODULE_TREE_GRAPH.find((entry) => entry.id === fromId);
  while (current && current.parentId !== 'root') {
    if (current.parentId === ancestorId) return true;
    current = MODULE_TREE_GRAPH.find((entry) => entry.id === current!.parentId);
  }
  return false;
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
        style={{ pointerEvents: 'none' }}
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
        style={{ pointerEvents: 'none' }}
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
  editorTreeMode = 'off',
  globalPlanEntries = [],
  resolvePlanPosition,
  resolveParentAxial,
  onDragPointerDown,
  dragState,
  planModuleHoverEnabled = false,
  onPlanModuleHover,
  onPlanModuleHoverMove,
  onPlanModuleHoverEnd,
}: ModuleTreeProps) {
  const bankShards = useGameStore((state) => state.bankShards);
  const bankAnchorFragments = useGameStore((state) => state.bankAnchorFragments);
  const upgrades = useGameStore((state) => state.upgrades);

  const isGlobalPlan = editorTreeMode === 'global';
  const revealedNodes = isGlobalPlan ? [] : getRevealedGraphNodes(upgrades);
  const upgradeNodes = revealedNodes.filter((node) => node.kind === 'upgrade');
  const revealedProductionPlaceholders = isGlobalPlan ? [] : getRevealedPlaceholders(upgrades);
  const devOnlyDrafts = draftEntries.filter((entry) => !isProductionPlaceholderId(entry.id));
  const hexGridDrafts = isGlobalPlan
    ? globalPlanEntries
    : [
        ...devOnlyDrafts,
        ...revealedProductionPlaceholders.map((placeholder) => ({
          id: placeholder.id,
          parentIds: [...placeholder.parentIds],
          q: placeholder.q,
          r: placeholder.r,
          branch: placeholder.branch,
        })),
      ];
  const includeProductionModules = !isGlobalPlan;
  const planModuleCellKeys = useMemo(() => {
    if (!isGlobalPlan) return undefined;
    return new Set(
      globalPlanEntries.filter((entry) => entry.kind === 'module').map((entry) => `${entry.q},${entry.r}`),
    );
  }, [globalPlanEntries, isGlobalPlan]);
  const editorDraggable = editorMode && Boolean(onDragPointerDown);
  const draggingId = dragState?.draggingId ?? null;
  const dragHover = dragState?.hover ?? null;

  const dragGhostEntry = (() => {
    if (!draggingId || !dragHover) return null;
    if (isGlobalPlan) {
      const entry = globalPlanEntries.find((item) => item.id === draggingId);
      if (!entry) return null;
      return { id: entry.id, kind: entry.kind as 'placeholder' | 'module', displayMode: 'draft' as const };
    }
    const draft = devOnlyDrafts.find((item) => item.id === draggingId);
    if (draft) return { id: draft.id, kind: 'placeholder' as const, displayMode: 'draft' as const };
    return null;
  })();

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

      {showHexGrid && onHexGridHover && resolveParentAxial && (
        <ModuleTreeHexGridOverlay
          editorMode={editorMode}
          selectedParentId={selectedParentId}
          editorLinkMode={editorMode && !editorPickParentMode && Boolean(selectedParentId)}
          drafts={hexGridDrafts}
          includeProductionModules={includeProductionModules}
          resolveParentAxial={resolveParentAxial}
          dragDropTarget={dragHover}
          passThroughCellKeys={planModuleCellKeys}
          onHoverChange={onHexGridHover}
          onCellClick={onHexCellClick}
        />
      )}

      {!isGlobalPlan &&
        revealedNodes.flatMap((node) => {
          if (node.parentId === 'root') return [];
          const to = node.position;
          const toRadius = getNodeHexRadius(node.id);
          const primaryKey = resolveEdgeParentKey(node.parentId) as TreeNodeId | 'core';
          const edgeKeys = new Set<string>([String(primaryKey)]);
          const edges = [
            renderEdge(
              `edge-${node.id}`,
              getNodePosition(primaryKey),
              to,
              primaryKey,
              node.id,
              toRadius,
            ),
          ];
          for (const requirement of node.requires ?? []) {
            if (edgeKeys.has(requirement.id)) continue;
            if (isPrimaryAncestor(requirement.id, node.id)) continue;
            edgeKeys.add(requirement.id);
            edges.push(
              renderEdge(
                `edge-${node.id}-${requirement.id}`,
                getNodePosition(requirement.id),
                to,
                requirement.id,
                node.id,
                toRadius,
              ),
            );
          }
          return edges;
        })}

      {isGlobalPlan &&
        resolvePlanPosition &&
        globalPlanEntries.flatMap((entry) =>
          entry.parentIds
            .filter((parentId) => !(entry.id === 'node0Boot' && parentId === 'core'))
            .map((parentId, parentIndex) => {
              const from = resolvePlanPosition(parentId);
              const to = axialToPixel(entry.q, entry.r);
              return renderEdge(
                `global-edge-${entry.id}-${parentIndex}`,
                from,
                to,
                resolveEdgeParentKey(parentId),
                entry.id,
                NODE_RADIUS,
              );
            }),
        )}

      {!isGlobalPlan &&
        resolvePlanPosition &&
        draftEntries
          .filter((entry) => !isProductionPlaceholderId(entry.id))
          .flatMap((entry) =>
          entry.parentIds.map((parentId, parentIndex) => {
            const from = resolvePlanPosition(parentId);
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

      {!isGlobalPlan &&
        revealedProductionPlaceholders.flatMap((placeholder) =>
          placeholder.parentIds.map((parentId, parentIndex) => {
            const from = getNodePosition(parentId === 'core' ? 'core' : (parentId as TreeNodeId));
            const to = axialToPixel(placeholder.q, placeholder.r);
            return renderEdge(
              `placeholder-edge-${placeholder.id}-${parentIndex}`,
              from,
              to,
              resolveEdgeParentKey(parentId),
              placeholder.id,
              NODE_RADIUS,
            );
          }),
        )}

      {!isGlobalPlan &&
        upgradeNodes.map((node) => {
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

      {!isGlobalPlan &&
        devOnlyDrafts.map((entry) => {
          const position = axialToPixel(entry.q, entry.r);
          return (
            <ModuleTreeDraftNode
              key={entry.id}
              id={entry.id}
              x={position.x}
              y={position.y}
              kind="placeholder"
              displayMode="draft"
              isSelected={false}
              isEditorParent={editorMode && selectedParentId === entry.id}
              isDragSource={draggingId === entry.id}
              draggable={editorDraggable}
              onEditorPickParent={editorPickParentMode ? onEditorPickParent : undefined}
              onEditorLinkParent={!editorPickParentMode ? onEditorLinkParent : undefined}
              onDelete={editorMode ? onEditorDeleteDraft : undefined}
              onDragPointerDown={onDragPointerDown}
            />
          );
        })}

      {!isGlobalPlan &&
        revealedProductionPlaceholders.map((placeholder) => {
          const position = axialToPixel(placeholder.q, placeholder.r);
          return (
            <ModuleTreeDraftNode
              key={placeholder.id}
              id={placeholder.id}
              x={position.x}
              y={position.y}
              kind="placeholder"
              displayMode="draft"
              isSelected={false}
              isEditorParent={editorMode && selectedParentId === placeholder.id}
              draggable={false}
              onEditorPickParent={editorPickParentMode ? onEditorPickParent : undefined}
              onEditorLinkParent={!editorPickParentMode ? onEditorLinkParent : undefined}
            />
          );
        })}

      {isGlobalPlan &&
        globalPlanEntries.map((entry) => {
          const position = axialToPixel(entry.q, entry.r);
          const canDelete = entry.id !== 'node0Boot' && (entry.kind === 'placeholder' || editorMode);
          const isPlanModule = entry.kind === 'module';
          return (
            <ModuleTreeDraftNode
              key={entry.id}
              id={entry.id}
              x={position.x}
              y={position.y}
              kind={entry.kind}
              isSelected={editorMode && selectedParentId === entry.id}
              isEditorParent={editorMode && selectedParentId === entry.id}
              isDragSource={draggingId === entry.id}
              draggable={editorDraggable && entry.id !== 'node0Boot'}
              onEditorPickParent={editorPickParentMode ? onEditorPickParent : undefined}
              onEditorLinkParent={!editorPickParentMode ? onEditorLinkParent : undefined}
              onDelete={editorMode && canDelete ? onEditorDeleteDraft : undefined}
              onDragPointerDown={onDragPointerDown}
              planModuleHover={planModuleHoverEnabled && isPlanModule}
              onPlanModuleHover={
                planModuleHoverEnabled && isPlanModule
                  ? (clientX, clientY) => onPlanModuleHover?.(entry.id, clientX, clientY)
                  : undefined
              }
              onPlanModuleHoverMove={
                planModuleHoverEnabled && isPlanModule
                  ? (clientX, clientY) => onPlanModuleHoverMove?.(entry.id, clientX, clientY)
                  : undefined
              }
              onPlanModuleHoverEnd={
                planModuleHoverEnabled && isPlanModule ? onPlanModuleHoverEnd : undefined
              }
            />
          );
        })}

      {dragGhostEntry && dragHover && (
        <ModuleTreeDraftNode
          key={`drag-ghost-${dragGhostEntry.id}`}
          id={dragGhostEntry.id}
          x={axialToPixel(dragHover.q, dragHover.r).x}
          y={axialToPixel(dragHover.q, dragHover.r).y}
          kind={dragGhostEntry.kind}
          displayMode={dragGhostEntry.displayMode}
          isSelected={false}
          isDragGhost
          dropValid={dragHover.valid}
        />
      )}
    </svg>
  );
}
