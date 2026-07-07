import { useGameStore } from '../store/useGameStore';
import { markTutorialSignal } from '../tutorial/tutorialSignals';
import { DARK_HEX } from '../theme/darkHexTerminal';
import { useGameStrings } from '../i18n/useGameStrings';
import { ArchRelayQuote } from './ArchChannelPanel';
import { ArchGlitchLine, ArchGlitchText } from './ArchGlitchText';
import { HexActionButton } from './HexActionButton';
import { useCountUp } from './useCountUp';

export function RunEndScreen() {
  const lastRunShards = useGameStore((state) => state.lastRunShards);
  const lastRunAnchorFragments = useGameStore((state) => state.lastRunAnchorFragments);
  const anchorFragmentEarnedThisRun = useGameStore((state) => state.anchorFragmentEarnedThisRun);
  const bankAnchorFragments = useGameStore((state) => state.bankAnchorFragments);
  const runOutcome = useGameStore((state) => state.runOutcome);
  const waveIndex = useGameStore((state) => state.waveIndex);
  const prestigeUnlockedThisRun = useGameStore((state) => state.prestigeUnlockedThisRun);
  const openSkillTree = useGameStore((state) => state.openSkillTree);
  const startRun = useGameStore((state) => state.startRun);

  const strings = useGameStrings();

  const isVictory = runOutcome === 'victory_boss';
  const title = isVictory ? strings.runEnd.victoryTitle : strings.runEnd.meltdownTitle;
  const subtitle = isVictory
    ? `${strings.runEnd.victorySubtitle} · ${strings.ui.wave} ${waveIndex}`
    : strings.runEnd.meltdownSubtitle;
  const displayShards = useCountUp(lastRunShards, 600);
  const displayAnchors = useCountUp(lastRunAnchorFragments, 600);
  const showFirstAnchorArch =
    anchorFragmentEarnedThisRun && bankAnchorFragments === lastRunAnchorFragments;

  const handleStartRun = () => {
    markTutorialSignal('runsStarted');
    startRun();
  };

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center">
      <div
        className="so-animate-fade-in-slow absolute inset-0"
        style={{
          backgroundColor: isVictory ? 'rgba(10, 10, 15, 0.82)' : 'rgba(8, 4, 4, 0.9)',
        }}
      />
      <div
        className="so-animate-fade-in-slow absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${isVictory ? DARK_HEX.vignette : 'rgba(255, 40, 0, 0.12)'} 0%, transparent 65%)`,
        }}
      />

      <div
        className="relative w-full max-w-sm border px-8 py-8 text-center"
        style={{
          backgroundColor: DARK_HEX.tooltipBg,
          borderColor: isVictory ? DARK_HEX.tooltipBorder : DARK_HEX.breach,
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${isVictory ? DARK_HEX.gold : DARK_HEX.breach}, transparent)`,
          }}
        />

        <h2
          className="so-font-display so-animate-reveal-title text-lg font-semibold uppercase"
          style={{
            color: isVictory ? DARK_HEX.gold : DARK_HEX.breach,
          }}
        >
          {title}
        </h2>

        <p className="so-animate-reveal-step-1 mt-2 max-w-xs text-[10px] leading-relaxed tracking-[0.08em] text-white/45">
          {subtitle}
        </p>

        {isVictory && (
          <ArchRelayQuote className="so-animate-reveal-step-1 mx-auto max-w-xs">
            <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(56, 189, 248, 0.65)' }}>
              <ArchGlitchText text={strings.runEnd.victoryArch} />
            </p>
          </ArchRelayQuote>
        )}
        {!isVictory && (
          <ArchRelayQuote className="so-animate-reveal-step-1 mx-auto max-w-xs" intensity="heavy">
            <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(56, 189, 248, 0.45)' }}>
              <ArchGlitchLine text={strings.arch.name} variant="title" />:{' '}
              <ArchGlitchText
                text={strings.runEnd.meltdownArch}
                intensity="heavy"
                quote={false}
              />
            </p>
          </ArchRelayQuote>
        )}

        <p className="so-animate-reveal-step-2 mt-4 font-mono text-2xl font-semibold text-white">
          +{displayShards.toLocaleString()} {strings.currency.shardsEarnedSuffix}
        </p>
        {lastRunAnchorFragments > 0 && (
          <p
            className="so-animate-reveal-step-2 mt-2 font-mono text-lg font-semibold"
            style={{ color: DARK_HEX.breachGlow }}
          >
            +{displayAnchors.toLocaleString()} {strings.currency.anchorEarnedSuffix}
          </p>
        )}
        <p className="so-animate-reveal-step-2 mt-2 text-[10px] tracking-[0.25em] text-white/40 uppercase">
          {strings.currency.transferredToVault}
        </p>

        {showFirstAnchorArch && (
          <ArchRelayQuote className="so-animate-reveal-step-2 mx-auto mt-3 max-w-xs">
            <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(56, 189, 248, 0.6)' }}>
              <ArchGlitchText text={strings.runEnd.firstAnchorArch} />
            </p>
          </ArchRelayQuote>
        )}

        {prestigeUnlockedThisRun && (
          <>
            <p
              className="so-animate-reveal-step-2 mt-4 text-[10px] tracking-[0.25em] uppercase"
              style={{ color: DARK_HEX.goldMuted }}
            >
              {strings.runEnd.prestigeUnlocked}
            </p>
            <ArchRelayQuote className="so-animate-reveal-step-2 mx-auto max-w-xs">
              <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(56, 189, 248, 0.6)' }}>
                <ArchGlitchText text={strings.runEnd.prestigeArch} />
              </p>
            </ArchRelayQuote>
          </>
        )}

        <div className="so-animate-reveal-step-3 mt-8 flex items-center justify-center gap-4">
          <HexActionButton
            label={strings.ui.skillTree}
            onClick={openSkillTree}
            variant="secondary"
          />
          <HexActionButton label={strings.ui.startRun} onClick={handleStartRun} variant="primary" />
        </div>
      </div>
    </div>
  );
}
