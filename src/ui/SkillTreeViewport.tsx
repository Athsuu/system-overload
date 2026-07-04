import { useEffect, useRef, useState } from 'react';
import type { UpgradeId } from '../store/upgradeCatalog';
import { HexGridBackdrop } from './HexGridBackdrop';
import { SkillTree } from './SkillTree';
import { useSkillTreePan } from './useSkillTreePan';

interface SkillTreeViewportProps {
  selectedId: UpgradeId | null;
  onSelectSkill: (id: UpgradeId) => void;
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
  const { transform, onPointerDown, onPointerMove, onPointerUp, zoomIn, zoomOut, resetView } =
    useSkillTreePan(viewportRef);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateSize = () => {
      setViewportSize({
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        ref={viewportRef}
        className={`absolute inset-0 overflow-hidden bg-[#0a0a0f] ${isGrabbing ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={(event) => {
          setIsGrabbing(true);
          onClearSelection();
          onPointerDown(event);
        }}
        onPointerMove={onPointerMove}
        onPointerUp={(event) => {
          setIsGrabbing(false);
          onPointerUp(event);
        }}
        onPointerLeave={(event) => {
          setIsGrabbing(false);
          onPointerUp(event);
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          {viewportSize.width > 0 && (
            <HexGridBackdrop
              patternId="skillTreeHexGrid"
              width={viewportSize.width}
              height={viewportSize.height}
            />
          )}
        </div>

        <div
          className="absolute left-0 top-0 origin-top-left will-change-transform"
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
