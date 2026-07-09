import { useGameStrings } from '../i18n/useGameStrings';
import { getPlaceholderNode } from '../store/moduleTree';
import { MODULE_TREE_VISUAL } from './moduleTreeTheme';

interface ModuleTreePlaceholderTooltipProps {
  placeholderId: string;
}

export const PLACEHOLDER_TOOLTIP_TITLE_ID = 'module-tree-placeholder-title';

export function ModuleTreePlaceholderTooltip({ placeholderId }: ModuleTreePlaceholderTooltipProps) {
  const strings = useGameStrings();
  const node = getPlaceholderNode(placeholderId);

  return (
    <div
      data-module-tooltip
      className="pointer-events-auto rounded border px-4 py-3"
      style={{
        backgroundColor: MODULE_TREE_VISUAL.tooltipBg,
        borderColor: '#4a4a55',
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <p
        id={PLACEHOLDER_TOOLTIP_TITLE_ID}
        className="text-[14px] font-semibold tracking-[0.2em] text-white/40 uppercase"
      >
        {strings.moduleTree.placeholderTitle}
      </p>
      <p className="mt-2 font-mono text-xs text-white/55">{node.id}</p>
      <p className="mt-2 text-[15px] leading-relaxed text-white/35">
        {strings.moduleTree.placeholderBody}
      </p>
    </div>
  );
}
