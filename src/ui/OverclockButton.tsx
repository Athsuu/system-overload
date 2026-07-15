import { DARK_HEX } from '../theme/darkHexTerminal';
import { hexagonPoints } from './module-tree/moduleTreeGeometry';

const SIZE = 88;
const CX = 44;
const CY = 44;
const HEX_R = 40;
const RING_R = 35;
const RING_STROKE = 2.25;
const RING_C = 2 * Math.PI * RING_R;

interface OverclockButtonProps {
  label: string;
  ringPercent: number;
  active: boolean;
  ready: boolean;
  onActivate: () => void;
  disabled?: boolean;
}

export function OverclockButton({
  label,
  ringPercent,
  active,
  ready,
  onActivate,
  disabled = false,
}: OverclockButtonProps) {
  const accent = active ? DARK_HEX.breachGlow : ready ? DARK_HEX.gold : DARK_HEX.goldMuted;
  const clamped = Math.max(0, Math.min(100, ringPercent));
  const arcLength = (clamped / 100) * RING_C;

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onActivate}
      className={`group relative flex flex-col items-center gap-2 transition-transform ${
        disabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer hover:scale-[1.04] active:scale-[0.98]'
      } ${ready ? 'so-overclock-ready' : ''} ${active ? 'so-overclock-active' : ''}`}
    >
      <span
        className="text-[14px] font-semibold tracking-[0.22em] uppercase"
        style={{ color: active ? DARK_HEX.breachGlow : DARK_HEX.gold }}
      >
        {label}
      </span>

      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full">
          <polygon
            points={hexagonPoints(CX, CY, HEX_R)}
            fill={DARK_HEX.canvasBgDeep}
            stroke={accent}
            strokeWidth={1.5}
            strokeOpacity={active ? 0.9 : ready ? 0.7 : 0.4}
          />

          <circle
            cx={CX}
            cy={CY}
            r={RING_R}
            fill="none"
            stroke={DARK_HEX.goldMuted}
            strokeWidth={RING_STROKE}
            strokeOpacity={0.22}
          />

          <circle
            cx={CX}
            cy={CY}
            r={RING_R}
            fill="none"
            stroke={accent}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${RING_C}`}
            transform={`rotate(-90 ${CX} ${CY})`}
            strokeOpacity={active ? 0.95 : ready ? 0.85 : 0.55}
          />
        </svg>

        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-bold tracking-[0.18em]"
          style={{
            color: accent,
            textShadow: active ? `0 0 12px ${DARK_HEX.breachGlow}` : ready ? `0 0 8px ${DARK_HEX.gold}66` : 'none',
          }}
        >
          OC
        </span>
      </div>

      <span className="text-[13px] tracking-[0.18em] text-white/30 uppercase">[Space]</span>
    </button>
  );
}
