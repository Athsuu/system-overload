import { useCallback, useLayoutEffect, useState, type RefObject } from 'react';
import {
  getDomAnchorRect,
  placeModuleTreePopover,
  type ModulePopoverPlacement,
} from './moduleTreePopoverPlacement';

interface UseDomPopoverLayoutOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  anchorRef: RefObject<HTMLElement | null>;
  popoverWidth: number;
  popoverHeight: number;
  active: boolean;
}

interface UseDomPopoverLayoutResult {
  placement: ModulePopoverPlacement | null;
  dialogRef: (node: HTMLDivElement | null) => void;
}

export function useDomPopoverLayout({
  containerRef,
  anchorRef,
  popoverWidth,
  popoverHeight,
  active,
}: UseDomPopoverLayoutOptions): UseDomPopoverLayoutResult {
  const [placement, setPlacement] = useState<ModulePopoverPlacement | null>(null);
  const [dialogNode, setDialogNode] = useState<HTMLDivElement | null>(null);

  const dialogRef = useCallback((node: HTMLDivElement | null) => {
    setDialogNode(node);
  }, []);

  useLayoutEffect(() => {
    if (!active) {
      setPlacement(null);
      return;
    }

    const container = containerRef.current;
    const anchor = anchorRef.current;
    if (!container || !anchor) {
      setPlacement(null);
      return;
    }

    const update = () => {
      const measured = dialogNode?.getBoundingClientRect().height;
      const height = measured && measured > 0 ? measured : popoverHeight;
      const anchorRect = getDomAnchorRect(anchor, container);
      setPlacement(
        placeModuleTreePopover(anchorRect, popoverWidth, height, {
          width: container.clientWidth,
          height: container.clientHeight,
        }),
      );
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(container);
    if (dialogNode) observer.observe(dialogNode);
    window.addEventListener('resize', update);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [active, anchorRef, containerRef, dialogNode, popoverHeight, popoverWidth]);

  return { placement, dialogRef };
}
