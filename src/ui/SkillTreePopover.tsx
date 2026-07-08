import { useCallback, useEffect, useRef, type ReactNode, type RefObject } from 'react';
import type { TreeNodeId } from '../store/skillTree';
import { skillPopoverArrowStyle } from './popoverArrow';
import {
  type SkillTreePanTransform,
} from './skillTreePopoverPlacement';
import { useSkillTreePopoverLayout } from './useSkillTreePopoverLayout';
interface SkillTreePopoverProps {
  viewportRef: RefObject<HTMLDivElement | null>;
  transform: SkillTreePanTransform;
  canvasX: number;
  canvasY: number;
  nodeId: TreeNodeId | 'core';
  popoverWidth: number;
  popoverHeight: number;
  titleId: string;
  onDismiss: () => void;
  children: ReactNode;
}

export function SkillTreePopover({  viewportRef,
  transform,
  canvasX,
  canvasY,
  nodeId,
  popoverWidth,
  popoverHeight,
  titleId,
  onDismiss,
  children,
}: SkillTreePopoverProps) {
  const focusRef = useRef<HTMLDivElement | null>(null);
  const { placement, dialogRef: layoutDialogRef } = useSkillTreePopoverLayout({
    viewportRef,
    transform,
    canvasX,
    canvasY,
    nodeId,
    popoverWidth,
    popoverHeight,
  });

  const dialogRef = useCallback(
    (node: HTMLDivElement | null) => {
      focusRef.current = node;
      layoutDialogRef(node);
    },
    [layoutDialogRef],
  );

  useEffect(() => {
    focusRef.current?.focus();
  }, [placement?.left, placement?.top, placement?.side]);

  if (!placement) return null;

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
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        tabIndex={-1}
        data-skill-tooltip
        className="pointer-events-auto relative outline-none"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            onDismiss();
          }
        }}
      >
        <span aria-hidden className="absolute" style={skillPopoverArrowStyle(placement.side, placement.arrowOffset)} />
        {children}
      </div>
    </div>
  );
}
