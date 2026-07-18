import { useState } from 'react';
import { BOSS_KILL_THRESHOLD } from '../../game/horde';
import { getBreachPercent } from '../../game/runConfig';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useGameStore } from '../../store/useGameStore';
import { DARK_HEX } from '../../theme/darkHexTerminal';
import { useGameStrings } from '../../i18n/useGameStrings';
import { HexActionButton } from '../shared/HexActionButton';
import { SettingsPanel } from '../settings/SettingsPanel';
import { useScreenTransition } from '../transitions/useScreenTransition';

export function PauseScreen() {
  const breachProgress = useGameStore((state) => state.breachProgress);
  const activeCycle = useGameStore((state) => state.activeCycle);
  const runKills = useGameStore((state) => state.runKills);
  const runPhase = useGameStore((state) => state.runPhase);
  const upgrades = useGameStore((state) => state.upgrades);
  const resumeRun = useGameStore((state) => state.resumeRun);
  const isSettingsOpen = useSettingsStore((state) => state.isOpen);
  const openSettings = useSettingsStore((state) => state.openSettings);
  const { launchArenaToHub, isTransitioning } = useScreenTransition();

  const [confirmAbort, setConfirmAbort] = useState(false);
  const breachPercent = Math.round(getBreachPercent(breachProgress, upgrades));

  const strings = useGameStrings();
  const isBoss = runPhase === 'boss';
  const killDisplay = isBoss
    ? strings.ui.boss
    : `${runKills}/${BOSS_KILL_THRESHOLD}`;

  const handleAbortRun = () => {
    if (isTransitioning) return;
    setConfirmAbort(false);
    launchArenaToHub('aborted');
  };

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

          <p className="so-animate-reveal-step-1 mt-2 text-[14px] italic leading-relaxed tracking-[0.06em] text-white/45">
            {strings.pause.subtitle}
          </p>

          <div className="so-animate-reveal-step-2 mt-6 flex justify-center gap-6 font-mono text-[14px] tracking-wider text-white/40 uppercase">
            <div className="flex flex-col gap-1">
              <span className="text-[13px] text-white/30">{strings.pause.statBreach}</span>
              <span className="text-sm text-white/70">{breachPercent}%</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[13px] text-white/30">{strings.pause.statCycle}</span>
              <span className="text-sm text-white/70">{activeCycle}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[13px] text-white/30">{strings.pause.statKills}</span>
              <span className="text-sm text-white/70">{killDisplay}</span>
            </div>
          </div>

          {confirmAbort ? (
            <div className="so-animate-reveal-step-3 mt-8">
              <p className="mb-4 text-[14px] leading-relaxed tracking-[0.06em] text-white/50">
                {strings.pause.confirmPrompt}
              </p>
              <div className="flex items-center justify-center gap-4">
                <HexActionButton
                  label={strings.pause.confirmNo}
                  onClick={() => setConfirmAbort(false)}
                  size="md"
                  variant="secondary"
                  clickSound="uiBack"
                />
                <HexActionButton
                  label={strings.pause.confirmYes}
                  onClick={handleAbortRun}
                  size="md"
                  variant="primary"
                  clickSound="uiConfirm"
                  disabled={isTransitioning}
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
                  clickSound="uiConfirm"
                />
              </div>
              <HexActionButton
                label={strings.pause.settingsLabel}
                onClick={openSettings}
                size="md"
                variant="secondary"
                clickSound="settingsOpen"
              />
            </div>
          )}

          <p className="mt-6 text-[13px] tracking-[0.2em] text-white/25 uppercase">{strings.pause.escHint}</p>
        </div>
      )}
    </div>
  );
}
