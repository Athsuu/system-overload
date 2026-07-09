import { useId } from 'react';
import { DARK_HEX } from '../theme/darkHexTerminal';
import { hexagonPoints } from './skillTreeGeometry';

const SIZE = 88;
const CX = 44;
const CY = 44;
const HEX_R = 40;
const RING_R = 28;
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
  const rawId = useId();
  const uid = rawId.replace(/:/g, '');
  const filterId = `oc-glow-${uid}`;
  const fillId = `oc-fill-${uid}`;
  const accent = active ? DARK_HEX.breach : ready ? DARK_HEX.gold : DARK_HEX.goldMuted;
  const arcLength = (ringPercent / 100) * RING_C;

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onActivate}
      className={`group relative flex flex-col items-center gap-2 transition ${
        disabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer hover:scale-[1.04] active:scale-[0.98]'
      } ${ready ? 'so-overclock-ready' : ''}`}
    >
      <span
        className="text-[14px] font-semibold tracking-[0.22em] uppercase"
        style={{ color: active ? DARK_HEX.breachGlow : DARK_HEX.gold }}
      >
        {label}
      </span>

      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full">
          <defs>
            <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id={fillId} cx="50%" cy="42%" r="58%">
              <stop offset="0%" stopColor="#1a0808" />
              <stop offset="100%" stopColor="#0a0a0f" />
            </radialGradient>
          </defs>

          <polygon
            points={hexagonPoints(CX, CY, HEX_R)}
            fill={`url(#${fillId})`}
            stroke={accent}
            strokeWidth={1.75}
            strokeOpacity={active ? 0.95 : ready ? 0.75 : 0.45}
            filter={ready || active ? `url(#${filterId})` : undefined}
          />

          <circle
            cx={CX}
            cy={CY}
            r={RING_R}
            fill="none"
            stroke="#1a0808"
            strokeWidth={4}
          />

          <circle
            cx={CX}
            cy={CY}
            r={RING_R}
            fill="none"
            stroke={accent}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${RING_C}`}
            transform={`rotate(-90 ${CX} ${CY})`}
            style={{ transition: 'stroke 120ms ease-out' }}
          />

          {active && (
            <circle
              cx={CX}
              cy={CY}
              r={RING_R + 5}
              fill="none"
              stroke={DARK_HEX.breach}
              strokeWidth={1}
              strokeOpacity={0.35}
              className="so-overclock-active-pulse"
            />
          )}
        </svg>

        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-bold tracking-[0.18em]"
          style={{
            color: accent,
            textShadow: active ? `0 0 14px ${DARK_HEX.breachGlow}` : `0 0 10px ${DARK_HEX.gold}55`,
          }}
        >
          OC
        </span>
      </div>

      <span className="text-[13px] tracking-[0.18em] text-white/30 uppercase">[Space]</span>
    </button>
  );
}
