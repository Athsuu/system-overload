import { useCallback, useEffect, useState } from 'react';
import { triggerSfx } from '../audio/sfxApi';
import type { LanguageMode } from '../i18n/types';
import { useGameStrings } from '../i18n/useGameStrings';
import { useGameStore } from '../store/useGameStore';
import { useSettingsStore, type SettingsSection } from '../store/useSettingsStore';
import { DARK_HEX } from '../theme/darkHexTerminal';

function VolumeSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="px-1">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[14px] tracking-[0.15em] text-white/50 uppercase">{label}</span>
        <span className="font-mono text-xs text-white/60">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="settings-volume-slider w-full"
        style={{ accentColor: DARK_HEX.gold }}
      />
    </div>
  );
}

function AudioSettings() {
  const masterVolume = useSettingsStore((state) => state.masterVolume);
  const musicVolume = useSettingsStore((state) => state.musicVolume);
  const sfxVolume = useSettingsStore((state) => state.sfxVolume);
  const setMasterVolume = useSettingsStore((state) => state.setMasterVolume);
  const setMusicVolume = useSettingsStore((state) => state.setMusicVolume);
  const setSfxVolume = useSettingsStore((state) => state.setSfxVolume);
  const strings = useGameStrings();

  return (
    <div className="mt-6 space-y-5">
      <VolumeSlider
        label={strings.settings.masterVolumeLabel}
        value={masterVolume}
        onChange={setMasterVolume}
      />
      <VolumeSlider
        label={strings.settings.musicVolumeLabel}
        value={musicVolume}
        onChange={setMusicVolume}
      />
      <VolumeSlider label={strings.settings.sfxVolumeLabel} value={sfxVolume} onChange={setSfxVolume} />
    </div>
  );
}

const LANGUAGE_OPTIONS: LanguageMode[] = ['auto', 'fr', 'en'];

function LanguageSettings() {
  const languageMode = useSettingsStore((state) => state.languageMode);
  const setLanguageMode = useSettingsStore((state) => state.setLanguageMode);
  const strings = useGameStrings();

  const optionLabels: Record<LanguageMode, string> = {
    auto: strings.settings.languageAuto,
    fr: strings.settings.languageFrench,
    en: strings.settings.languageEnglish,
  };

  return (
    <div className="mt-6 space-y-3">
      <p className="px-1 text-[14px] leading-relaxed text-white/40">{strings.settings.languageHint}</p>
      {LANGUAGE_OPTIONS.map((mode) => {
        const isActive = languageMode === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => {
              if (!isActive) triggerSfx('nodeSelect');
              setLanguageMode(mode);
            }}
            className={`w-full border px-4 py-3 text-left text-[14px] tracking-[0.14em] uppercase transition ${
              isActive ? 'text-white/85' : 'text-white/45 hover:text-white/65'
            }`}
            style={{
              borderColor: isActive ? DARK_HEX.gold : DARK_HEX.tooltipBorder,
              backgroundColor: isActive ? 'rgba(197, 160, 89, 0.08)' : 'transparent',
            }}
          >
            {optionLabels[mode]}
          </button>
        );
      })}
    </div>
  );
}

export function SettingsPanel() {
  const gameState = useGameStore((state) => state.gameState);
  const returnToMainMenu = useGameStore((state) => state.returnToMainMenu);
  const activeSection = useSettingsStore((state) => state.activeSection);
  const setActiveSection = useSettingsStore((state) => state.setActiveSection);
  const closeSettings = useSettingsStore((state) => state.closeSettings);
  const strings = useGameStrings();
  const showReturnToMainMenu = gameState !== 'MAIN_MENU';
  const inActiveRun = gameState === 'PLAYING' || gameState === 'PAUSED';
  const [confirmReturnToMainMenu, setConfirmReturnToMainMenu] = useState(false);

  const sections: { id: SettingsSection; label: string; disabled?: boolean }[] = [
    { id: 'audio', label: strings.settings.sections.audio },
    { id: 'language', label: strings.settings.sections.language },
    { id: 'controls', label: strings.settings.sections.controls, disabled: true },
  ];

  const handleClose = useCallback(() => {
    triggerSfx('uiBack');
    closeSettings();
  }, [closeSettings]);

  const handleReturnToMainMenu = useCallback(() => {
    if (inActiveRun && !confirmReturnToMainMenu) {
      triggerSfx('nodeSelect');
      setConfirmReturnToMainMenu(true);
      return;
    }
    triggerSfx('uiConfirm');
    returnToMainMenu();
    closeSettings();
    setConfirmReturnToMainMenu(false);
  }, [closeSettings, confirmReturnToMainMenu, inActiveRun, returnToMainMenu]);

  const handleCancelReturnToMainMenu = useCallback(() => {
    triggerSfx('uiBack');
    setConfirmReturnToMainMenu(false);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      handleClose();
    };

    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
  }, [handleClose]);

  return (
    <div
      className="relative flex w-full max-w-md border"
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

      <nav
        className="flex w-36 shrink-0 flex-col border-r py-6"
        style={{ borderColor: DARK_HEX.tooltipBorder }}
      >
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          const isDisabled = section.disabled === true;

          return (
            <button
              key={section.id}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled && section.id !== activeSection) {
                  triggerSfx('nodeSelect');
                }
                setActiveSection(section.id);
              }}
              className={`px-4 py-3 text-left text-[14px] tracking-[0.18em] uppercase transition ${
                isDisabled
                  ? 'cursor-not-allowed text-white/20'
                  : isActive
                    ? 'text-white/80'
                    : 'text-white/40 hover:text-white/60'
              }`}
              style={
                isActive && !isDisabled
                  ? {
                      color: DARK_HEX.gold,
                      borderLeft: `2px solid ${DARK_HEX.gold}`,
                      backgroundColor: 'rgba(197, 160, 89, 0.06)',
                    }
                  : { borderLeft: '2px solid transparent' }
              }
            >
              {section.label}
              {isDisabled && (
                <span className="mt-0.5 block text-[12px] tracking-[0.1em] text-white/15 normal-case">
                  {strings.settings.comingSoon}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="flex min-h-[280px] flex-1 flex-col px-8 py-8">
        <h2
          className="so-font-display text-lg font-semibold uppercase"
          style={{
            color: DARK_HEX.gold,
          }}
        >
          {strings.settings.title}
        </h2>
        <p className="mt-1 text-[14px] italic tracking-[0.06em] text-white/40">{strings.settings.subtitle}</p>

        {activeSection === 'audio' && <AudioSettings />}
        {activeSection === 'language' && <LanguageSettings />}

        <div className="mt-auto flex flex-col items-center gap-3 pt-10">
          {confirmReturnToMainMenu && (
            <div className="mb-1 w-full text-center">
              <p className="mb-4 text-[14px] leading-relaxed tracking-[0.06em] text-white/50">
                {strings.pause.confirmPrompt}
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handleCancelReturnToMainMenu}
                  className="border px-6 py-2 text-[14px] font-semibold tracking-[0.18em] text-white/55 uppercase transition hover:text-white/80"
                  style={{ borderColor: DARK_HEX.tooltipBorder }}
                >
                  {strings.pause.confirmNo}
                </button>
                <button
                  type="button"
                  onClick={handleReturnToMainMenu}
                  className="border px-6 py-2 text-[14px] font-semibold tracking-[0.18em] uppercase transition hover:text-white/90"
                  style={{
                    borderColor: DARK_HEX.goldMuted,
                    color: DARK_HEX.gold,
                    backgroundColor: 'rgba(197, 160, 89, 0.06)',
                  }}
                >
                  {strings.pause.confirmYes}
                </button>
              </div>
            </div>
          )}
          {showReturnToMainMenu && !confirmReturnToMainMenu && (
            <button
              type="button"
              onClick={handleReturnToMainMenu}
              className="border px-8 py-2.5 text-[14px] font-semibold tracking-[0.18em] uppercase transition hover:text-white/90"
              style={{
                borderColor: DARK_HEX.goldMuted,
                color: DARK_HEX.gold,
                backgroundColor: 'rgba(197, 160, 89, 0.06)',
              }}
            >
              {strings.settings.returnToMainMenuLabel}
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="border px-8 py-2.5 text-[14px] font-semibold tracking-[0.18em] text-white/55 uppercase transition hover:border-white/25 hover:text-white/80"
            style={{ borderColor: DARK_HEX.tooltipBorder }}
          >
            {strings.settings.closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
