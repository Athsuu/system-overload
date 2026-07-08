import { DARK_HEX } from '../theme/darkHexTerminal';
import { SKILL_TREE_VISUAL } from './skillTreeTheme';

interface CurrencyIconProps {
  size?: number;
}

/** Stable data fragment — nested hex (Hex Shards lore). */
export function HexShardIcon({ size = 20 }: CurrencyIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
    >
      <polygon
        points="12 2 20 6.5 20 17.5 12 22 4 17.5 4 6.5"
        fill="#120808"
        stroke={SKILL_TREE_VISUAL.gold}
        strokeWidth={1.25}
        strokeOpacity={0.85}
      />
      <polygon
        points="12 7 16 9.5 16 14.5 12 17 8 14.5 8 9.5"
        fill={SKILL_TREE_VISUAL.gold}
        fillOpacity={0.22}
        stroke={SKILL_TREE_VISUAL.gold}
        strokeWidth={0.75}
        strokeOpacity={0.55}
      />
    </svg>
  );
}

/** Breach Anchor anchoring data — hex rupture (Anchor Fragments lore). */
export function AnchorFragmentIcon({ size = 20 }: CurrencyIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
    >
      <polygon
        points="12 2 20 6.5 20 17.5 12 22 4 17.5 4 6.5"
        fill="#120808"
        stroke={DARK_HEX.breachGlow}
        strokeWidth={1.25}
        strokeOpacity={0.85}
      />
      <path
        d="M12 5.5 L12 18.5 M8.5 9 L15.5 15 M15.5 9 L8.5 15"
        stroke={DARK_HEX.breach}
        strokeWidth={1.35}
        strokeLinecap="round"
        strokeOpacity={0.9}
      />
      <circle cx="12" cy="12" r="1.6" fill={DARK_HEX.breachGlow} fillOpacity={0.85} />
    </svg>
  );
}
