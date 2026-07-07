import type { ReactNode } from 'react';
import { useGameStrings } from '../i18n/useGameStrings';
import { DARK_HEX } from '../theme/darkHexTerminal';

export type ArchChannelIntensity = 'normal' | 'heavy';

export interface ArchChannelGroupNav {
  canGoPrevious: boolean;
  canGoNext: boolean;
  isLastInGroup: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

interface ArchChannelPanelProps {
  children: ReactNode;
  featured?: boolean;
  paddingClassName?: string;
  onSkip?: () => void;
  groupNav?: ArchChannelGroupNav;
}

const CORNER_ARROW_CLASS =
  'absolute z-20 flex h-14 w-14 items-center justify-center text-3xl leading-none text-sky-400/70 transition hover:text-sky-300/90 disabled:cursor-not-allowed disabled:text-white/25 disabled:hover:text-white/25';

export function ArchChannelPanel({
  children,
  featured = false,
  paddingClassName,
  onSkip,
  groupNav,
}: ArchChannelPanelProps) {
  const strings = useGameStrings();
  const pad =
    paddingClassName ??
    (featured ? 'px-6 py-5 pr-14 pb-11 pl-10' : 'px-4 py-3 pr-12 pb-10 pl-9');

  const panelClass = ['so-arch-panel', featured ? 'so-arch-panel-featured' : ''].filter(Boolean).join(' ');

  return (
    <div className={panelClass}>
      <div className="so-arch-panel-frame" aria-hidden="true" />
      <div
        className={`so-arch-panel-body relative ${pad}`}
        style={{ backgroundColor: DARK_HEX.tooltipBg }}
      >
        <div className="so-arch-panel-fx" aria-hidden="true" />
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="absolute top-3 right-3 z-20 px-2 py-1 text-[9px] tracking-[0.2em] text-white/35 uppercase transition hover:text-white/70"
          >
            {strings.ui.skip}
          </button>
        )}
        {groupNav && (
          <>
            <button
              type="button"
              onClick={groupNav.onPrevious}
              disabled={!groupNav.canGoPrevious}
              aria-label={strings.ui.previous}
              className={`${CORNER_ARROW_CLASS} bottom-1.5 left-1.5`}
            >
              ‹
            </button>
            {groupNav.isLastInGroup ? (
              <button
                type="button"
                onClick={groupNav.onNext}
                disabled={!groupNav.canGoNext}
                className="absolute bottom-2.5 right-3 z-20 px-2 py-1 text-[9px] font-semibold tracking-[0.2em] text-sky-400/80 uppercase transition hover:text-sky-300 disabled:cursor-not-allowed disabled:text-white/25 disabled:hover:text-white/25"
              >
                {strings.ui.gotIt}
              </button>
            ) : (
              <button
                type="button"
                onClick={groupNav.onNext}
                disabled={!groupNav.canGoNext}
                aria-label={strings.ui.next}
                className={`${CORNER_ARROW_CLASS} bottom-1.5 right-1.5`}
              >
                ›
              </button>
            )}
          </>
        )}
        <div className={`relative z-[1] ${groupNav ? 'mb-2' : ''}`}>{children}</div>
      </div>
    </div>
  );
}

interface ArchChannelLabelProps {
  children: ReactNode;
}

export function ArchChannelLabel({ children }: ArchChannelLabelProps) {
  return (
    <p className="so-arch-channel-label text-[8px] tracking-[0.28em] text-white/35 uppercase">
      {children}
    </p>
  );
}

interface ArchRelayQuoteProps {
  children: ReactNode;
  intensity?: ArchChannelIntensity;
  className?: string;
}

export function ArchRelayQuote({
  children,
  intensity = 'normal',
  className = '',
}: ArchRelayQuoteProps) {
  const quoteClass = [
    'so-arch-relay-quote',
    intensity === 'heavy' ? 'so-arch-relay-quote-heavy' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={quoteClass}>
      <div className="so-arch-relay-rail" aria-hidden="true" />
      <div className="so-arch-relay-readout">{children}</div>
    </div>
  );
}
