import { createPortal } from 'react-dom';
import { useLayoutEffect, useState, type ReactNode, type RefObject } from 'react';

const TOOLTIP_WIDTH = 256;
const VIEWPORT_MARGIN = 8;

interface DevFloatingTooltipProps {
  anchorRef: RefObject<HTMLElement | null>;
  open: boolean;
  anchorKey?: string | null;
  children: ReactNode;
}

function computeTooltipPosition(anchor: HTMLElement): { top: number; left: number } {
  const rect = anchor.getBoundingClientRect();
  const gap = 8;

  let left = rect.right + gap;
  if (left + TOOLTIP_WIDTH > window.innerWidth - VIEWPORT_MARGIN) {
    left = rect.left - TOOLTIP_WIDTH - gap;
  }
  left = Math.max(VIEWPORT_MARGIN, Math.min(left, window.innerWidth - TOOLTIP_WIDTH - VIEWPORT_MARGIN));

  const top = Math.max(
    VIEWPORT_MARGIN,
    Math.min(rect.top, window.innerHeight - VIEWPORT_MARGIN - 220),
  );

  return { top, left };
}

export function DevFloatingTooltip({
  anchorRef,
  open,
  anchorKey = null,
  children,
}: DevFloatingTooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      setPosition(computeTooltipPosition(anchor));
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [anchorKey, anchorRef, open]);

  if (!open) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed z-[9999] w-64 rounded-lg border border-white/15 bg-[#0d0d12] p-3 shadow-2xl"
      style={{ top: position.top, left: position.left }}
      role="tooltip"
    >
      {children}
    </div>,
    document.body,
  );
}
