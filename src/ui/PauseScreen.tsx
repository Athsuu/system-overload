import { useState } from 'react';
import { getBreachCap } from '../game/runConfig';
import { useSettingsStore } from '../store/useSettingsStore';
import { useGameStore } from '../store/useGameStore';
import { DARK_HEX } from '../theme/darkHexTerminal';
import { useGameStrings } from '../i18n/useGameStrings';
import { HexActionButton } from './HexActionButton';
import { SettingsPanel } from './SettingsPanel';

export function PauseScreen() {
  const breachProgress = useGameStore((state) => state.breachProgress);
  const waveIndex = useGameStore((state) => state.waveIndex);
  const runShards = useGameStore((state) => state.runShards);
  const upgrades = useGameStore((state) => state.upgrades);
  const resumeRun = useGameStore((state) => state.resumeRun);
  const abortRun = useGameStore((state) => state.abortRun);
  const isSettingsOpen = useSettingsStore((state) => state.isOpen);
  const openSettings = useSettingsStore((state) => state.openSettings);

  const [confirmAbort, setConfirmAbort] = useState(false);
  const breachCap = getBreachCap(upgrades);
  const breachPercent = Math.round((breachProgress / breachCap) * 100);

  const strings = useGameStrings();

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center">
      <div
        className="so-animate-fade-in-slow absolute inset-0"
        style={{ backgroundColor: 'rgba(8, 8, 12, 0.88)' }}
      />
      <div
        className="so-animate-fade-in-slow absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 55% 45% at 50% 50%, ${DARK_HEX.vignette} 0%, transparent 70%)`,
        }}
      />

      {isSettingsOpen ? (
        <SettingsPanel />
      ) : (
        <div
          className="relative w-full max-w-sm border px-8 py-8 text-center"
          style={{
            backgroundColor: DARK_HEX.tooltipBg,
            borderColor: DARK_HEX.tooltipBorder,
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${DARK_HEX.gold}, transparent)`,
            }}
          />

          <h2
            className="so-font-display so-animate-reveal-title text-lg font-semibold uppercase"
            style={{
              color: DARK_HEX.gold,
            }}
          >
            {strings.pause.title}
          </h2>

          <p className="so-animate-reveal-step-1 mt-2 text-[10px] italic leading-relaxed tracking-[0.06em] text-white/45">
            {strings.pause.subtitle}
          </p>

          <div className="so-animate-reveal-step-2 mt-6 flex justify-center gap-6 font-mono text-[10px] tracking-wider text-white/40 uppercase">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-white/30">{strings.pause.statBreach}</span>
              <span className="text-sm text-white/70">{breachPercent}%</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-white/30">{strings.pause.statWave}</span>
              <span className="text-sm text-white/70">{waveIndex}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-white/30">{strings.pause.statShards}</span>
              <span className="text-sm text-white/70">{runShards.toLocaleString()}</span>
            </div>
          </div>

          {confirmAbort ? (
            <div className="so-animate-reveal-step-3 mt-8">
              <p className="mb-4 text-[10px] leading-relaxed tracking-[0.06em] text-white/50">
                {strings.pause.confirmPrompt}
              </p>
              <div className="flex items-center justify-center gap-4">
                <HexActionButton
                  label={strings.pause.confirmNo}
                  onClick={() => setConfirmAbort(false)}
                  size="md"
                  variant="secondary"
                />
                <HexActionButton
                  label={strings.pause.confirmYes}
                  onClick={abortRun}
                  size="md"
                  variant="primary"
                />
              </div>
            </div>
          ) : (
            <div className="so-animate-reveal-step-3 mt-8 flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-4">
                <HexActionButton
                  label={strings.pause.abortLabel}
                  onClick={() => setConfirmAbort(true)}
                  size="md"
                  variant="secondary"
                />
                <HexActionButton
                  label={strings.pause.resumeLabel}
                  onClick={resumeRun}
                  size="md"
                  variant="primary"
                />
              </div>
              <HexActionButton
                label={strings.pause.settingsLabel}
                onClick={openSettings}
                size="md"
                variant="secondary"
              />
            </div>
          )}

          <p className="mt-6 text-[9px] tracking-[0.2em] text-white/25 uppercase">{strings.pause.escHint}</p>
        </div>
      )}
    </div>
  );
}
