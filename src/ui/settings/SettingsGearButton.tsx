import { useGameStrings } from '../../i18n/useGameStrings';
import { useSettingsStore } from '../../store/useSettingsStore';
import { triggerSfx } from '../../audio/sfxApi';
import { DARK_HEX } from '../../theme/darkHexTerminal';
import { hexagonPoints } from '../module-tree/moduleTreeGeometry';

export function SettingsGearButton() {
  const openSettings = useSettingsStore((state) => state.openSettings);
  const strings = useGameStrings();

  const handleOpen = () => {
    triggerSfx('settingsOpen');
    openSettings();
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      aria-label={strings.settings.title}
      className="group relative flex h-11 w-11 items-center justify-center transition hover:scale-[1.05]"
    >
      <svg viewBox="0 0 44 44" className="absolute inset-0 h-full w-full">
        <polygon
          points={hexagonPoints(22, 22, 20)}
          fill="#120808"
          stroke={DARK_HEX.gold}
          strokeWidth={1}
          strokeOpacity={0.45}
          className="transition group-hover:stroke-opacity-70"
        />
      </svg>
      <svg
        viewBox="0 0 24 24"
        className="relative h-4 w-4 text-white/50 transition group-hover:text-white/75"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>
  );
}
