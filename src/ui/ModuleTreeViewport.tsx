import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { getModuleNode, type TreeNodeId } from '../store/moduleTree';
import { type HexGridHoverInfo } from '../store/moduleTreeHexGrid';
import { type UpgradeId } from '../store/upgradeCatalog';
import { getUpgradeTooltipLines } from './upgradeTooltipStats';
import { ModuleTree } from './ModuleTree';
import { ModuleTreeGlitchOverlay } from './ModuleTreeGlitchOverlay';
import {
  getModuleTreeTooltipHeight,
  MODULE_TREE_TOOLTIP_TITLE_ID,
  ModuleTreeTooltip,
} from './ModuleTreeTooltip';
import { ModuleTreePopover } from './ModuleTreePopover';
import { MODULE_POPOVER_WIDTH } from './moduleTreePopoverPlacement';
import { useModuleTreePan } from './useModuleTreePan';
import { useDevModuleTreeHexGrid } from '../dev/useDevModuleTreeHexGrid';
import { ModuleTreeHexGridTooltip } from './ModuleTreeHexGridTooltip';
import { useDevModuleTreeDraft } from '../dev/moduleTreeEditor/useDevModuleTreeDraft';
import { formatDevModuleTreeEditorHint } from '../dev/moduleTreeEditor/devModuleTreeEditor';
import { useDevModuleTreeEditor } from '../dev/moduleTreeEditor/useDevModuleTreeEditor';
import { useModuleTreeEditorInteractions } from '../dev/moduleTreeEditor/useModuleTreeEditorInteractions';

interface ModuleTreeViewportProps {
  selectedId: TreeNodeId | null;
  onSelectModule: (id: TreeNodeId) => void;
  onClearSelection: () => void;
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
  const upgrades = useGameStore((state) => state.upgrades);
  const showHexGridFlag = useDevModuleTreeHexGrid();
  const editor = useDevModuleTreeEditor();
  const drafts = useDevModuleTreeDraft();
  const editorActions = useModuleTreeEditorInteractions(editor, onClearSelection);
  const showHexGrid = showHexGridFlag;
  const [hexHover, setHexHover] = useState<{
    info: HexGridHoverInfo;
    x: number;
    y: number;
  } | null>(null);
  const hoverFrameRef = useRef<number | null>(null);
  const pendingHoverRef = useRef<{
    info: HexGridHoverInfo | null;
    x: number;
    y: number;
  } | null>(null);
  const { transform, isGrabbing, onPointerDown, onPointerMove, onPointerUp, zoomIn, zoomOut, resetView } =
    useModuleTreePan(viewportRef);

  useEffect(() => {
    if (!selectedId) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClearSelection();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClearSelection, selectedId]);

  useEffect(() => {
    return () => {
      if (hoverFrameRef.current !== null) {
        cancelAnimationFrame(hoverFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (editor.enabled) return;
    setHexHover(null);
  }, [editor.enabled]);

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

  const popoverConfig = (() => {
    if (!selectedId) return null;

    const node = getModuleNode(selectedId);
    const statLines = getUpgradeTooltipLines(selectedId, upgrades);
    return {
      canvasX: node.position.x,
      canvasY: node.position.y,
      nodeId: selectedId,
      width: MODULE_POPOVER_WIDTH,
      height: getModuleTreeTooltipHeight(statLines.length),
      titleId: MODULE_TREE_TOOLTIP_TITLE_ID,
      upgradeId: selectedId,
    };
  })();

  return (
    <>
      <div
        ref={viewportRef}
        data-tutorial-anchor="module-tree"
        className={`absolute inset-0 overflow-hidden ${isGrabbing ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={(event) => {
          if (
            (event.target as Element).closest(
              '[data-module-hex-grid], [data-module-node], [data-module-draft-delete], [data-module-tooltip], button',
            )
          ) {
            return;
          }
          onClearSelection();
          onPointerDown(event);
        }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
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
            showHexGrid={showHexGrid}
            editorMode={editor.enabled}
            selectedParentId={editor.selectedParentId}
            draftEntries={import.meta.env.DEV ? drafts : []}
            onHexGridHover={scheduleHexHover}
            onHexCellClick={editorActions.cellClick}
            editorPickParentMode={editorActions.isPickParentMode}
            onEditorPickParent={editorActions.isEditorActive ? editorActions.pickParent : undefined}
            onEditorLinkParent={
              editorActions.isEditorActive && !editorActions.isPickParentMode
                ? editorActions.linkParent
                : undefined
            }
            onEditorDeleteDraft={editorActions.isEditorActive ? editorActions.deleteDraft : undefined}
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

      {showHexGrid && hexHover && (
        <ModuleTreeHexGridTooltip
          info={hexHover.info}
          x={hexHover.x}
          y={hexHover.y}
          editorMode={editor.enabled}
        />
      )}

      {editor.enabled && (
        <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center px-4">
          <p className="rounded-lg border border-cyan-500/30 bg-black/75 px-3 py-1.5 font-mono text-[12px] text-cyan-100/90">
            {formatDevModuleTreeEditorHint(editor, 'banner')}
          </p>
        </div>
      )}
    </>
  );
}
