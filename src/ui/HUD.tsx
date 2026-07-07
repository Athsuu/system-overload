import { useEffect, useRef, useState } from 'react';
import { getBreachCap } from '../game/runConfig';
import { overclockDisplayRef } from '../game/overclockDisplay';
import { REGULAR_WAVE_COUNT } from '../game/waveConfig';
import { useGameStrings } from '../i18n/useGameStrings';
import { useGameStore } from '../store/useGameStore';
import { BREACH_URGENT_THRESHOLD, DARK_HEX } from '../theme/darkHexTerminal';
import { SkillBranchIcon } from './skillTreeBranchIcons';
import { requestOverclockActivation } from '../game/overclockInput';
import { useRunTutorialSpotlightActive } from '../tutorial/useRunTutorialSpotlightActive';
import { OverclockButton } from './OverclockButton';
import { hexagonPoints } from './skillTreeGeometry';

const FLUX_COLOR = '#38bdf8';

function RunShardsBadge() {
  const runShards = useGameStore((state) => state.runShards);
  const strings = useGameStrings();

  return (
    <div
      data-tutorial-anchor="run-shards"
      className="pointer-events-none absolute top-6 right-6 z-20 flex flex-col items-end gap-1"
    >
      <p className="text-[9px] font-medium tracking-[0.25em] text-white/40 uppercase">
        {strings.currency.runShardsLabel}
      </p>
      <div className="relative flex h-14 w-14 items-center justify-center">
        <svg viewBox="0 0 56 56" className="absolute inset-0 h-full w-full">
          <polygon
            points={hexagonPoints(28, 28, 26)}
            fill="#120808"
            stroke={DARK_HEX.gold}
            strokeWidth={1}
            strokeOpacity={0.5}
          />
        </svg>
        <span className="relative font-mono text-sm font-semibold text-white">
          {runShards.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function FluxDriveToggle() {
  const fluxDriveLevel = useGameStore((state) => state.upgrades.fluxDrive);
  const fluxDriveEnabled = useGameStore((state) => state.fluxDriveEnabled);
  const toggleFluxDriveEnabled = useGameStore((state) => state.toggleFluxDriveEnabled);
  const strings = useGameStrings();
  const { fluxDriveLabel, fluxDriveOn, fluxDriveOff } = strings.hud;

  if (fluxDriveLevel <= 0) return null;

  const isOn = fluxDriveEnabled;
  const accent = isOn ? FLUX_COLOR : 'rgba(255,255,255,0.35)';

  return (
    <button
      type="button"
      aria-pressed={isOn}
      aria-label={isOn ? fluxDriveOn : fluxDriveOff}
      onClick={() => toggleFluxDriveEnabled()}
      className="pointer-events-auto absolute top-6 left-6 z-20 flex items-center gap-2 rounded border px-2 py-1.5 transition hover:brightness-110"
      style={{
        borderColor: isOn ? `${FLUX_COLOR}88` : 'rgba(255,255,255,0.12)',
        backgroundColor: isOn ? 'rgba(56,189,248,0.12)' : 'rgba(10,10,15,0.75)',
        boxShadow: isOn ? `0 0 14px ${FLUX_COLOR}33` : undefined,
      }}
    >
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
        <svg viewBox="0 0 36 36" className="absolute inset-0 h-full w-full" aria-hidden>
          <polygon
            points={hexagonPoints(18, 18, 16)}
            fill="#120808"
            stroke={accent}
            strokeWidth={1.25}
            strokeOpacity={isOn ? 0.9 : 0.45}
          />
        </svg>
        <span className="relative">
          <SkillBranchIcon branch="flux" size={18} color={accent} />
        </span>
      </div>
      <div className="flex flex-col items-start pr-1">
        <span className="text-[9px] tracking-[0.2em] text-white/40 uppercase">{fluxDriveLabel}</span>
        <span className="font-mono text-[10px] font-semibold" style={{ color: accent }}>
          {isOn ? fluxDriveOn : fluxDriveOff}
        </span>
      </div>
    </button>
  );
}

function WaveCounter() {
  const waveIndex = useGameStore((state) => state.waveIndex);
  const wavePhase = useGameStore((state) => state.wavePhase);
  const showWaveClear = useGameStore((state) => state.showWaveClear);
  const strings = useGameStrings();

  const isBoss = wavePhase === 'boss' || waveIndex > REGULAR_WAVE_COUNT;
  const currentWave = Math.min(waveIndex, REGULAR_WAVE_COUNT);
  const label = isBoss
    ? strings.ui.boss
    : `${strings.ui.wave} ${currentWave}/${REGULAR_WAVE_COUNT}`;

  return (
    <div className="pointer-events-none absolute top-6 left-1/2 z-20 -translate-x-1/2 text-center">
      {showWaveClear ? (
        <p
          key="wave-clear"
          className="so-animate-wave-clear text-xs tracking-[0.35em] uppercase"
          style={{ color: DARK_HEX.gold, textShadow: `0 0 20px ${DARK_HEX.breachGlow}44` }}
        >
          {strings.ui.waveClear}
        </p>
      ) : (
        <>
          <p
            className="text-[10px] tracking-[0.3em] uppercase"
            style={{ color: isBoss ? DARK_HEX.breach : DARK_HEX.goldMuted }}
          >
            {isBoss ? strings.ui.bossIncoming : label}
          </p>
          {!isBoss && (
            <p className="mt-0.5 font-mono text-sm text-white/70">{label}</p>
          )}
        </>
      )}
    </div>
  );
}

function PurgeControlsHint() {
  const runSpotlightActive = useRunTutorialSpotlightActive();
  const strings = useGameStrings();
  if (runSpotlightActive) return null;

  return (
    <div
      data-tutorial-anchor="purge-zone"
      className="pointer-events-none absolute bottom-24 left-6 z-20 text-[9px] tracking-[0.2em] text-white/30 uppercase"
    >
      <p style={{ color: DARK_HEX.goldMuted }}>{strings.ui.purgeZone}</p>
      <p className="mt-1 font-mono text-white/45">{strings.ui.mouse}</p>
    </div>
  );
}

function OverclockIndicator() {
  const gameState = useGameStore((state) => state.gameState);
  const overclockLevel = useGameStore((state) => state.upgrades.overclock);
  const runSpotlightActive = useRunTutorialSpotlightActive();
  const strings = useGameStrings();
  const [display, setDisplay] = useState(overclockDisplayRef);
  const [ringPercent, setRingPercent] = useState(0);
  const smoothedRef = useRef(0);

  useEffect(() => {
    if (overclockLevel <= 0 || gameState !== 'PLAYING') return;

    let frameId = 0;

    const loop = () => {
      const target = overclockDisplayRef.active
        ? 100
        : (1 - overclockDisplayRef.cooldownRatio) * 100;
      smoothedRef.current += (target - smoothedRef.current) * 0.18;
      setRingPercent(smoothedRef.current);
      setDisplay({ ...overclockDisplayRef });
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [gameState, overclockLevel]);

  if (overclockLevel <= 0) return null;

  const ready = !display.active && ringPercent >= 99.5;
  const canActivate = ready && !runSpotlightActive;

  const handleActivate = () => {
    if (!canActivate) return;
    requestOverclockActivation();
  };

  return (
    <div
      data-tutorial-anchor="overclock"
      className="pointer-events-auto absolute right-8 bottom-32 z-20"
    >
      <OverclockButton
        label={strings.ui.overclock}
        ringPercent={ringPercent}
        active={display.active}
        ready={ready}
        onActivate={handleActivate}
        disabled={!canActivate}
      />
    </div>
  );
}

function OverloadBar() {
  const breachProgress = useGameStore((state) => state.breachProgress);
  const upgrades = useGameStore((state) => state.upgrades);
  const strings = useGameStrings();
  const breachCap = getBreachCap(upgrades);
  const progressPercent = breachCap > 0 ? (breachProgress / breachCap) * 100 : 0;
  const isUrgent = progressPercent >= BREACH_URGENT_THRESHOLD;
  const { overloadLabel, overloadStable, overloadUrgent, overloadHint } = strings.hud;

  return (
    <div
      data-tutorial-anchor="overload-bar"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-20 border-t px-6 py-3"
      style={{ borderColor: DARK_HEX.lockedStroke, backgroundColor: 'rgba(10, 10, 15, 0.85)' }}
    >
      <div className="mb-2 flex items-center justify-between text-[10px] font-semibold tracking-[0.25em] uppercase">
        <span
          className={isUrgent ? 'so-animate-heat-label' : undefined}
          style={{ color: isUrgent ? DARK_HEX.breachGlow : DARK_HEX.gold }}
        >
          {overloadLabel}
        </span>
        <span
          className={`font-mono ${isUrgent ? 'so-animate-heat-label' : ''}`}
          style={{ color: isUrgent ? DARK_HEX.breach : 'rgba(255,255,255,0.55)' }}
        >
          {isUrgent ? overloadUrgent : overloadStable}
        </span>
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: '#1a0808' }}>
        <div
          className={`h-full rounded-full transition-all duration-150 ${isUrgent ? 'so-animate-heat-urgent' : ''}`}
          style={{
            width: `${Math.min(100, progressPercent)}%`,
            background: isUrgent
              ? `linear-gradient(90deg, ${DARK_HEX.gold}, ${DARK_HEX.breach}, #ef4444)`
              : `linear-gradient(90deg, ${DARK_HEX.lockedStroke}, ${DARK_HEX.breach})`,
            boxShadow: isUrgent ? `0 0 12px ${DARK_HEX.breach}66` : undefined,
          }}
        />
      </div>
      <p className="mt-1.5 text-center text-[9px] tracking-[0.2em] text-white/30 uppercase">
        {Math.round(progressPercent)}% · {overloadHint}
      </p>
    </div>
  );
}

export function HUD() {
  return (
    <>
      <RunShardsBadge />
      <FluxDriveToggle />
      <WaveCounter />
      <PurgeControlsHint />
      <OverclockIndicator />
      <OverloadBar />
    </>
  );
}
