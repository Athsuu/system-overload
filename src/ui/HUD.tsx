import { useEffect, useRef, useState } from 'react';
import { getBreachCap } from '../game/runConfig';
import { overclockDisplayRef } from '../game/overclockDisplay';
import { REGULAR_WAVE_COUNT } from '../game/waveConfig';
import { useGameStore } from '../store/useGameStore';
import { BREACH_URGENT_THRESHOLD, DARK_HEX } from '../theme/darkHexTerminal';
import { GAME_NARRATIVE } from './gameNarrative';
import { hexagonPoints } from './skillTreeGeometry';

function RunShardsBadge() {
  const runShards = useGameStore((state) => state.runShards);

  return (
    <div className="pointer-events-none absolute top-6 right-6 z-20 flex flex-col items-end gap-1">
      <p className="text-[9px] font-medium tracking-[0.25em] text-white/40 uppercase">
        {GAME_NARRATIVE.currency.runShardsLabel}
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

function RunLevelBadge() {
  const runLevel = useGameStore((state) => state.runLevel);
  const runXp = useGameStore((state) => state.runXp);
  const runXpToNext = useGameStore((state) => state.runXpToNext);
  const xpPercent = runXpToNext > 0 ? (runXp / runXpToNext) * 100 : 0;

  return (
    <div className="pointer-events-none absolute top-6 left-6 z-20 w-40">
      <div className="mb-1 flex items-center justify-between text-[9px] tracking-[0.2em] uppercase">
        <span style={{ color: DARK_HEX.gold }}>Level {runLevel}</span>
        <span className="font-mono text-white/40">
          {runXp}/{runXpToNext}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full" style={{ backgroundColor: '#1a0808' }}>
        <div
          className="h-full rounded-full transition-all duration-150"
          style={{
            width: `${xpPercent}%`,
            background: `linear-gradient(90deg, ${DARK_HEX.lockedStroke}, ${DARK_HEX.gold})`,
          }}
        />
      </div>
    </div>
  );
}

function WaveCounter() {
  const waveIndex = useGameStore((state) => state.waveIndex);
  const wavePhase = useGameStore((state) => state.wavePhase);
  const showWaveClear = useGameStore((state) => state.showWaveClear);

  const isBoss = wavePhase === 'boss' || waveIndex > REGULAR_WAVE_COUNT;
  const label = isBoss ? 'BOSS' : `Wave ${Math.min(waveIndex, REGULAR_WAVE_COUNT)}/${REGULAR_WAVE_COUNT}`;

  return (
    <div className="pointer-events-none absolute top-6 left-1/2 z-20 -translate-x-1/2 text-center">
      {showWaveClear ? (
        <p
          key="wave-clear"
          className="so-animate-wave-clear text-xs tracking-[0.35em] uppercase"
          style={{ color: DARK_HEX.gold, textShadow: `0 0 20px ${DARK_HEX.breachGlow}44` }}
        >
          Wave Clear
        </p>
      ) : (
        <>
          <p
            className="text-[10px] tracking-[0.3em] uppercase"
            style={{ color: isBoss ? DARK_HEX.breach : DARK_HEX.goldMuted }}
          >
            {isBoss ? 'Boss Incoming' : label}
          </p>
          {!isBoss && (
            <p className="mt-0.5 font-mono text-sm text-white/70">{label}</p>
          )}
        </>
      )}
    </div>
  );
}

function WasdControlsHint() {
  return (
    <div className="pointer-events-none absolute bottom-24 left-6 z-20 text-[9px] tracking-[0.2em] text-white/30 uppercase">
      <p style={{ color: DARK_HEX.goldMuted }}>Move</p>
      <p className="mt-1 font-mono text-white/45">W A S D</p>
    </div>
  );
}

function OverclockIndicator() {
  const gameState = useGameStore((state) => state.gameState);
  const [display, setDisplay] = useState(overclockDisplayRef);
  const [ringPercent, setRingPercent] = useState(0);
  const smoothedRef = useRef(0);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

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
  }, [gameState]);

  return (
    <div className="pointer-events-none absolute right-6 bottom-24 z-20 flex flex-col items-end gap-1">
      <p className="text-[9px] tracking-[0.2em] text-white/35 uppercase">Overclock</p>
      <p className="text-[9px] tracking-[0.15em] text-white/25 uppercase">[Space]</p>
      <div className="relative flex h-10 w-10 items-center justify-center">
        <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="20" cy="20" r="17" fill="none" stroke="#1a0808" strokeWidth="2" />
          <circle
            cx="20"
            cy="20"
            r="17"
            fill="none"
            stroke={display.active ? DARK_HEX.breach : DARK_HEX.gold}
            strokeWidth="2"
            strokeDasharray={`${(ringPercent / 100) * 106.8} 106.8`}
            strokeLinecap="round"
            style={{ transition: 'stroke 150ms ease-out' }}
          />
        </svg>
        <span
          className="relative text-[10px] font-bold tracking-wider"
          style={{ color: display.active ? DARK_HEX.breach : DARK_HEX.gold }}
        >
          OC
        </span>
      </div>
    </div>
  );
}

function OverloadBar() {
  const breachProgress = useGameStore((state) => state.breachProgress);
  const upgrades = useGameStore((state) => state.upgrades);
  const breachCap = getBreachCap(upgrades);
  const progressPercent = breachCap > 0 ? (breachProgress / breachCap) * 100 : 0;
  const isUrgent = progressPercent >= BREACH_URGENT_THRESHOLD;
  const { overloadLabel, overloadStable, overloadUrgent, overloadHint } = GAME_NARRATIVE.hud;

  return (
    <div
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
      <RunLevelBadge />
      <WaveCounter />
      <WasdControlsHint />
      <OverclockIndicator />
      <OverloadBar />
    </>
  );
}
