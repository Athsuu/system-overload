import { useCallback, useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { skillPopoverArrowStyle } from './popoverArrow';
import { useDomPopoverLayout } from './useDomPopoverLayout';

interface HubPopoverProps {
  containerRef: RefObject<HTMLDivElement | null>;
  anchorRef: RefObject<HTMLElement | null>;
  active: boolean;
  popoverWidth: number;
  popoverHeight: number;
  titleId: string;
  onDismiss?: () => void;
  autoFocus?: boolean;
  onDialogPointerEnter?: () => void;
  onDialogPointerLeave?: () => void;
  children: ReactNode;
}

export function HubPopover({
  containerRef,
  anchorRef,
  active,
  popoverWidth,
  popoverHeight,
  titleId,
  onDismiss,
  autoFocus = true,
  onDialogPointerEnter,
  onDialogPointerLeave,
  children,
}: HubPopoverProps) {
  const focusRef = useRef<HTMLDivElement | null>(null);
  const { placement, dialogRef: layoutDialogRef } = useDomPopoverLayout({
    containerRef,
    anchorRef,
    popoverWidth,
    popoverHeight,
    active,
  });

  const dialogRef = useCallback(
    (node: HTMLDivElement | null) => {
      focusRef.current = node;
      layoutDialogRef(node);
    },
    [layoutDialogRef],
  );

  useEffect(() => {
    if (!active || !autoFocus) return;
    focusRef.current?.focus();
  }, [active, autoFocus, placement?.left, placement?.top, placement?.side]);

  if (!active || !placement) return null;

  return (
    <div
      className="pointer-events-none absolute z-30 so-animate-fade-in"
      style={{
        left: placement.left,
        top: placement.top,
        width: placement.width,
      }}
    >
      <div
        ref={dialogRef}
        role="tooltip"
        aria-labelledby={titleId}
        tabIndex={-1}
        data-skill-tooltip
        data-currency-tooltip
        className="pointer-events-auto relative outline-none"
        onPointerDown={(event) => event.stopPropagation()}
        onPointerEnter={onDialogPointerEnter}
        onPointerLeave={onDialogPointerLeave}
        onKeyDown={(event) => {
          if (!onDismiss || event.key !== 'Escape') return;
          event.stopPropagation();
          onDismiss();
        }}
      >
        <span
          aria-hidden
          className="absolute"
          style={skillPopoverArrowStyle(placement.side, placement.arrowOffset)}
        />
        {children}
      </div>
    </div>
  );
}
