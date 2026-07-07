import { useLayoutEffect, useRef, useState } from 'react';
import type { TutorialAnchor, TutorialDisplay, TutorialStepId } from '../tutorial/tutorialCatalog';
import {
  easeOutCubic,
  lerp,
  lerpSpotlightMetrics,
  SPOTLIGHT_MOVE_DURATION_MS,
} from '../tutorial/tutorialSpotlightMotion';
import {
  getSpotlightFocusMetrics,
  measureSpotlightRect,
  measureTutorialCardPlacement,
  type CardPlacement,
  type SpotlightFocusMetrics,
} from '../tutorial/tutorialSpotlightLayout';

export type TutorialNavDirection = -1 | 0 | 1;

export interface AnimatedTutorialLayoutState {
  focusMetrics: SpotlightFocusMetrics | null;
  cardPlacement: CardPlacement | null;
  isInitial: boolean;
  spotlightActive: boolean;
}

interface LayoutTarget {
  metrics: SpotlightFocusMetrics | null;
  card: CardPlacement;
}

function measureLayoutTarget(
  anchor: TutorialAnchor,
  display: TutorialDisplay,
): LayoutTarget | null {
  const card = measureTutorialCardPlacement(anchor, display);
  if (!card) return null;

  if (display !== 'spotlight') {
    return { metrics: null, card };
  }

  const rect = measureSpotlightRect(anchor);
  if (!rect) return null;

  return {
    metrics: getSpotlightFocusMetrics(anchor, rect),
    card,
  };
}

function placementNearlyEqual(a: CardPlacement, b: CardPlacement): boolean {
  return Math.abs(a.left - b.left) < 2 && Math.abs(a.top - b.top) < 2;
}

function collapsedMetrics(at: SpotlightFocusMetrics): SpotlightFocusMetrics {
  return { cx: at.cx, cy: at.cy, rx: 0, ry: 0 };
}

function resolveMetricsTransition(
  start: SpotlightFocusMetrics | null,
  target: SpotlightFocusMetrics | null,
): { from: SpotlightFocusMetrics | null; to: SpotlightFocusMetrics | null } {
  if (start && target) return { from: start, to: target };
  if (start && !target) return { from: start, to: collapsedMetrics(start) };
  if (!start && target) return { from: collapsedMetrics(target), to: target };
  return { from: null, to: null };
}

function metricsActive(metrics: SpotlightFocusMetrics | null): boolean {
  return metrics !== null && (metrics.rx > 0.5 || metrics.ry > 0.5);
}

export function useAnimatedTutorialLayout(
  anchor: TutorialAnchor,
  display: TutorialDisplay,
  stepId: TutorialStepId,
): AnimatedTutorialLayoutState {
  const [focusMetrics, setFocusMetrics] = useState<SpotlightFocusMetrics | null>(null);
  const [cardPlacement, setCardPlacement] = useState<CardPlacement | null>(null);
  const [isInitial, setIsInitial] = useState(true);

  const metricsRef = useRef<SpotlightFocusMetrics | null>(null);
  const cardRef = useRef<CardPlacement | null>(null);
  const frameRef = useRef(0);
  const animatingRef = useRef(false);

  useLayoutEffect(() => {
    const runToTarget = (instant: boolean) => {
      const target = measureLayoutTarget(anchor, display);
      if (!target) return;

      cancelAnimationFrame(frameRef.current);
      animatingRef.current = false;

      const previousCard = cardRef.current;
      const cardUnchanged =
        previousCard !== null && placementNearlyEqual(previousCard, target.card);

      if (instant || !previousCard || cardUnchanged) {
        metricsRef.current = target.metrics;
        cardRef.current = target.card;
        setFocusMetrics(target.metrics);
        setCardPlacement(target.card);
        setIsInitial(instant);
        return;
      }

      const metricsTransition = resolveMetricsTransition(metricsRef.current, target.metrics);
      const startMetrics = metricsTransition.from;
      const startCard = previousCard;

      const startTime = performance.now();
      animatingRef.current = true;

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const rawT = Math.min(1, elapsed / SPOTLIGHT_MOVE_DURATION_MS);
        const t = easeOutCubic(rawT);

        const nextMetrics =
          startMetrics && metricsTransition.to
            ? lerpSpotlightMetrics(startMetrics, metricsTransition.to, t)
            : target.metrics;

        const nextCard: CardPlacement = {
          left: lerp(startCard.left, target.card.left, t),
          top: lerp(startCard.top, target.card.top, t),
          maxWidth: target.card.maxWidth,
        };

        const settledMetrics =
          rawT >= 1 && !target.metrics ? null : nextMetrics;

        metricsRef.current = settledMetrics;
        cardRef.current = nextCard;
        setFocusMetrics(settledMetrics);
        setCardPlacement(nextCard);
        setIsInitial(false);

        if (rawT < 1) {
          frameRef.current = requestAnimationFrame(tick);
        } else {
          animatingRef.current = false;
        }
      };

      frameRef.current = requestAnimationFrame(tick);
    };

    runToTarget(cardRef.current === null);

    const onWindowResize = () => {
      if (animatingRef.current) return;
      runToTarget(true);
    };

    window.addEventListener('resize', onWindowResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      animatingRef.current = false;
      window.removeEventListener('resize', onWindowResize);
    };
  }, [anchor, display, stepId]);

  return {
    focusMetrics,
    cardPlacement,
    isInitial,
    spotlightActive: metricsActive(focusMetrics),
  };
}
