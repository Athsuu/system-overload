import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { type TreeNodeId } from '../../store/moduleTree';
import { type HexGridHoverInfo } from '../../store/moduleTreeHexGrid';
import { type UpgradeId } from '../../store/upgradeCatalog';
import { ModuleTree } from './ModuleTree';
import { ModuleTreeGlitchOverlay } from './ModuleTreeGlitchOverlay';
import { ModuleTreeTooltip } from './ModuleTreeTooltip';
import { ModuleTreePopover } from './ModuleTreePopover';
import { useModuleTreePan } from './useModuleTreePan';
import { useDevModuleTreeHexGrid } from '../../dev/useDevModuleTreeHexGrid';
import { ModuleTreeHexGridTooltip } from './ModuleTreeHexGridTooltip';
import { ModuleTreePlanHoverTooltip } from './ModuleTreePlanHoverTooltip';
import { resolveModuleTreePopoverConfig } from './resolveModuleTreePopoverConfig';
import { useDevModuleTreeDraft } from '../../dev/moduleTreeEditor/useDevModuleTreeDraft';
import { useDevModuleTreeGlobalDraft } from '../../dev/moduleTreeEditor/useDevModuleTreeGlobalDraft';
import { formatDevModuleTreeEditorHint } from '../../dev/moduleTreeEditor/devModuleTreeEditor';
import { useDevModuleTreeEditor } from '../../dev/moduleTreeEditor/useDevModuleTreeEditor';
import { useModuleTreeEditorInteractions } from '../../dev/moduleTreeEditor/useModuleTreeEditorInteractions';
import { getDraftPosition, getParentAxial } from '../../dev/moduleTreeEditor/devModuleTreeDraft';
import { getGlobalDraftPosition, getGlobalParentAxial } from '../../dev/moduleTreeEditor/devModuleTreeGlobalDraft';
import { useModuleTreeEditorPointer } from '../../dev/moduleTreeEditor/useModuleTreeEditorPointer';

interface ModuleTreeViewportProps {
  selectedId: TreeNodeId | null;
  onSelectModule: (id: TreeNodeId) => void;
  onClearSelection: () => void;
}

interface PlanModuleHoverState {
  id: string;
  x: number;
  y: number;
}

function ZoomButton({
  label,
  onClick,
  title,
}: {
  label: string;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center border border-[#5c1515] bg-[#111] text-base font-medium text-white/70 transition hover:border-[#ff5533] hover:text-white"
    >
      {label}
    </button>
  );
}

export function ModuleTreeViewport({
  selectedId,
  onSelectModule,
  onClearSelection,
}: ModuleTreeViewportProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const onClearSelectionRef = useRef(onClearSelection);
  onClearSelectionRef.current = onClearSelection;
  const wasGlobalPlanRef = useRef(false);

  const upgrades = useGameStore((state) => state.upgrades);
  const showHexGridFlag = useDevModuleTreeHexGrid();
  const editor = useDevModuleTreeEditor();
  const localDrafts = useDevModuleTreeDraft();
  const globalDrafts = useDevModuleTreeGlobalDraft();
  const editorActions = useModuleTreeEditorInteractions(editor, onClearSelection);
  const editorTreeMode = editor.enabled ? editor.mode : 'off';
  const isGlobalPlan = editor.enabled && editor.mode === 'global';
  const isMoveTool = editor.enabled && editor.editorTool === 'move';
  const isPlaceTool = editor.enabled && editor.editorTool === 'place';
  const resolvePlanPosition = isGlobalPlan ? getGlobalDraftPosition : getDraftPosition;
  const resolveParentAxial = isGlobalPlan ? getGlobalParentAxial : getParentAxial;

  const [hexHover, setHexHover] = useState<{
    info: HexGridHoverInfo;
    x: number;
    y: number;
  } | null>(null);
  const [planHover, setPlanHover] = useState<PlanModuleHoverState | null>(null);
  const hoverFrameRef = useRef<number | null>(null);
  const pendingHoverRef = useRef<{
    info: HexGridHoverInfo | null;
    x: number;
    y: number;
  } | null>(null);
  const planHoverFrameRef = useRef<number | null>(null);
  const pendingPlanHoverRef = useRef<PlanModuleHoverState | null>(null);
  const panBlockedRef = useRef(false);

  const { transform, isGrabbing, onPointerDown, zoomIn, zoomOut, resetView } =
    useModuleTreePan(viewportRef, panBlockedRef);
  const drag = useModuleTreeEditorPointer(isMoveTool, editor.mode, viewportRef, transform);
  panBlockedRef.current = drag.isPanBlocked;

  const scheduleHexHover = (info: HexGridHoverInfo | null, clientX: number, clientY: number) => {
    pendingHoverRef.current = { info, x: clientX, y: clientY };
    if (hoverFrameRef.current !== null) return;
    hoverFrameRef.current = requestAnimationFrame(() => {
      hoverFrameRef.current = null;
      const pending = pendingHoverRef.current;
      if (!pending) return;
      setHexHover(pending.info ? { info: pending.info, x: pending.x, y: pending.y } : null);
    });
  };

  const schedulePlanModuleHover = (moduleId: string | null, clientX: number, clientY: number) => {
    pendingPlanHoverRef.current = moduleId ? { id: moduleId, x: clientX, y: clientY } : null;
    if (planHoverFrameRef.current !== null) return;
    planHoverFrameRef.current = requestAnimationFrame(() => {
      planHoverFrameRef.current = null;
      setPlanHover(pendingPlanHoverRef.current);
    });
  };

  const clearPlanModuleHover = () => {
    pendingPlanHoverRef.current = null;
    if (planHoverFrameRef.current !== null) return;
    planHoverFrameRef.current = requestAnimationFrame(() => {
      planHoverFrameRef.current = null;
      setPlanHover(null);
    });
  };

  useEffect(() => {
    if (!selectedId) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClearSelectionRef.current();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId]);

  useEffect(() => {
    return () => {
      if (hoverFrameRef.current !== null) {
        cancelAnimationFrame(hoverFrameRef.current);
      }
      if (planHoverFrameRef.current !== null) {
        cancelAnimationFrame(planHoverFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (editor.enabled) return;
    setHexHover(null);
    setPlanHover(null);
  }, [editor.enabled]);

  useEffect(() => {
    if (wasGlobalPlanRef.current && !isGlobalPlan) {
      onClearSelectionRef.current();
    }
    wasGlobalPlanRef.current = isGlobalPlan;
  }, [isGlobalPlan]);

  useEffect(() => {
    if (isGlobalPlan) return;
    clearPlanModuleHover();
  }, [isGlobalPlan]);

  useEffect(() => {
    if (!drag.isPanBlocked) return;
    clearPlanModuleHover();
  }, [drag.isPanBlocked]);

  const popoverConfig = isGlobalPlan ? null : resolveModuleTreePopoverConfig(selectedId, upgrades);

  return (
    <>
      <div
        ref={viewportRef}
        data-tutorial-anchor="module-tree"
        className={`absolute inset-0 overflow-hidden ${
          drag.isDragging
            ? 'cursor-grabbing'
            : isGrabbing
              ? 'cursor-grabbing'
              : 'cursor-grab'
        }`}
        onPointerDown={(event) => {
          if (drag.isPanBlocked) return;
          if (
            (event.target as Element).closest(
              '[data-module-hex-grid], [data-module-node], [data-module-draft-delete], [data-module-tooltip], button',
            )
          ) {
            return;
          }
          if (drag.isDragging) return;
          onClearSelection();
          onPointerDown(event);
        }}
      >
        <ModuleTreeGlitchOverlay />
        <div
          className="so-module-tree-canvas absolute left-0 top-0 origin-top-left will-change-transform"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          }}
        >
          <ModuleTree
            selectedId={selectedId}
            onSelectModule={onSelectModule}
            onClearSelection={onClearSelection}
            showHexGrid={showHexGridFlag}
            editorMode={editor.enabled}
            editorTreeMode={editorTreeMode}
            selectedParentId={editor.selectedParentId}
            draftEntries={import.meta.env.DEV && editor.enabled ? localDrafts : []}
            globalPlanEntries={import.meta.env.DEV && isGlobalPlan ? globalDrafts : []}
            resolvePlanPosition={editor.enabled ? resolvePlanPosition : undefined}
            resolveParentAxial={showHexGridFlag ? resolveParentAxial : undefined}
            onHexGridHover={scheduleHexHover}
            onHexCellClick={isPlaceTool ? editorActions.cellClick : undefined}
            editorPickParentMode={isPlaceTool && editorActions.isPickParentMode}
            onEditorPickParent={isPlaceTool ? editorActions.pickParent : undefined}
            onEditorLinkParent={isPlaceTool && editorActions.isLinkParentMode ? editorActions.linkParent : undefined}
            onEditorDeleteDraft={editorActions.isEditorActive ? editorActions.deleteDraft : undefined}
            onDragPointerDown={isMoveTool ? drag.startDrag : undefined}
            dragState={isMoveTool ? { draggingId: drag.draggingId, hover: drag.dragHover } : undefined}
            planModuleHoverEnabled={isGlobalPlan}
            onPlanModuleHover={(moduleId, clientX, clientY) => {
              scheduleHexHover(null, clientX, clientY);
              schedulePlanModuleHover(moduleId, clientX, clientY);
            }}
            onPlanModuleHoverMove={(moduleId, clientX, clientY) => {
              schedulePlanModuleHover(moduleId, clientX, clientY);
            }}
            onPlanModuleHoverEnd={clearPlanModuleHover}
          />
        </div>

        {popoverConfig && (
          <ModuleTreePopover
            viewportRef={viewportRef}
            transform={transform}
            canvasX={popoverConfig.canvasX}
            canvasY={popoverConfig.canvasY}
            nodeId={popoverConfig.nodeId}
            popoverWidth={popoverConfig.width}
            popoverHeight={popoverConfig.height}
            titleId={popoverConfig.titleId}
            onDismiss={onClearSelection}
          >
            <ModuleTreeTooltip selectedId={popoverConfig.upgradeId as UpgradeId} />
          </ModuleTreePopover>
        )}
      </div>

      <div className="pointer-events-auto absolute bottom-8 left-8 z-20 flex items-center gap-2">
        <ZoomButton label="−" onClick={zoomOut} title="Zoom out" />
        <button
          type="button"
          title="Reset view"
          onClick={resetView}
          className="border border-[#5c1515] bg-[#111] px-3 py-2 text-[14px] font-semibold tracking-wider text-white/55 uppercase transition hover:border-[#ff5533] hover:text-white"
        >
          {Math.round(transform.scale * 100)}%
        </button>
        <ZoomButton label="+" onClick={zoomIn} title="Zoom in" />
      </div>

      {showHexGridFlag && hexHover && !planHover && (
        <ModuleTreeHexGridTooltip
          info={hexHover.info}
          x={hexHover.x}
          y={hexHover.y}
          editorMode={editor.enabled}
        />
      )}

      {isGlobalPlan && planHover && (
        <ModuleTreePlanHoverTooltip moduleId={planHover.id} x={planHover.x} y={planHover.y} />
      )}

      {editor.enabled && (
        <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center px-4">
          <p
            className={`rounded-lg border px-3 py-1.5 font-mono text-[12px] ${
              isGlobalPlan
                ? 'border-cyan-400/40 bg-cyan-950/80 text-cyan-100'
                : 'border-cyan-500/30 bg-black/75 text-cyan-100/90'
            }`}
          >
            {formatDevModuleTreeEditorHint(editor, 'banner')}
          </p>
        </div>
      )}
    </>
  );
}
