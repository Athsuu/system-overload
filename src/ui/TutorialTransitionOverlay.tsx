import { useMemo, type ReactNode } from 'react';
import type { TutorialAnchor, TutorialDisplay, TutorialStepId } from '../tutorial/tutorialCatalog';
import {
  buildFocusLiftGradient,
  buildFocusLiftMask,
  buildFocusMask,
  buildVignetteMask,
  SPOTLIGHT_DIM_COLOR,
} from '../tutorial/tutorialSpotlightLayout';
import {
  useAnimatedTutorialLayout,
  type TutorialNavDirection,
} from './useAnimatedTutorialLayout';

export type { TutorialNavDirection };

interface TutorialTransitionOverlayProps {
  stepId: TutorialStepId;
  anchor: TutorialAnchor;
  display: TutorialDisplay;
  navDirection: TutorialNavDirection;
  showCenterDim: boolean;
  showModuleTreeGradient: boolean;
  children: ReactNode;
}

const MASK_STYLE = {
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskSize: '100% 100%',
  maskSize: '100% 100%',
} as const;

export function TutorialTransitionOverlay({
  stepId,
  anchor,
  display,
  navDirection,
  showCenterDim,
  showModuleTreeGradient,
  children,
}: TutorialTransitionOverlayProps) {
  const { focusMetrics, cardPlacement, isInitial, spotlightActive } = useAnimatedTutorialLayout(
    anchor,
    display,
    stepId,
  );

  const focusMask = useMemo(() => {
    if (!focusMetrics) return undefined;
    return buildFocusMask(focusMetrics);
  }, [focusMetrics]);

  const focusLiftMask = useMemo(() => {
    if (!focusMetrics) return undefined;
    return buildFocusLiftMask(focusMetrics);
  }, [focusMetrics]);

  const focusLiftGradient = useMemo(() => {
    if (!focusMetrics) return undefined;
    return buildFocusLiftGradient(focusMetrics);
  }, [focusMetrics]);

  const vignetteMask = useMemo(() => buildVignetteMask(), []);

  if (!cardPlacement) return null;

  const veilFadeClass = isInitial ? 'so-animate-fade-in-slow' : '';

  return (
    <div className="pointer-events-auto fixed inset-0 z-[24]">
      {showCenterDim && (
        <div
          className={`so-animate-fade-in-slow pointer-events-auto absolute inset-0 ${veilFadeClass}`}
          style={{ backgroundColor: 'rgba(8, 12, 18, 0.78)' }}
          aria-hidden
        />
      )}

      {showModuleTreeGradient && (
        <div
          className={`so-animate-fade-in-slow pointer-events-none absolute inset-0 ${veilFadeClass}`}
          style={{
            background: `linear-gradient(90deg, rgba(19,16,24,0.88) 0%, rgba(19,16,24,0.52) 42%, transparent 70%)`,
          }}
          aria-hidden
        />
      )}

      {spotlightActive && focusMask && (
        <>
          <div
            className={`so-tutorial-spotlight-veil so-tutorial-spotlight-veil--vignette ${veilFadeClass}`}
            style={{
              ...MASK_STYLE,
              backgroundColor: SPOTLIGHT_DIM_COLOR,
              WebkitMaskImage: vignetteMask,
              maskImage: vignetteMask,
              opacity: 0.5,
            }}
            aria-hidden
          />
          <div
            className={`so-tutorial-spotlight-veil ${veilFadeClass}`}
            style={{
              ...MASK_STYLE,
              backgroundColor: SPOTLIGHT_DIM_COLOR,
              WebkitMaskImage: focusMask,
              maskImage: focusMask,
            }}
            aria-hidden
          />
          {focusLiftMask && focusLiftGradient && (
            <div
              className={`so-tutorial-spotlight-veil so-tutorial-spotlight-veil--lift pointer-events-none ${veilFadeClass}`}
              style={{
                ...MASK_STYLE,
                background: focusLiftGradient,
                WebkitMaskImage: focusLiftMask,
                maskImage: focusLiftMask,
                mixBlendMode: 'screen',
              }}
              aria-hidden
            />
          )}
        </>
      )}

      <div
        className={`pointer-events-auto absolute so-tutorial-card-glide ${
          isInitial && navDirection === 0 ? 'so-animate-fade-in-slow' : ''
        }`}
        style={{
          left: cardPlacement.left,
          top: cardPlacement.top,
          width: cardPlacement.maxWidth,
        }}
      >
        {children}
      </div>
    </div>
  );
}
