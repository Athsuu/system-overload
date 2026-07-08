import type { HexGridHoverInfo } from '../store/skillTreeHexGrid';

interface SkillTreeHexGridTooltipProps {
  info: HexGridHoverInfo;
  x: number;
  y: number;
}

export function SkillTreeHexGridTooltip({ info, x, y }: SkillTreeHexGridTooltipProps) {
  return (
    <div
      className="pointer-events-none fixed z-[60] max-w-xs rounded-lg border border-cyan-500/35 bg-black/90 px-3 py-2 font-mono text-[11px] leading-relaxed text-cyan-100 shadow-lg"
      style={{ left: x + 14, top: y + 14 }}
    >
      <p className="text-[10px] font-bold tracking-wider text-cyan-300 uppercase">Grille hex (dev)</p>
      <p className="mt-1 text-white/90">{info.coordLabel}</p>
      <p className="text-white/70">{info.pathFromNode0}</p>
      {info.pathFromNearestSkill && <p className="text-white/55">{info.pathFromNearestSkill}</p>}
      {info.occupantId && (
        <p className="mt-1 text-amber-300">skill: {info.occupantId}</p>
      )}
    </div>
  );
}
