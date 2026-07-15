import { useId } from 'react';
import type { HubSfxId } from '../audio/types';
import { triggerSfx } from '../audio/sfxApi';
import { hexagonPoints } from './module-tree/moduleTreeGeometry';
import { MODULE_TREE_VISUAL } from './module-tree/moduleTreeTheme';
import { HexButtonLabel } from './HexButtonLabel';

interface HexActionButtonProps {
  label: string;
  onClick?: () => void;
  size?: 'md' | 'lg' | 'hubRun' | 'xl';
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  title?: string;
  className?: string;
  /** Hub UI click sound. `false` = silent. Default: nodeSelect (Hex Pulse). */
  clickSound?: HubSfxId | false;
}

const SIZE_CONFIG = {
  md: { width: 100, height: 88, viewBox: '0 0 100 88', cx: 50, cy: 44, outerR: 46, innerR: 40, baseFontPx: 14 },
  lg: { width: 100, height: 88, viewBox: '0 0 100 88', cx: 50, cy: 44, outerR: 46, innerR: 40, baseFontPx: 15 },
  hubRun: { width: 125, height: 110, viewBox: '0 0 100 88', cx: 50, cy: 44, outerR: 46, innerR: 40, baseFontPx: 17 },
  xl: { width: 180, height: 158, viewBox: '0 0 100 88', cx: 50, cy: 44, outerR: 46, innerR: 40, baseFontPx: 16 },
} as const;

export function HexActionButton({
  label,
  onClick,
  size = 'lg',
  variant = 'primary',
  disabled = false,
  title,
  className = '',
  clickSound = 'nodeSelect',
}: HexActionButtonProps) {
  const filterId = useId();
  const config = SIZE_CONFIG[size];
  const strokeOuter = disabled
    ? MODULE_TREE_VISUAL.edgeLocked
    : variant === 'primary'
      ? MODULE_TREE_VISUAL.gold
      : MODULE_TREE_VISUAL.edgeLocked;
  const strokeInner = disabled
    ? MODULE_TREE_VISUAL.edgeLocked
    : variant === 'primary'
      ? MODULE_TREE_VISUAL.edgeActive
      : MODULE_TREE_VISUAL.gold;

  const handleClick = () => {
    if (disabled || !onClick) return;
    if (clickSound !== false) {
      triggerSfx(clickSound);
    }
    onClick();
  };

  return (
    <button
      type="button"
      onClick={disabled ? undefined : handleClick}
      disabled={disabled}
      title={title}
      className={`group relative flex items-center justify-center transition ${
        disabled ? 'cursor-not-allowed opacity-40' : 'hover:scale-[1.03]'
      } ${className}`}
      style={{ width: config.width, height: config.height }}
    >
      <svg viewBox={config.viewBox} className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
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
          strokeOpacity={disabled ? 0.35 : 0.55}
          filter={disabled ? undefined : `url(#${filterId})`}
        />
        <polygon
          points={hexagonPoints(config.cx, config.cy, config.innerR)}
          fill="none"
          stroke={strokeInner}
          strokeWidth={2}
          strokeOpacity={disabled ? 0.3 : variant === 'primary' ? 0.7 : 0.45}
        />
      </svg>
      <HexButtonLabel
        label={label}
        disabled={disabled}
        layout={{
          width: config.width,
          height: config.height,
          innerR: config.innerR,
          cx: config.cx,
          cy: config.cy,
          baseFontPx: config.baseFontPx,
        }}
      />
    </button>
  );
}
