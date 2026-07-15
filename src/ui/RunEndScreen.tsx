import { useEffect, useState } from 'react';
import { REGULAR_WAVE_COUNT } from '../game/waveConfig';
import { useGameStore } from '../store/useGameStore';
import { canRecompile } from '../store/prestigeLogic';
import { markTutorialSignal } from '../tutorial/tutorialSignals';
import { DARK_HEX } from '../theme/darkHexTerminal';
import { useGameStrings } from '../i18n/useGameStrings';
import { ArchRunEndRelay } from './arch/ArchRunEndRelay';
import { HexActionButton } from './shared/HexActionButton';
import { pickMeltdownArchVariantIndex } from './arch/meltdownArchRotation';
import { pickVictoryArchVariantIndex } from './arch/victoryArchRotation';
import { useCountUp } from './shared/useCountUp';
import { useScreenTransition } from './transitions/useScreenTransition';
import { RecompileConfirmModal } from './RecompileConfirmModal';
import { SEED_PROTOCOL_VISUAL } from './seedProtocolTheme';

export function RunEndScreen() {
  const lastRunShards = useGameStore((state) => state.lastRunShards);
  const lastRunAnchorFragments = useGameStore((state) => state.lastRunAnchorFragments);
  const anchorFragmentEarnedThisRun = useGameStore((state) => state.anchorFragmentEarnedThisRun);
  const runOutcome = useGameStore((state) => state.runOutcome);
  const activeCycle = useGameStore((state) => state.activeCycle);
  const cyclesCleared = useGameStore((state) => state.cyclesCleared);
  const waveIndex = useGameStore((state) => state.waveIndex);
  const selectedCycle = useGameStore((state) => state.selectedCycle);
  const { launchHubToArena, launchArenaToHub, isTransitioning } = useScreenTransition();

  const strings = useGameStrings();
  const [meltdownArchText, setMeltdownArchText] = useState<string | null>(null);
  const [victoryArchText, setVictoryArchText] = useState<string | null>(null);
  const [recompileOpen, setRecompileOpen] = useState(false);

  const isVictory = runOutcome === 'victory_boss';
  const title = isVictory ? strings.runEnd.victoryTitle : strings.runEnd.meltdownTitle;
  const subtitle = isVictory
    ? strings.runEnd.victorySubtitle
    : strings.runEnd.meltdownSubtitle;
  const isBossWave = waveIndex > REGULAR_WAVE_COUNT;
  const waveLine = isBossWave
    ? strings.ui.cycleBossFormat.replace('{cycle}', String(activeCycle))
    : strings.ui.cycleWaveFormat
        .replace('{cycle}', String(activeCycle))
        .replace('{wave}', String(Math.min(waveIndex, REGULAR_WAVE_COUNT)))
        .replace('{max}', String(REGULAR_WAVE_COUNT));
  const displayShards = useCountUp(lastRunShards, 600);
  const displayAnchors = useCountUp(lastRunAnchorFragments, 600);
  const showRewards = lastRunShards > 0 || lastRunAnchorFragments > 0;

  const showRecompileBanner = isVictory && canRecompile(cyclesCleared);

  const accentColor = isVictory ? DARK_HEX.gold : DARK_HEX.breach;
  const accentGlow = isVictory ? DARK_HEX.goldMuted : 'rgba(255, 77, 0, 0.22)';

  useEffect(() => {
    if (runOutcome !== 'defeat_breach') {
      setMeltdownArchText(null);
      return;
    }
    const index = pickMeltdownArchVariantIndex();
    setMeltdownArchText(strings.runEnd.meltdownArchVariants[index]);
  }, [runOutcome, lastRunShards, waveIndex, strings.runEnd.meltdownArchVariants]);

  useEffect(() => {
    if (runOutcome !== 'victory_boss') {
      setVictoryArchText(null);
      return;
    }
    const index = pickVictoryArchVariantIndex(anchorFragmentEarnedThisRun);
    setVictoryArchText(strings.runEnd.victoryArchVariants[index]);
  }, [runOutcome, anchorFragmentEarnedThisRun, strings.runEnd.victoryArchVariants]);

  const handleStartRun = () => {
    if (isTransitioning) return;
    markTutorialSignal('runsStarted');
    launchHubToArena(selectedCycle);
  };

  const handleOpenModuleTree = () => {
    if (isTransitioning) return;
    const reason = isVictory ? 'victory' : 'meltdown';
    launchArenaToHub(reason);
  };

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center px-4">
      <div
        className="so-animate-fade-in-slow absolute inset-0"
        style={{
          backgroundColor: isVictory ? 'rgba(10, 10, 15, 0.72)' : 'rgba(8, 4, 4, 0.78)',
        }}
      />
      <div
        className="so-animate-fade-in-slow absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 42%, ${isVictory ? DARK_HEX.vignette : 'rgba(255, 40, 0, 0.14)'} 0%, transparent 68%)`,
        }}
      />

      <div
        className={`so-run-end-panel so-animate-fade-in-slow relative w-full max-w-md px-8 py-9 text-center ${
          isVictory ? 'so-run-end-panel--victory' : 'so-run-end-panel--meltdown'
        }`}
        style={{
          backgroundColor: isVictory ? 'rgba(19, 16, 24, 0.82)' : 'rgba(19, 10, 10, 0.84)',
          borderColor: accentColor,
          boxShadow: `0 0 0 1px ${accentGlow}, 0 28px 56px rgba(0, 0, 0, 0.62)`,
        }}
      >
        <div
          className="so-run-end-panel-accent absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          }}
        />
        <div className="so-run-end-panel-scanlines pointer-events-none absolute inset-0" aria-hidden="true" />

        <p
          className="so-animate-reveal-step-1 text-[13px] tracking-[0.34em] text-white/30 uppercase"
        >
          {waveLine}
        </p>

        <h2
          className="so-font-display so-animate-reveal-title mt-2 text-xl font-semibold tracking-[0.18em] uppercase"
          style={{ color: accentColor }}
        >
          {title}
        </h2>

        <p className="so-animate-reveal-step-1 mx-auto mt-2 max-w-sm text-[15px] leading-relaxed tracking-[0.06em] text-white/50">
          {subtitle}
        </p>

        {showRewards && (
          <div className="so-animate-reveal-step-2 mt-6 border-t border-white/[0.06] pt-5">
            {lastRunShards > 0 && (
              <p className="font-mono text-2xl font-semibold text-white">
                +{displayShards.toLocaleString()} {strings.currency.shardsEarnedSuffix}
              </p>
            )}
            {lastRunAnchorFragments > 0 && (
              <p
                className={`font-mono text-lg font-semibold ${lastRunShards > 0 ? 'mt-2' : ''}`}
                style={{ color: DARK_HEX.breachGlow }}
              >
                +{displayAnchors.toLocaleString()} {strings.currency.anchorEarnedSuffix}
              </p>
            )}
            <p className="mt-2 text-[14px] tracking-[0.25em] text-white/38 uppercase">
              {strings.currency.transferredToVault}
            </p>
          </div>
        )}

        {showRecompileBanner && (
          <div
            className="so-animate-reveal-step-2 mt-6 border-t border-white/[0.06] pt-5"
            style={{ borderColor: `${SEED_PROTOCOL_VISUAL.accent}33` }}
          >
            <p
              className="text-[13px] tracking-[0.28em] uppercase"
              style={{ color: SEED_PROTOCOL_VISUAL.accentMuted }}
            >
              {strings.seedProtocols.recompileAvailable}
            </p>
            <button
              type="button"
              onClick={() => setRecompileOpen(true)}
              className="mt-3 rounded border px-4 py-2 text-[13px] font-semibold tracking-[0.2em] uppercase transition hover:opacity-90"
              style={{
                borderColor: `${SEED_PROTOCOL_VISUAL.accent}88`,
                color: SEED_PROTOCOL_VISUAL.accentMuted,
              }}
            >
              {strings.seedProtocols.recompileAction}
            </button>
          </div>
        )}

        <div className="so-animate-reveal-step-3 mt-8 flex items-center justify-center gap-4">
          <HexActionButton
            label={strings.ui.moduleTree}
            onClick={handleOpenModuleTree}
            variant="secondary"
            disabled={isTransitioning}
          />
          <HexActionButton
            label={strings.ui.startRun}
            onClick={handleStartRun}
            clickSound="startRun"
            variant="primary"
            disabled={isTransitioning}
          />
        </div>
      </div>

      {(victoryArchText || meltdownArchText) && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[5rem] z-[23] flex flex-col items-center gap-8 px-6">
          {victoryArchText && (
            <ArchRunEndRelay
              lineKey={`victory-arch-${victoryArchText.slice(0, 12)}`}
              text={victoryArchText}
            />
          )}
          {meltdownArchText && (
            <ArchRunEndRelay
              lineKey={`meltdown-arch-${meltdownArchText.slice(0, 12)}`}
              text={meltdownArchText}
            />
          )}
        </div>
      )}
      {recompileOpen && <RecompileConfirmModal onClose={() => setRecompileOpen(false)} />}
    </div>
  );
}
