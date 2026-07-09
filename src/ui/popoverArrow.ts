import type { CSSProperties } from 'react';
import { MODULE_TREE_VISUAL } from './moduleTreeTheme';
import { MODULE_POPOVER_ARROW } from './moduleTreePopoverPlacement';

export function modulePopoverArrowStyle(
  side: 'top' | 'bottom' | 'left' | 'right',
  offset: number,
): CSSProperties {
  const size = MODULE_POPOVER_ARROW;
  const color = MODULE_TREE_VISUAL.tooltipBg;

  switch (side) {
    case 'bottom':
      return {
        position: 'absolute',
        top: -size,
        left: offset - size,
        width: 0,
        height: 0,
        borderLeft: `${size}px solid transparent`,
        borderRight: `${size}px solid transparent`,
        borderBottom: `${size}px solid ${color}`,
        pointerEvents: 'none',
      };
    case 'top':
      return {
        position: 'absolute',
        bottom: -size,
        left: offset - size,
        width: 0,
        height: 0,
        borderLeft: `${size}px solid transparent`,
        borderRight: `${size}px solid transparent`,
        borderTop: `${size}px solid ${color}`,
        pointerEvents: 'none',
      };
    case 'right':
      return {
        position: 'absolute',
        left: -size,
        top: offset - size,
        width: 0,
        height: 0,
        borderTop: `${size}px solid transparent`,
        borderBottom: `${size}px solid transparent`,
        borderRight: `${size}px solid ${color}`,
        pointerEvents: 'none',
      };
    default:
      return {
        position: 'absolute',
        right: -size,
        top: offset - size,
        width: 0,
        height: 0,
        borderTop: `${size}px solid transparent`,
        borderBottom: `${size}px solid transparent`,
        borderLeft: `${size}px solid ${color}`,
        pointerEvents: 'none',
      };
  }
}
