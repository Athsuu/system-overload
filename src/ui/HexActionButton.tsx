import { hexagonPoints } from './skillTreeGeometry';
import { SKILL_TREE_VISUAL } from './skillTreeTheme';

interface HexActionButtonProps {
  label: string;
  onClick: () => void;
  size?: 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  className?: string;
}

const SIZE_CONFIG = {
  md: { width: 100, height: 88, viewBox: '0 0 100 88', cx: 50, cy: 44, outerR: 46, innerR: 40, textClass: 'text-[10px]' },
  lg: { width: 100, height: 88, viewBox: '0 0 100 88', cx: 50, cy: 44, outerR: 46, innerR: 40, textClass: 'text-[11px]' },
} as const;

export function HexActionButton({
  label,
  onClick,
  size = 'lg',
  variant = 'primary',
  className = '',
}: HexActionButtonProps) {
  const config = SIZE_CONFIG[size];
  const strokeOuter = variant === 'primary' ? SKILL_TREE_VISUAL.gold : SKILL_TREE_VISUAL.edgeLocked;
  const strokeInner = variant === 'primary' ? SKILL_TREE_VISUAL.edgeActive : SKILL_TREE_VISUAL.gold;
  const lines = label.split('\n');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex items-center justify-center transition hover:scale-[1.03] ${className}`}
      style={{ width: config.width, height: config.height }}
    >
      <svg viewBox={config.viewBox} className="absolute inset-0 h-full w-full">
        <defs>
          <filter id={`hexGlow-${variant}-${size}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <polygon
          points={hexagonPoints(config.cx, config.cy, config.outerR)}
          fill="#120808"
          stroke={strokeOuter}
          strokeWidth={1.5}
          strokeOpacity={0.55}
          filter={`url(#hexGlow-${variant}-${size})`}
        />
        <polygon
          points={hexagonPoints(config.cx, config.cy, config.innerR)}
          fill="none"
          stroke={strokeInner}
          strokeWidth={2}
          strokeOpacity={variant === 'primary' ? 0.7 : 0.45}
        />
      </svg>
      <span
        className={`relative font-bold tracking-[0.12em] text-white uppercase ${config.textClass}`}
        style={{ textShadow: `0 0 12px ${SKILL_TREE_VISUAL.edgeActive}66` }}
      >
        {lines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </span>
    </button>
  );
}
