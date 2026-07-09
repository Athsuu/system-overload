import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import {
  getPlaceholderNode,
  getModuleNode,
  isPlaceholderId,
  type TreeNodeId,
} from '../store/moduleTree';
import { type UpgradeId } from '../store/upgradeCatalog';
import { getUpgradeTooltipLines } from './upgradeTooltipStats';
import { ModuleTree } from './ModuleTree';
import { ModuleTreeGlitchOverlay } from './ModuleTreeGlitchOverlay';
import {
  PLACEHOLDER_TOOLTIP_TITLE_ID,
  ModuleTreePlaceholderTooltip,
} from './ModuleTreePlaceholderTooltip';
import {
  getModuleTreeTooltipHeight,
  MODULE_TREE_TOOLTIP_TITLE_ID,
  ModuleTreeTooltip,
} from './ModuleTreeTooltip';
import { ModuleTreePopover } from './ModuleTreePopover';
import {
  PLACEHOLDER_POPOVER_HEIGHT,
  PLACEHOLDER_POPOVER_WIDTH,
  MODULE_POPOVER_WIDTH,
} from './moduleTreePopoverPlacement';
import { useModuleTreePan } from './useModuleTreePan';
import { useDevModuleTreeHexGrid } from '../dev/useDevModuleTreeHexGrid';
import type { HexGridHoverInfo } from '../store/moduleTreeHexGrid';
import { ModuleTreeHexGridTooltip } from './ModuleTreeHexGridTooltip';

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
  const showHexGrid = useDevModuleTreeHexGrid();
  const [hexHover, setHexHover] = useState<{
    info: HexGridHoverInfo;
    x: number;
    y: number;
  } | null>(null);
  const { transform, isGrabbing, onPointerDown, onPointerMove, onPointerUp, zoomIn, zoomOut, resetView } =
    useModuleTreePan(viewportRef);

  useEffect(() => {
    if (!selectedId) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      onClearSelection();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClearSelection, selectedId]);

  useEffect(() => {
    if (showHexGrid) return;
    setHexHover(null);
  }, [showHexGrid]);

  const popoverConfig = (() => {
    if (!selectedId) return null;

    if (isPlaceholderId(selectedId)) {
      const node = getPlaceholderNode(selectedId);
      return {
        canvasX: node.position.x,
        canvasY: node.position.y,
        nodeId: selectedId,
        width: PLACEHOLDER_POPOVER_WIDTH,
        height: PLACEHOLDER_POPOVER_HEIGHT,
        titleId: PLACEHOLDER_TOOLTIP_TITLE_ID,
        kind: 'placeholder' as const,
      };
    }

    const node = getModuleNode(selectedId);
    const statLines = getUpgradeTooltipLines(selectedId, upgrades);
    return {
      canvasX: node.position.x,
      canvasY: node.position.y,
      nodeId: selectedId,
      width: MODULE_POPOVER_WIDTH,
      height: getModuleTreeTooltipHeight(statLines.length),
      titleId: MODULE_TREE_TOOLTIP_TITLE_ID,
      kind: 'upgrade' as const,
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
          if ((event.target as Element).closest('[data-module-node], [data-module-tooltip], button')) {
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
            onHexGridHover={(info, clientX, clientY) => {
              setHexHover(info ? { info, x: clientX, y: clientY } : null);
            }}
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
            {popoverConfig.kind === 'placeholder' ? (
              <ModuleTreePlaceholderTooltip placeholderId={popoverConfig.nodeId} />
            ) : (
              <ModuleTreeTooltip selectedId={popoverConfig.upgradeId as UpgradeId} />
            )}
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
        <ModuleTreeHexGridTooltip info={hexHover.info} x={hexHover.x} y={hexHover.y} />
      )}
    </>
  );
}
