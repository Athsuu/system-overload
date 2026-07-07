import { useRef } from 'react';
import type { TreeNodeId } from '../store/skillTree';
import { SkillTree } from './SkillTree';
import { SkillTreeGlitchOverlay } from './SkillTreeGlitchOverlay';
import { useSkillTreePan } from './useSkillTreePan';

interface SkillTreeViewportProps {
  selectedId: TreeNodeId | null;
  onSelectSkill: (id: TreeNodeId) => void;
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

export function SkillTreeViewport({
  selectedId,
  onSelectSkill,
  onClearSelection,
}: SkillTreeViewportProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const { transform, isGrabbing, onPointerDown, onPointerMove, onPointerUp, zoomIn, zoomOut, resetView } =
    useSkillTreePan(viewportRef);

  return (
    <>
      <div
        ref={viewportRef}
        data-tutorial-anchor="skill-tree"
        className={`absolute inset-0 overflow-hidden ${isGrabbing ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={(event) => {
          if ((event.target as Element).closest('[data-skill-node], [data-skill-tooltip], button')) {
            return;
          }
          onClearSelection();
          onPointerDown(event);
        }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <SkillTreeGlitchOverlay />
        <div
          className="so-skill-tree-canvas absolute left-0 top-0 origin-top-left will-change-transform"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          }}
        >
          <SkillTree
            selectedId={selectedId}
            onSelectSkill={onSelectSkill}
            onClearSelection={onClearSelection}
          />
        </div>
      </div>

      <div className="pointer-events-auto absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        <ZoomButton label="−" onClick={zoomOut} title="Zoom out" />
        <button
          type="button"
          title="Reset view"
          onClick={resetView}
          className="border border-[#5c1515] bg-[#111] px-3 py-2 text-[10px] font-semibold tracking-wider text-white/55 uppercase transition hover:border-[#ff5533] hover:text-white"
        >
          {Math.round(transform.scale * 100)}%
        </button>
        <ZoomButton label="+" onClick={zoomIn} title="Zoom in" />
      </div>
    </>
  );
}
