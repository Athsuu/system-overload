import { createPortal } from 'react-dom';
import { getPlanModuleTooltipContent } from './planModuleTooltipContent';
import { MODULE_TREE_VISUAL } from './moduleTreeTheme';

const BRANCH_CHIP_CLASS = {
  degats: 'border-red-500/40 bg-red-950/40 text-red-200',
  thermique: 'border-orange-500/40 bg-orange-950/40 text-orange-200',
} as const;

interface ModuleTreePlanHoverTooltipProps {
  moduleId: string;
  x: number;
  y: number;
}

/** Tooltip description plan global — même source texte que ModuleTreeTooltip, position curseur comme la grille hex. */
export function ModuleTreePlanHoverTooltip({ moduleId, x, y }: ModuleTreePlanHoverTooltipProps) {
  const content = getPlanModuleTooltipContent(moduleId);
  if (!content) return null;

  return createPortal(
    <div
      data-module-plan-hover-tooltip
      className="pointer-events-none fixed z-[70] w-[min(300px,calc(100vw-2rem))] rounded border px-3 py-2.5 shadow-[0_0_24px_rgba(56,189,248,0.12)]"
      style={{
        left: x + 14,
        top: y + 14,
        backgroundColor: MODULE_TREE_VISUAL.tooltipBg,
        borderColor: 'rgba(56, 189, 248, 0.45)',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-semibold tracking-[0.16em] uppercase" style={{ color: MODULE_TREE_VISUAL.gold }}>
          {content.title}
        </p>
        <span
          className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${BRANCH_CHIP_CLASS[content.branch]}`}
        >
          {content.branchLabel}
        </span>
      </div>
      <p className="mt-1.5 text-[14px] leading-relaxed text-white/50">{content.description}</p>
    </div>,
    document.body,
  );
}
