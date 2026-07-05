import { useEffect } from 'react';
import { useSettingsStore, type SettingsSection } from '../store/useSettingsStore';
import { DARK_HEX } from '../theme/darkHexTerminal';
import { GAME_NARRATIVE } from './gameNarrative';

const SECTIONS: { id: SettingsSection; label: string; disabled?: boolean }[] = [
  { id: 'audio', label: GAME_NARRATIVE.settings.sections.audio },
  { id: 'language', label: GAME_NARRATIVE.settings.sections.language, disabled: true },
  { id: 'controls', label: GAME_NARRATIVE.settings.sections.controls, disabled: true },
];

function VolumeSlider() {
  const masterVolume = useSettingsStore((state) => state.masterVolume);
  const setMasterVolume = useSettingsStore((state) => state.setMasterVolume);
  const { masterVolumeLabel, audioComingSoon } = GAME_NARRATIVE.settings;

  return (
    <div className="mt-6 px-1">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] tracking-[0.15em] text-white/50 uppercase">
          {masterVolumeLabel}
        </span>
        <span className="font-mono text-xs text-white/60">{masterVolume}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={masterVolume}
        onChange={(event) => setMasterVolume(Number(event.target.value))}
        className="settings-volume-slider w-full"
        style={{ accentColor: DARK_HEX.gold }}
      />
      <p className="mt-3 text-center text-[9px] italic tracking-[0.06em] text-white/30">
        {audioComingSoon}
      </p>
    </div>
  );
}

export function SettingsPanel() {
  const activeSection = useSettingsStore((state) => state.activeSection);
  const setActiveSection = useSettingsStore((state) => state.setActiveSection);
  const closeSettings = useSettingsStore((state) => state.closeSettings);
  const { title, subtitle, closeLabel } = GAME_NARRATIVE.settings;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      closeSettings();
    };

    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
  }, [closeSettings]);

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
        {SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          const isDisabled = section.disabled === true;

          return (
            <button
              key={section.id}
              type="button"
              disabled={isDisabled}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-3 text-left text-[10px] tracking-[0.18em] uppercase transition ${
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
                <span className="mt-0.5 block text-[8px] tracking-[0.1em] text-white/15 normal-case">
                  {GAME_NARRATIVE.settings.comingSoon}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="flex min-h-[280px] flex-1 flex-col px-8 py-8">
        <h2
          className="text-lg font-normal uppercase"
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: DARK_HEX.gold,
          }}
        >
          {title}
        </h2>
        <p className="mt-1 text-[10px] italic tracking-[0.06em] text-white/40">{subtitle}</p>

        {activeSection === 'audio' && <VolumeSlider />}

        <div className="mt-auto flex justify-center pt-10">
          <button
            type="button"
            onClick={closeSettings}
            className="border px-8 py-2.5 text-[10px] font-semibold tracking-[0.18em] text-white/55 uppercase transition hover:border-white/25 hover:text-white/80"
            style={{ borderColor: DARK_HEX.tooltipBorder }}
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
