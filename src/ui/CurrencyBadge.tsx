import { useGameStore } from '../store/useGameStore';
import { GAME_NARRATIVE } from './gameNarrative';
import { hexagonPoints } from './skillTreeGeometry';
import { SKILL_TREE_VISUAL } from './skillTreeTheme';

export function CurrencyBadge() {
  const bankShards = useGameStore((state) => state.bankShards);
  const hexPoints = hexagonPoints(36, 36, 32);

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[10px] font-medium tracking-[0.25em] text-white/40 uppercase">
        {GAME_NARRATIVE.currency.availableShardsLabel}
      </p>
      <div className="relative flex h-[72px] w-[72px] items-center justify-center">
        <svg viewBox="0 0 72 72" className="absolute inset-0 h-full w-full">
          <polygon
            points={hexPoints}
            fill="#120808"
            stroke={SKILL_TREE_VISUAL.gold}
            strokeWidth={1.5}
            strokeOpacity={0.6}
          />
          <polygon
            points={hexagonPoints(36, 36, 36)}
            fill="none"
            stroke={SKILL_TREE_VISUAL.edgeActive}
            strokeWidth={1}
            strokeOpacity={0.35}
          />
        </svg>
        <span className="relative font-mono text-lg font-semibold text-white">
          {bankShards.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
