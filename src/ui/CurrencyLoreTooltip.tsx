import { useEffect, useRef, type ReactNode } from 'react';
import { DARK_HEX } from '../theme/darkHexTerminal';
import { playOneShotAnimation } from './animations';
import { MODULE_TREE_VISUAL } from './moduleTreeTheme';

export const CURRENCY_LORE_TOOLTIP_WIDTH = 350;
export const CURRENCY_LORE_TOOLTIP_HEIGHT = 130;

interface CurrencyLoreTooltipProps {
  title: string;
  lore: string;
  isAnchor: boolean;
  titleId: string;
  icon: ReactNode;
}

export function CurrencyLoreTooltip({
  title,
  lore,
  isAnchor,
  titleId,
  icon,
}: CurrencyLoreTooltipProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const borderColor = isAnchor ? DARK_HEX.breachGlow : MODULE_TREE_VISUAL.tooltipBorder;
  const accentColor = isAnchor ? DARK_HEX.breachGlow : MODULE_TREE_VISUAL.gold;
  const iconBorder = isAnchor ? DARK_HEX.breachGlow : MODULE_TREE_VISUAL.goldMuted;

  useEffect(() => {
    playOneShotAnimation(panelRef.current, 'so-animate-slide-up');
  }, [title, lore]);

  return (
    <div
      ref={panelRef}
      className="rounded border px-5 py-[15px] shadow-[0_0_40px_rgba(255,77,0,0.15)]"
      style={{
        backgroundColor: MODULE_TREE_VISUAL.tooltipBg,
        borderColor,
      }}
    >
      <div className="flex items-center gap-[15px]">
        <div
          className="flex h-[45px] w-[45px] shrink-0 items-center justify-center rounded border"
          style={{
            borderColor: iconBorder,
            backgroundColor: '#2a0808',
          }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p
            id={titleId}
            className="text-[17px] font-semibold tracking-[0.2em] uppercase"
            style={{ color: accentColor }}
          >
            {title}
          </p>
        </div>
      </div>
      <p className="mt-2.5 text-[18px] leading-relaxed text-white/45">{lore}</p>
    </div>
  );
}
