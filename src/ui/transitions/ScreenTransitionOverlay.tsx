import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useGameStrings } from '../../i18n/useGameStrings';
import type { TransitionStrings } from '../../i18n/types';
import {
  useTransitionStore,
  type ArenaToHubPayload,
  type ScreenTransitionId,
} from '../../store/useTransitionStore';
import { DARK_HEX } from '../../theme/darkHexTerminal';
import { ArchGlitchLine } from '../arch/ArchGlitchText';
import { TerminalBackdrop } from '../TerminalBackdrop';
import {
  TRANSITION_ACK_MS,
  TRANSITION_DEFINITIONS,
  TRANSITION_LINE_STAGGER_MS,
  TRANSITION_TOTAL_MS,
  type TransitionLineKeys,
} from './transitionCatalog';

type TransitionLineKey = keyof Omit<
  TransitionStrings,
  'bootTitle' | 'shutdownTitle'
>;

function getTransitionLine(copy: TransitionStrings, key: string): string {
  return copy[key as TransitionLineKey];
}

function resolveLineKeys(
  id: ScreenTransitionId,
  payload: ArenaToHubPayload | undefined,
): TransitionLineKeys {
  const definition = TRANSITION_DEFINITIONS[id];
  if (id === 'arenaToHub' && payload?.reason === 'aborted' && definition.shutdownAbortedLineKeys) {
    return definition.shutdownAbortedLineKeys;
  }
  return definition.lineKeys;
}

function resolveAccentColor(id: ScreenTransitionId, payload: ArenaToHubPayload | undefined): string {
  if (id !== 'arenaToHub') return DARK_HEX.breachGlow;
  if (payload?.reason === 'victory') return DARK_HEX.gold;
  if (payload?.reason === 'meltdown') return DARK_HEX.breachGlow;
  return DARK_HEX.goldMuted;
}

export function ScreenTransitionOverlay() {
  const active = useTransitionStore((state) => state.active);
  const strings = useGameStrings();
  const [visibleLines, setVisibleLines] = useState(0);

  const lineKeys = useMemo(() => {
    if (!active) return null;
    const payload = active.id === 'arenaToHub' ? (active.payload as ArenaToHubPayload) : undefined;
    return resolveLineKeys(active.id, payload);
  }, [active]);

  const accentColor = useMemo(() => {
    if (!active) return DARK_HEX.breachGlow;
    const payload = active.id === 'arenaToHub' ? (active.payload as ArenaToHubPayload) : undefined;
    return resolveAccentColor(active.id, payload);
  }, [active]);

  const lineTexts = useMemo(() => {
    if (!lineKeys) return [];
    const copy = strings.transitions;
    return [
      getTransitionLine(copy, lineKeys.line1),
      getTransitionLine(copy, lineKeys.line2),
      getTransitionLine(copy, lineKeys.line3),
    ];
  }, [lineKeys, strings.transitions]);

  useEffect(() => {
    if (!active) {
      setVisibleLines(0);
      return;
    }

    setVisibleLines(0);
    const timers: number[] = [];

    for (let index = 0; index < 3; index += 1) {
      timers.push(
        window.setTimeout(() => {
          setVisibleLines(index + 1);
        }, TRANSITION_ACK_MS + index * TRANSITION_LINE_STAGGER_MS),
      );
    }

    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [active?.id, active?.payload]);

  if (!active || !lineKeys) return null;

  const phase = active.phase;
  const isHandoff = phase === 'handoff' || phase === 'reveal';
  const isBoot = active.id === 'hubToArena';
  const title = isBoot ? strings.transitions.bootTitle : strings.transitions.shutdownTitle;
  const activeLineIndex = Math.min(visibleLines, lineTexts.length) - 1;

  return (
    <div
      className={`pointer-events-auto absolute inset-0 z-50 so-screen-transition ${
        phase === 'reveal' ? 'so-screen-transition--reveal' : ''
      } ${isHandoff ? 'so-screen-transition--handoff' : ''}`}
      aria-hidden={false}
      aria-busy="true"
      style={{ '--so-transition-accent': accentColor } as CSSProperties}
    >
      <div className="so-screen-transition__veil absolute inset-0" aria-hidden />
      <TerminalBackdrop
        patternId="transitionHexGrid"
        variant={isBoot ? 'hub' : 'arena'}
      />
      <div className="so-screen-transition__handoff-pulse pointer-events-none absolute inset-0" aria-hidden />
      <div className="so-screen-transition__scanline pointer-events-none absolute inset-x-0 top-0" aria-hidden />

      <div className="so-screen-transition__hud pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-8 pt-8">
        <p className="so-arch-channel-label font-mono text-[12px] tracking-[0.32em] text-white/28 uppercase">
          {strings.arch.channelLabel}
        </p>
        <p
          className="so-font-display text-[12px] tracking-[0.34em] uppercase"
          style={{ color: accentColor }}
        >
          {isBoot ? 'NODE-0 // BOOT' : 'NODE-0 // STANDBY'}
        </p>
      </div>

      <div className="relative flex h-full w-full items-center px-8 pb-16 md:px-14">
        <div className="so-screen-transition__feed w-full max-w-3xl">
          <p
            className="so-screen-transition__title so-font-display mb-8 text-[15px] tracking-[0.42em] uppercase"
            style={{ color: accentColor }}
          >
            <ArchGlitchLine text={title} variant="title" quote={false} glitchChance={0.05} />
          </p>

          <div className="flex flex-col gap-4 border-l pl-5 font-mono text-[15px] leading-relaxed tracking-[0.1em] text-white/78 md:text-[16px]">
            {lineTexts.map((line, index) => {
              const isVisible = index < visibleLines;
              const isActive = isVisible && index === activeLineIndex && phase !== 'reveal';
              return (
                <div
                  key={`${active.id}-${lineKeys.line1}-${index}`}
                  className={`so-screen-transition__line flex gap-3 ${
                    isVisible ? 'so-screen-transition__line--visible' : ''
                  }`}
                  style={{ transitionDelay: `${index * TRANSITION_LINE_STAGGER_MS}ms` }}
                >
                  <span className="shrink-0 select-none" style={{ color: accentColor }}>
                    {'>'}
                  </span>
                  <span className="min-w-0">
                    {isVisible ? (
                      <ArchGlitchLine
                        text={line}
                        variant="dialogue"
                        quote={false}
                        glitchChance={0.06}
                        className="text-white/82"
                      />
                    ) : (
                      <span className="invisible" aria-hidden>
                        _
                      </span>
                    )}
                    {isActive && (
                      <span className="so-screen-transition__cursor ml-0.5 inline-block" aria-hidden>
                        _
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="so-screen-transition__progress pointer-events-none absolute inset-x-0 bottom-0 px-8 pb-7">
        <div className="h-px w-full overflow-hidden bg-white/[0.06]">
          <div
            className="so-screen-transition__progress-bar h-full origin-left"
            style={{
              backgroundColor: accentColor,
              animationDuration: `${TRANSITION_TOTAL_MS}ms`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
