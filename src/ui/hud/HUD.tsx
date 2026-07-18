import { useEffect, useState } from 'react';
import { getBreachPercent } from '../../game/runConfig';
import { formatRunElapsedMs, runElapsedMsRef } from '../../game/runElapsed';
import { overclockDisplayRef, requestOverclockActivation } from '../../game/overclock';
import { BOSS_KILL_THRESHOLD } from '../../game/horde';
import { useGameStrings } from '../../i18n/useGameStrings';
import { useGameStore } from '../../store/useGameStore';
import { isFluxDriveUnlocked, isOverclockUnlocked } from '../../store/prestigeUnlocks';
import { BREACH_URGENT_THRESHOLD, DARK_HEX } from '../../theme/darkHexTerminal';
import { useRunTutorialSpotlightActive } from '../../tutorial/useRunTutorialSpotlightActive';
import { OverclockButton } from './OverclockButton';
import { ArchRunDialogue } from '../arch/ArchRunDialogue';

function FluxDriveToggle() {
  const gameState = useGameStore((state) => state.gameState);
  const coreProtocols = useGameStore((state) => state.coreProtocols);
  const fluxDriveEnabled = useGameStore((state) => state.fluxDriveEnabled);
  const toggleFluxDriveEnabled = useGameStore((state) => state.toggleFluxDriveEnabled);
  const strings = useGameStrings();

  if (!isFluxDriveUnlocked(coreProtocols) || gameState !== 'PLAYING') return null;

  return (
    <div
      data-tutorial-anchor="flux-drive"
      className="pointer-events-auto absolute left-8 bottom-32 z-20 flex flex-col items-start gap-2"
    >
      <span
        className="text-[14px] font-semibold tracking-[0.22em] uppercase"
        style={{ color: fluxDriveEnabled ? DARK_HEX.breachGlow : DARK_HEX.gold }}
      >
        {strings.hud.fluxDriveLabel}
      </span>
      <button
        type="button"
        onClick={toggleFluxDriveEnabled}
        className="rounded border px-4 py-1.5 text-xs font-bold tracking-[0.18em] uppercase transition hover:scale-[1.04] active:scale-[0.98]"
        style={{
          borderColor: fluxDriveEnabled ? DARK_HEX.breachGlow : DARK_HEX.lockedStroke,
          color: fluxDriveEnabled ? DARK_HEX.breachGlow : 'rgba(255,255,255,0.6)',
          backgroundColor: '#1a0808',
          boxShadow: fluxDriveEnabled ? `0 0 12px ${DARK_HEX.breachGlow}55` : undefined,
        }}
      >
        {fluxDriveEnabled ? strings.hud.fluxDriveOn : strings.hud.fluxDriveOff}
      </button>
    </div>
  );
}

function KillCounter() {
  const gameState = useGameStore((state) => state.gameState);
  const activeCycle = useGameStore((state) => state.activeCycle);
  const runKills = useGameStore((state) => state.runKills);
  const runPhase = useGameStore((state) => state.runPhase);
  const strings = useGameStrings();
  const [elapsedLabel, setElapsedLabel] = useState('00:00');

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    setElapsedLabel(formatRunElapsedMs(runElapsedMsRef.value));

    let frameId = 0;
    const loop = () => {
      setElapsedLabel(formatRunElapsedMs(runElapsedMsRef.value));
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [gameState]);

  const isBoss = runPhase === 'boss';
  const label = isBoss
    ? strings.ui.cycleBossFormat.replace('{cycle}', String(activeCycle))
    : strings.ui.cycleKillFormat
        .replace('{cycle}', String(activeCycle))
        .replace('{kills}', String(runKills))
        .replace('{max}', String(BOSS_KILL_THRESHOLD));

  const statusClass = 'text-sm tracking-[0.3em] uppercase';
  const statusColor = isBoss ? DARK_HEX.breach : DARK_HEX.goldMuted;

  return (
    <div className="pointer-events-none absolute top-6 left-1/2 z-20 -translate-x-1/2 text-center">
      <p className={statusClass} style={{ color: statusColor }}>
        {isBoss ? strings.ui.bossIncoming : label}
      </p>
      <p className={`mt-1 ${statusClass}`} style={{ color: DARK_HEX.goldMuted }}>
        {elapsedLabel}
      </p>
    </div>
  );
}

function OverclockIndicator() {
  const gameState = useGameStore((state) => state.gameState);
  const coreProtocols = useGameStore((state) => state.coreProtocols);
  const overclockUnlocked = isOverclockUnlocked(coreProtocols);
  const runSpotlightActive = useRunTutorialSpotlightActive();
  const strings = useGameStrings();
  const [display, setDisplay] = useState(overclockDisplayRef);

  useEffect(() => {
    if (!overclockUnlocked || gameState !== 'PLAYING') return;

    let frameId = 0;

    const loop = () => {
      setDisplay({ ...overclockDisplayRef });
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [gameState, overclockUnlocked]);

  if (!overclockUnlocked) return null;

  const ringPercent = display.active ? display.activeRatio * 100 : display.chargeRatio * 100;
  const ready = !display.active && display.chargeRatio >= 0.999;
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
      <KillCounter />
      <OverclockIndicator />
      <ArchRunDialogue />
      <OverloadBar />
    </>
  );
}
