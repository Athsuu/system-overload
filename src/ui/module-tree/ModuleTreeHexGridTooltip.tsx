import type { HexGridHoverInfo } from '../../store/moduleTreeHexGrid';

interface ModuleTreeHexGridTooltipProps {
  info: HexGridHoverInfo;
  x: number;
  y: number;
  editorMode?: boolean;
}

export function ModuleTreeHexGridTooltip({
  info,
  x,
  y,
  editorMode = false,
}: ModuleTreeHexGridTooltipProps) {
  return (
    <div
      className="pointer-events-none fixed z-[60] max-w-xs rounded-lg border border-cyan-500/35 bg-black/90 px-3 py-2 font-mono text-[15px] leading-relaxed text-cyan-100 shadow-lg"
      style={{ left: x + 14, top: y + 14 }}
    >
      <p className="text-[14px] font-bold tracking-wider text-cyan-300 uppercase">Grille hex (dev)</p>
      <p className="mt-1 text-white/90">{info.coordLabel}</p>
      <p className="text-white/70">{info.pathFromNode0}</p>
      {editorMode && info.pathFromSelectedParent && (
        <p className="text-amber-200/90">{info.pathFromSelectedParent}</p>
      )}
      {!editorMode && info.pathFromNearestModule && (
        <p className="text-white/55">{info.pathFromNearestModule}</p>
      )}
      {info.occupantId && (
        <p className="mt-1 text-amber-300">module: {info.occupantId}</p>
      )}
      {info.draftOccupantId && (
        <p className="mt-1 text-violet-300">brouillon: {info.draftOccupantId}</p>
      )}
      {editorMode && info.isOccupied && !info.draftOccupantId && !info.occupantId && info.isOrigin && (
        <p className="mt-1 text-red-300/90">Node-0 (interdit)</p>
      )}
      {editorMode && info.isOccupied && (info.draftOccupantId || info.occupantId) && (
        <p className="mt-1 text-red-300/90">cellule occupée</p>
      )}
    </div>
  );
}
