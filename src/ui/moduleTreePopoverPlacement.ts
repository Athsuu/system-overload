/** Popover placement for module-tree panels (click-triggered rich tooltips). */

export const MODULE_POPOVER_WIDTH = 300;
export const MODULE_POPOVER_GAP = 12;
export const MODULE_POPOVER_ARROW = 8;
export const MODULE_POPOVER_VIEWPORT_MARGIN = 16;
export const PLACEHOLDER_POPOVER_WIDTH = 280;
export const PLACEHOLDER_POPOVER_HEIGHT = 110;

export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';

export interface ViewportRect {
  width: number;
  height: number;
}

export interface ModuleTreePanTransform {
  x: number;
  y: number;
  scale: number;
}

export interface AxisRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface AnchorMetrics extends AxisRect {
  right: number;
  bottom: number;
  cx: number;
  cy: number;
}

export interface ModulePopoverPlacement {
  left: number;
  top: number;
  width: number;
  side: PopoverSide;
  arrowOffset: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getDomAnchorRect(anchor: HTMLElement, container: HTMLElement): AxisRect {
  const anchorBounds = anchor.getBoundingClientRect();
  const containerBounds = container.getBoundingClientRect();
  return {
    left: anchorBounds.left - containerBounds.left,
    top: anchorBounds.top - containerBounds.top,
    width: anchorBounds.width,
    height: anchorBounds.height,
  };
}

function toAnchorMetrics(rect: AxisRect): AnchorMetrics {
  return {
    ...rect,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    cx: rect.left + rect.width / 2,
    cy: rect.top + rect.height / 2,
  };
}

function rectsOverlap(a: AxisRect, b: AxisRect, gap = 0): boolean {
  return !(
    a.left + a.width + gap <= b.left ||
    b.left + b.width + gap <= a.left ||
    a.top + a.height + gap <= b.top ||
    b.top + b.height + gap <= a.top
  );
}

function isFullyVisible(
  left: number,
  top: number,
  width: number,
  height: number,
  viewport: ViewportRect,
): boolean {
  const margin = MODULE_POPOVER_VIEWPORT_MARGIN;
  return (
    left >= margin &&
    top >= margin &&
    left + width <= viewport.width - margin &&
    top + height <= viewport.height - margin
  );
}

function overflowScore(
  left: number,
  top: number,
  width: number,
  height: number,
  viewport: ViewportRect,
): number {
  const margin = MODULE_POPOVER_VIEWPORT_MARGIN;
  let score = 0;
  score += Math.max(0, margin - left);
  score += Math.max(0, margin - top);
  score += Math.max(0, left + width - (viewport.width - margin));
  score += Math.max(0, top + height - (viewport.height - margin));
  return score;
}

function popoverFootprint(
  side: PopoverSide,
  left: number,
  top: number,
  width: number,
  height: number,
): AxisRect {
  const arrow = MODULE_POPOVER_ARROW;
  switch (side) {
    case 'top':
      return { left, top, width, height: height + arrow };
    case 'bottom':
      return { left, top: top - arrow, width, height: height + arrow };
    case 'right':
      return { left, top, width: width + arrow, height };
    default:
      return { left: left - arrow, top, width: width + arrow, height };
  }
}

function positionForSide(
  side: PopoverSide,
  anchor: AnchorMetrics,
  width: number,
  height: number,
): { left: number; top: number; arrowOffset: number } {
  const gap = MODULE_POPOVER_GAP + MODULE_POPOVER_ARROW;
  const arrowMin = MODULE_POPOVER_ARROW + 6;
  const arrowMax = width - MODULE_POPOVER_ARROW - 6;

  switch (side) {
    case 'bottom': {
      const left = anchor.cx - width / 2;
      const top = anchor.bottom + gap;
      const arrowOffset = clamp(anchor.cx - left, arrowMin, arrowMax);
      return { left, top, arrowOffset };
    }
    case 'top': {
      const left = anchor.cx - width / 2;
      const top = anchor.top - gap - height;
      const arrowOffset = clamp(anchor.cx - left, arrowMin, arrowMax);
      return { left, top, arrowOffset };
    }
    case 'right': {
      const left = anchor.right + gap;
      const top = anchor.cy - height / 2;
      const arrowOffset = clamp(anchor.cy - top, arrowMin, Math.min(arrowMax, height - MODULE_POPOVER_ARROW - 6));
      return { left, top, arrowOffset };
    }
    default: {
      const left = anchor.left - gap - width;
      const top = anchor.cy - height / 2;
      const arrowOffset = clamp(anchor.cy - top, arrowMin, Math.min(arrowMax, height - MODULE_POPOVER_ARROW - 6));
      return { left, top, arrowOffset };
    }
  }
}

export function canvasPointToViewport(
  canvasX: number,
  canvasY: number,
  transform: ModuleTreePanTransform,
): { x: number; y: number } {
  return {
    x: canvasX * transform.scale + transform.x,
    y: canvasY * transform.scale + transform.y,
  };
}

export function getModuleAnchorRect(
  canvasX: number,
  canvasY: number,
  nodeRadiusCanvas: number,
  transform: ModuleTreePanTransform,
  glowPadding = 8,
): AxisRect {
  const center = canvasPointToViewport(canvasX, canvasY, transform);
  const pad = (nodeRadiusCanvas + glowPadding) * transform.scale;
  return {
    left: center.x - pad,
    top: center.y - pad,
    width: pad * 2,
    height: pad * 2,
  };
}

export function placeModuleTreePopover(
  anchorRect: AxisRect,
  popoverWidth: number,
  popoverHeight: number,
  viewport: ViewportRect,
): ModulePopoverPlacement {
  const anchor = toAnchorMetrics(anchorRect);
  const keepOut: AxisRect = {
    left: anchor.left - MODULE_POPOVER_GAP,
    top: anchor.top - MODULE_POPOVER_GAP,
    width: anchor.width + MODULE_POPOVER_GAP * 2,
    height: anchor.height + MODULE_POPOVER_GAP * 2,
  };

  const sides: PopoverSide[] = ['top', 'bottom', 'right', 'left'];

  for (const side of sides) {
    const positioned = positionForSide(side, anchor, popoverWidth, popoverHeight);
    const card = popoverFootprint(
      side,
      positioned.left,
      positioned.top,
      popoverWidth,
      popoverHeight,
    );

    if (
      isFullyVisible(card.left, card.top, card.width, card.height, viewport) &&
      !rectsOverlap(card, keepOut, 0)
    ) {
      return {
        left: positioned.left,
        top: positioned.top,
        width: popoverWidth,
        side,
        arrowOffset: positioned.arrowOffset,
      };
    }
  }

  let best: ModulePopoverPlacement = {
    left: 0,
    top: 0,
    width: popoverWidth,
    side: 'top',
    arrowOffset: popoverWidth / 2,
  };
  let bestScore = Number.POSITIVE_INFINITY;

  for (const side of sides) {
    const positioned = positionForSide(side, anchor, popoverWidth, popoverHeight);
    const card = popoverFootprint(
      side,
      positioned.left,
      positioned.top,
      popoverWidth,
      popoverHeight,
    );

    let score = overflowScore(card.left, card.top, card.width, card.height, viewport);
    if (rectsOverlap(card, keepOut, 0)) score += 10_000;

    if (score < bestScore) {
      bestScore = score;
      best = {
        left: positioned.left,
        top: positioned.top,
        width: popoverWidth,
        side,
        arrowOffset: positioned.arrowOffset,
      };
    }
  }

  const margin = MODULE_POPOVER_VIEWPORT_MARGIN;
  const maxLeft = Math.max(margin, viewport.width - popoverWidth - margin);
  const bestFootprint = popoverFootprint(
    best.side,
    best.left,
    best.top,
    popoverWidth,
    popoverHeight,
  );
  const maxTop = Math.max(margin, viewport.height - bestFootprint.height - margin);

  best.left = clamp(best.left, margin, maxLeft);
  best.top = clamp(best.top, margin, maxTop);

  if (best.side === 'top' || best.side === 'bottom') {
    best.arrowOffset = clamp(anchor.cx - best.left, MODULE_POPOVER_ARROW + 6, popoverWidth - MODULE_POPOVER_ARROW - 6);
  } else {
    best.arrowOffset = clamp(
      anchor.cy - best.top,
      MODULE_POPOVER_ARROW + 6,
      popoverHeight - MODULE_POPOVER_ARROW - 6,
    );
  }

  return best;
}
