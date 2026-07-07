import { getPlaceholderNode, type PlaceholderId } from '../store/skillTree';
import { NODE_RADIUS } from '../store/skillTree';
import { useGameStrings } from '../i18n/useGameStrings';
import { SKILL_TREE_VISUAL } from './skillTreeTheme';

const TOOLTIP_WIDTH = 280;

interface SkillTreePlaceholderTooltipProps {
  placeholderId: PlaceholderId;
}

export function SkillTreePlaceholderTooltip({ placeholderId }: SkillTreePlaceholderTooltipProps) {
  const strings = useGameStrings();
  const node = getPlaceholderNode(placeholderId);
  const { x, y } = node.position;

  return (
    <foreignObject
      x={x - TOOLTIP_WIDTH / 2}
      y={y - NODE_RADIUS - 120}
      width={TOOLTIP_WIDTH}
      height={110}
      style={{ overflow: 'visible' }}
    >
      <div
        data-skill-tooltip
        className="pointer-events-auto rounded border px-4 py-3"
        style={{
          backgroundColor: SKILL_TREE_VISUAL.tooltipBg,
          borderColor: '#4a4a55',
        }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <p className="text-[10px] font-semibold tracking-[0.2em] text-white/40 uppercase">
          {strings.skillTree.placeholderTitle}
        </p>
        <p className="mt-2 font-mono text-xs text-white/55">{placeholderId}</p>
        <p className="mt-2 text-[11px] leading-relaxed text-white/35">
          {strings.skillTree.placeholderBody}
        </p>
      </div>
    </foreignObject>
  );
}
