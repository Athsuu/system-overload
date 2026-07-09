import { useEffect, useRef, useState } from 'react';
import { getBreachPercent } from '../game/runConfig';
import { overclockDisplayRef, requestOverclockActivation } from '../game/overclock';
import { REGULAR_WAVE_COUNT } from '../game/waveConfig';
import { useGameStrings } from '../i18n/useGameStrings';
import { useGameStore } from '../store/useGameStore';
import { isOverclockUnlocked } from '../store/upgradeCatalog';
import { BREACH_URGENT_THRESHOLD, DARK_HEX } from '../theme/darkHexTerminal';
import { useRunTutorialSpotlightActive } from '../tutorial/useRunTutorialSpotlightActive';
import { OverclockButton } from './OverclockButton';
import { ArchRunDialogue } from './ArchRunDialogue';

function FluxDriveToggle() {
  return null;
}

function WaveCounter() {
  const activeCycle = useGameStore((state) => state.activeCycle);
  const waveIndex = useGameStore((state) => state.waveIndex);
  const wavePhase = useGameStore((state) => state.wavePhase);
  const showWaveClear = useGameStore((state) => state.showWaveClear);
  const strings = useGameStrings();

  const isBoss = wavePhase === 'boss' || waveIndex > REGULAR_WAVE_COUNT;
  const currentWave = Math.min(waveIndex, REGULAR_WAVE_COUNT);
  const label = isBoss
    ? strings.ui.cycleBossFormat.replace('{cycle}', String(activeCycle))
    : strings.ui.cycleWaveFormat
        .replace('{cycle}', String(activeCycle))
        .replace('{wave}', String(currentWave))
        .replace('{max}', String(REGULAR_WAVE_COUNT));

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
        <p
          className={`tracking-[0.3em] uppercase ${
            isBoss ? 'text-[14px]' : 'font-mono text-sm normal-case tracking-wide text-white/70'
          }`}
          style={{ color: isBoss ? DARK_HEX.breach : DARK_HEX.goldMuted }}
        >
          {isBoss ? strings.ui.bossIncoming : label}
        </p>
      )}
    </div>
  );
}

function OverclockIndicator() {
  const gameState = useGameStore((state) => state.gameState);
  const upgrades = useGameStore((state) => state.upgrades);
  const overclockUnlocked = isOverclockUnlocked(upgrades);
  const runSpotlightActive = useRunTutorialSpotlightActive();
  const strings = useGameStrings();
  const [display, setDisplay] = useState(overclockDisplayRef);
  const [ringPercent, setRingPercent] = useState(0);
  const smoothedRef = useRef(0);

  useEffect(() => {
    if (!overclockUnlocked || gameState !== 'PLAYING') return;

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
  }, [gameState, overclockUnlocked]);

  if (!overclockUnlocked) return null;

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
  const progressPercent = getBreachPercent(breachProgress, upgrades);
  const isUrgent = progressPercent >= BREACH_URGENT_THRESHOLD;
  const { overloadLabel } = strings.hud;

  return (
    <div
      data-tutorial-anchor="overload-bar"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-6 py-3"
    >
      <div className="relative mb-1.5">
        <span
          className={`absolute top-1/2 left-0 -translate-y-1/2 text-[14px] font-semibold tracking-[0.25em] uppercase ${
            isUrgent ? 'so-animate-heat-label' : ''
          }`}
          style={{ color: isUrgent ? DARK_HEX.breachGlow : DARK_HEX.gold }}
        >
          {overloadLabel}
        </span>
        <p
          className={`text-center font-mono text-sm font-semibold tracking-wide ${
            isUrgent ? 'so-animate-heat-label' : ''
          }`}
          style={{ color: isUrgent ? DARK_HEX.breach : 'rgba(255,255,255,0.7)' }}
        >
          {`${Math.round(progressPercent)}%`}
        </p>
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
    </div>
  );
}

export function HUD() {
  return (
    <>
      <FluxDriveToggle />
      <WaveCounter />
      <OverclockIndicator />
      <ArchRunDialogue />
      <OverloadBar />
    </>
  );
}
