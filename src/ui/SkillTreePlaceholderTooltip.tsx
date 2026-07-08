import { useGameStrings } from '../i18n/useGameStrings';
import { getPlaceholderNode } from '../store/skillTree';
import { SKILL_TREE_VISUAL } from './skillTreeTheme';

interface SkillTreePlaceholderTooltipProps {
  placeholderId: string;
}

export const PLACEHOLDER_TOOLTIP_TITLE_ID = 'skill-tree-placeholder-title';

export function SkillTreePlaceholderTooltip({ placeholderId }: SkillTreePlaceholderTooltipProps) {
  const strings = useGameStrings();
  const node = getPlaceholderNode(placeholderId);

  return (
    <div
      data-skill-tooltip
      className="pointer-events-auto rounded border px-4 py-3"
      style={{
        backgroundColor: SKILL_TREE_VISUAL.tooltipBg,
        borderColor: '#4a4a55',
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <p
        id={PLACEHOLDER_TOOLTIP_TITLE_ID}
        className="text-[10px] font-semibold tracking-[0.2em] text-white/40 uppercase"
      >
        {strings.skillTree.placeholderTitle}
      </p>
      <p className="mt-2 font-mono text-xs text-white/55">{node.id}</p>
      <p className="mt-2 text-[11px] leading-relaxed text-white/35">
        {strings.skillTree.placeholderBody}
      </p>
    </div>
  );
}
