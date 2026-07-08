import type { TutorialAnchor, TutorialDisplay } from './tutorialCatalog';
import {
  OVERLOAD_CARD_TOP_OFFSET_PX,
  OVERLOAD_CARD_TOP_VIEWPORT_RATIO,
  PLACEMENT_BOTTOM_THRESHOLD,
  PLACEMENT_LEFT_THRESHOLD,
  PLACEMENT_RIGHT_THRESHOLD,
  PLACEMENT_TOP_THRESHOLD,
  SPOTLIGHT_CARD_ESTIMATED_HEIGHT,
  SPOTLIGHT_CARD_GAP,
  SPOTLIGHT_CARD_MAX_WIDTH,
  SPOTLIGHT_DIM_COLOR,
  SPOTLIGHT_LIFT_CENTER,
  SPOTLIGHT_LIFT_MID,
  SPOTLIGHT_VIEWPORT_MARGIN,
  START_RUN_CARD_OFFSET_LEFT_PX,
  START_RUN_CARD_OFFSET_TOP_PX,
  SKILL_TREE_SPOTLIGHT_SIZE,
} from './tutorialSpotlightDefaults';

export interface SpotlightRect {
  left: number;
  top: number;
  width: number;
  height: number;
  borderRadius: number;
}

export interface CardPlacement {
  left: number;
  top: number;
  maxWidth: number;
}

export { SPOTLIGHT_CARD_ESTIMATED_HEIGHT, SPOTLIGHT_DIM_COLOR };

interface CardPoint {
  left: number;
  top: number;
}

function fitCardInViewport(
  left: number,
  top: number,
  maxWidth: number,
  cardHeight: number,
  viewportW: number,
  viewportH: number,
): CardPlacement {
  const maxLeft = Math.max(SPOTLIGHT_VIEWPORT_MARGIN, viewportW - maxWidth - SPOTLIGHT_VIEWPORT_MARGIN);
  const maxTop = Math.max(SPOTLIGHT_VIEWPORT_MARGIN, viewportH - cardHeight - SPOTLIGHT_VIEWPORT_MARGIN);

  return {
    left: clamp(left, SPOTLIGHT_VIEWPORT_MARGIN, maxLeft),
    top: clamp(top, SPOTLIGHT_VIEWPORT_MARGIN, maxTop),
    maxWidth,
  };
}

function isCardFullyVisible(
  placement: CardPlacement,
  cardHeight: number,
  viewportW: number,
  viewportH: number,
): boolean {
  return (
    placement.left >= SPOTLIGHT_VIEWPORT_MARGIN &&
    placement.top >= SPOTLIGHT_VIEWPORT_MARGIN &&
    placement.left + placement.maxWidth <= viewportW - SPOTLIGHT_VIEWPORT_MARGIN &&
    placement.top + cardHeight <= viewportH - SPOTLIGHT_VIEWPORT_MARGIN
  );
}

type SpotlightMode = 'element' | 'viewport-center';

interface SpotlightSpec {
  mode: SpotlightMode;
  selector?: string;
  size?: number;
  padding?: number;
  borderRadius?: number;
}

interface SpotlightSpecWithFeather extends SpotlightSpec {
  feather?: number;
}

const SPOTLIGHT_SPECS: Partial<Record<TutorialAnchor, SpotlightSpecWithFeather>> = {
  'purge-zone': { mode: 'viewport-center', size: 200, padding: 0, borderRadius: 0, feather: 2.4 },
  'overload-bar': {
    mode: 'element',
    selector: '[data-tutorial-anchor="overload-bar"]',
    padding: 4,
    borderRadius: 0,
    feather: 2.8,
  },
  'run-shards': {
    mode: 'element',
    selector: '[data-tutorial-anchor="hex-shards"]',
    padding: 6,
    borderRadius: 0,
    feather: 2.2,
  },
  'hex-shards': {
    mode: 'element',
    selector: '[data-tutorial-anchor="hex-shards"]',
    padding: 6,
    borderRadius: 0,
    feather: 2.2,
  },
  overclock: {
    mode: 'element',
    selector: '[data-tutorial-anchor="overclock"]',
    padding: 6,
    borderRadius: 0,
    feather: 2.2,
  },
  'start-run': {
    mode: 'element',
    selector: '[data-tutorial-anchor="start-run"]',
    padding: 8,
    borderRadius: 8,
    feather: 2.2,
  },
  'skill-tree': {
    mode: 'viewport-center',
    size: SKILL_TREE_SPOTLIGHT_SIZE,
    padding: 32,
    borderRadius: 0,
    feather: 2.4,
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface AxisRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

function rectsOverlap(a: AxisRect, b: AxisRect, gap = 0): boolean {
  return !(
    a.left + a.width + gap <= b.left ||
    b.left + b.width + gap <= a.left ||
    a.top + a.height + gap <= b.top ||
    b.top + b.height + gap <= a.top
  );
}

/** Tight bounds — card must not cover the HUD element, not the whole spotlight halo. */
function getCardKeepOutRect(rect: SpotlightRect): AxisRect {
  return {
    left: rect.left - SPOTLIGHT_CARD_GAP,
    top: rect.top - SPOTLIGHT_CARD_GAP,
    width: rect.width + SPOTLIGHT_CARD_GAP * 2,
    height: rect.height + SPOTLIGHT_CARD_GAP * 2,
  };
}

function isCardClearOfKeepOut(
  placement: CardPlacement,
  cardHeight: number,
  keepOut: AxisRect,
): boolean {
  const card: AxisRect = {
    left: placement.left,
    top: placement.top,
    width: placement.maxWidth,
    height: cardHeight,
  };

  return !rectsOverlap(card, keepOut, SPOTLIGHT_CARD_GAP);
}

function cardDistanceToTarget(
  placement: CardPlacement,
  cardHeight: number,
  rect: SpotlightRect,
): number {
  const cardCx = placement.left + placement.maxWidth / 2;
  const cardCy = placement.top + cardHeight / 2;
  const targetCx = rect.left + rect.width / 2;
  const targetCy = rect.top + rect.height / 2;

  return Math.hypot(cardCx - targetCx, cardCy - targetCy);
}

function buildCardCandidates(
  rect: SpotlightRect,
  maxWidth: number,
  cardHeight: number,
  viewportW: number,
  viewportH: number,
): CardPoint[] {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const isRight = cx > viewportW * PLACEMENT_RIGHT_THRESHOLD;
  const isLeft = cx < viewportW * PLACEMENT_LEFT_THRESHOLD;
  const isTop = cy < viewportH * PLACEMENT_TOP_THRESHOLD;
  const isBottom = cy > viewportH * PLACEMENT_BOTTOM_THRESHOLD;

  const rowTop = clamp(rect.top, SPOTLIGHT_VIEWPORT_MARGIN, viewportH - cardHeight - SPOTLIGHT_VIEWPORT_MARGIN);
  const alignLeft = rect.left;
  const alignRight = rect.left + rect.width - maxWidth;

  const besideLeft: CardPoint = {
    left: rect.left - SPOTLIGHT_CARD_GAP - maxWidth,
    top: rowTop,
  };
  const besideRight: CardPoint = {
    left: rect.left + rect.width + SPOTLIGHT_CARD_GAP,
    top: rowTop,
  };
  const belowRight: CardPoint = {
    left: alignRight,
    top: rect.top + rect.height + SPOTLIGHT_CARD_GAP,
  };
  const belowLeft: CardPoint = {
    left: alignLeft,
    top: rect.top + rect.height + SPOTLIGHT_CARD_GAP,
  };
  const aboveRight: CardPoint = {
    left: alignRight,
    top: rect.top - SPOTLIGHT_CARD_GAP - cardHeight,
  };
  const aboveLeft: CardPoint = {
    left: alignLeft,
    top: rect.top - SPOTLIGHT_CARD_GAP - cardHeight,
  };

  if (isRight && isTop) {
    return [besideLeft, belowRight, belowLeft, aboveRight, besideRight, aboveLeft];
  }
  if (isRight && isBottom) {
    return [aboveRight, besideLeft, aboveLeft, belowRight, besideRight, belowLeft];
  }
  if (isRight) {
    return [besideLeft, belowRight, aboveRight, besideRight, belowLeft, aboveLeft];
  }
  if (isLeft && isTop) {
    return [besideRight, belowLeft, belowRight, aboveLeft, besideLeft, aboveRight];
  }
  if (isLeft && isBottom) {
    return [aboveLeft, besideRight, aboveRight, belowLeft, besideLeft, belowRight];
  }
  if (isBottom) {
    return [aboveLeft, aboveRight, besideLeft, besideRight, belowLeft, belowRight];
  }
  if (isTop) {
    return [belowLeft, belowRight, besideLeft, besideRight, aboveLeft, aboveRight];
  }

  return [besideLeft, besideRight, belowLeft, belowRight, aboveLeft, aboveRight];
}

export function measureSpotlightRect(anchor: TutorialAnchor): SpotlightRect | null {
  const spec = SPOTLIGHT_SPECS[anchor];
  if (!spec) return null;

  const padding = spec.padding ?? 8;
  const borderRadius = spec.borderRadius ?? 8;

  if (spec.mode === 'viewport-center') {
    const size = spec.size ?? 200;
    const left = window.innerWidth / 2 - size / 2;
    const top = window.innerHeight / 2 - size / 2;
    return {
      left: left - padding,
      top: top - padding,
      width: size + padding * 2,
      height: size + padding * 2,
      borderRadius,
    };
  }

  const element = document.querySelector(spec.selector ?? '');
  if (!element) return null;

  const bounds = element.getBoundingClientRect();
  return {
    left: bounds.left - padding,
    top: bounds.top - padding,
    width: bounds.width + padding * 2,
    height: bounds.height + padding * 2,
    borderRadius,
  };
}

export function placeTutorialCard(
  anchor: TutorialAnchor,
  rect: SpotlightRect,
  cardHeight = SPOTLIGHT_CARD_ESTIMATED_HEIGHT,
): CardPlacement {
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const maxWidth = Math.min(SPOTLIGHT_CARD_MAX_WIDTH, viewportW - SPOTLIGHT_VIEWPORT_MARGIN * 2);
  const keepOut = getCardKeepOutRect(rect);

  const fixedPlacement = getAnchorFixedCardPlacement(
    anchor,
    rect,
    maxWidth,
    cardHeight,
    viewportW,
    viewportH,
  );
  if (
    fixedPlacement &&
    isCardFullyVisible(fixedPlacement, cardHeight, viewportW, viewportH) &&
    isCardClearOfKeepOut(fixedPlacement, cardHeight, keepOut)
  ) {
    return fixedPlacement;
  }

  const candidates = buildCardCandidates(rect, maxWidth, cardHeight, viewportW, viewportH);

  let bestPlacement: CardPlacement | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    const fitted = fitCardInViewport(
      candidate.left,
      candidate.top,
      maxWidth,
      cardHeight,
      viewportW,
      viewportH,
    );

    if (
      !isCardFullyVisible(fitted, cardHeight, viewportW, viewportH) ||
      !isCardClearOfKeepOut(fitted, cardHeight, keepOut)
    ) {
      continue;
    }

    const distance = cardDistanceToTarget(fitted, cardHeight, rect);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestPlacement = fitted;
    }
  }

  if (bestPlacement) {
    return bestPlacement;
  }

  const rowTop = clamp(rect.top, SPOTLIGHT_VIEWPORT_MARGIN, viewportH - cardHeight - SPOTLIGHT_VIEWPORT_MARGIN);
  const besideLeft = fitCardInViewport(
    rect.left - SPOTLIGHT_CARD_GAP - maxWidth,
    rowTop,
    maxWidth,
    cardHeight,
    viewportW,
    viewportH,
  );

  if (isCardClearOfKeepOut(besideLeft, cardHeight, keepOut)) {
    return besideLeft;
  }

  return fitCardInViewport(
    alignCardNearTarget(rect, maxWidth, viewportW),
    rowTop,
    maxWidth,
    cardHeight,
    viewportW,
    viewportH,
  );
}

/** Fixed card zones for anchors where the player reads center-screen, spotlight stays on HUD. */
function getAnchorFixedCardPlacement(
  anchor: TutorialAnchor,
  rect: SpotlightRect,
  maxWidth: number,
  cardHeight: number,
  viewportW: number,
  viewportH: number,
): CardPlacement | null {
  if (anchor === 'start-run') {
    const rowTop = clamp(
      rect.top + rect.height / 2 - cardHeight / 2,
      SPOTLIGHT_VIEWPORT_MARGIN,
      viewportH - cardHeight - SPOTLIGHT_VIEWPORT_MARGIN,
    );

    return fitCardInViewport(
      rect.left - SPOTLIGHT_CARD_GAP - maxWidth - START_RUN_CARD_OFFSET_LEFT_PX,
      rowTop - START_RUN_CARD_OFFSET_TOP_PX,
      maxWidth,
      cardHeight,
      viewportW,
      viewportH,
    );
  }

  if (anchor === 'skill-tree') {
    return fitCardInViewport(
      32,
      (viewportH - cardHeight) / 2,
      maxWidth,
      cardHeight,
      viewportW,
      viewportH,
    );
  }

  if (anchor !== 'overload-bar') return null;

  const centeredLeft = viewportW / 2 - maxWidth / 2;
  const maxTopAboveBar = rect.top - SPOTLIGHT_CARD_GAP - cardHeight;
  const minTopBelowNode0 =
    viewportH * OVERLOAD_CARD_TOP_VIEWPORT_RATIO + OVERLOAD_CARD_TOP_OFFSET_PX;
  const centeredTop = clamp(
    minTopBelowNode0,
    Math.max(SPOTLIGHT_VIEWPORT_MARGIN, minTopBelowNode0),
    Math.max(SPOTLIGHT_VIEWPORT_MARGIN, maxTopAboveBar),
  );

  return fitCardInViewport(
    centeredLeft,
    centeredTop,
    maxWidth,
    cardHeight,
    viewportW,
    viewportH,
  );
}

function alignCardNearTarget(
  rect: SpotlightRect,
  maxWidth: number,
  viewportW: number,
): number {
  const targetCx = rect.left + rect.width / 2;
  const preferredLeft = targetCx > viewportW / 2
    ? rect.left - SPOTLIGHT_CARD_GAP - maxWidth
    : rect.left + rect.width + SPOTLIGHT_CARD_GAP;

  return clamp(
    preferredLeft,
    SPOTLIGHT_VIEWPORT_MARGIN,
    Math.max(SPOTLIGHT_VIEWPORT_MARGIN, viewportW - maxWidth - SPOTLIGHT_VIEWPORT_MARGIN),
  );
}

export interface SpotlightFocusMetrics {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

function getSpotlightMetrics(anchor: TutorialAnchor, rect: SpotlightRect): SpotlightFocusMetrics {
  const spec = SPOTLIGHT_SPECS[anchor];
  const feather = spec?.feather ?? 2;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const rx = Math.max(rect.width * feather * 0.52, 150);
  const ry = Math.max(rect.height * feather * 0.52, 110);

  return { cx, cy, rx, ry };
}

export function getSpotlightFocusMetrics(
  anchor: TutorialAnchor,
  rect: SpotlightRect,
): SpotlightFocusMetrics {
  return getSpotlightMetrics(anchor, rect);
}

export function buildFocusMask(metrics: SpotlightFocusMetrics): string {
  const { cx, cy, rx, ry } = metrics;

  return `radial-gradient(ellipse ${rx}px ${ry}px at ${cx}px ${cy}px, transparent 0%, transparent 36%, rgba(0, 0, 0, 0.12) 52%, rgba(0, 0, 0, 0.38) 70%, rgba(0, 0, 0, 0.72) 86%, black 100%)`;
}

export function buildFocusLiftMask(metrics: SpotlightFocusMetrics): string {
  const { cx, cy, rx, ry } = metrics;

  return `radial-gradient(ellipse ${rx}px ${ry}px at ${cx}px ${cy}px, black 0%, black 30%, rgba(0, 0, 0, 0.55) 46%, transparent 60%)`;
}

export function buildFocusLiftGradient(metrics: SpotlightFocusMetrics): string {
  const { cx, cy, rx, ry } = metrics;

  return `radial-gradient(ellipse ${rx * 0.92}px ${ry * 0.92}px at ${cx}px ${cy}px, ${SPOTLIGHT_LIFT_CENTER} 0%, ${SPOTLIGHT_LIFT_MID} 40%, transparent 68%)`;
}

export function buildVignetteMask(): string {
  return 'radial-gradient(ellipse 98% 92% at 50% 48%, transparent 52%, rgba(0, 0, 0, 0.35) 78%, black 100%)';
}

const ANCHORED_CARD_WIDTH: Partial<Record<TutorialAnchor, number>> = {
  'featured-center': 420,
  'featured-skill-tree': 340,
  'skill-tree': 280,
  'vault-shards': 300,
  'hex-shards': 300,
  'run-shards': 300,
  'flux-drive': 260,
};

/** Fixed placement for featured / anchored ARCH cards (matches legacy Tailwind anchors). */
export function measureAnchoredCardPlacement(
  anchor: TutorialAnchor,
  cardHeight = SPOTLIGHT_CARD_ESTIMATED_HEIGHT,
): CardPlacement {
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const maxWidth = Math.min(
    ANCHORED_CARD_WIDTH[anchor] ?? SPOTLIGHT_CARD_MAX_WIDTH,
    viewportW - SPOTLIGHT_VIEWPORT_MARGIN * 2,
  );

  switch (anchor) {
    case 'featured-center':
      return fitCardInViewport(
        (viewportW - maxWidth) / 2,
        (viewportH - cardHeight) / 2,
        maxWidth,
        cardHeight,
        viewportW,
        viewportH,
      );
    case 'featured-skill-tree':
    case 'skill-tree':
      return fitCardInViewport(32, (viewportH - cardHeight) / 2, maxWidth, cardHeight, viewportW, viewportH);
    case 'vault-shards':
    case 'hex-shards':
    case 'run-shards':
      return fitCardInViewport(
        Math.max(SPOTLIGHT_VIEWPORT_MARGIN, viewportW - maxWidth - 200),
        32,
        maxWidth,
        cardHeight,
        viewportW,
        viewportH,
      );
    case 'flux-drive':
      return fitCardInViewport(24, 128, maxWidth, cardHeight, viewportW, viewportH);
    default:
      return fitCardInViewport(
        (viewportW - maxWidth) / 2,
        (viewportH - cardHeight) / 2,
        maxWidth,
        cardHeight,
        viewportW,
        viewportH,
      );
  }
}

export function measureTutorialCardPlacement(
  anchor: TutorialAnchor,
  display: TutorialDisplay,
  cardHeight = SPOTLIGHT_CARD_ESTIMATED_HEIGHT,
): CardPlacement | null {
  if (display === 'spotlight') {
    const rect = measureSpotlightRect(anchor);
    if (!rect) return null;
    return placeTutorialCard(anchor, rect, cardHeight);
  }

  return measureAnchoredCardPlacement(anchor, cardHeight);
}
