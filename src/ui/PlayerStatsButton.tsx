import { triggerSfx } from '../audio/sfxApi';
import { useGameStrings } from '../i18n/useGameStrings';
import { DARK_HEX } from '../theme/darkHexTerminal';
import { hexagonPoints } from './moduleTreeGeometry';

interface PlayerStatsButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function PlayerStatsButton({ isOpen, onToggle }: PlayerStatsButtonProps) {
  const strings = useGameStrings();

  const handleToggle = () => {
    triggerSfx(isOpen ? 'settingsClose' : 'settingsOpen');
    onToggle();
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={strings.playerStats.openLabel}
      aria-expanded={isOpen}
      className="group relative flex h-11 w-11 items-center justify-center transition hover:scale-[1.05]"
    >
      <svg viewBox="0 0 44 44" className="absolute inset-0 h-full w-full">
        <polygon
          points={hexagonPoints(22, 22, 20)}
          fill="#120808"
          stroke={isOpen ? DARK_HEX.gold : DARK_HEX.gold}
          strokeWidth={1}
          strokeOpacity={isOpen ? 0.7 : 0.45}
          className="transition group-hover:stroke-opacity-70"
        />
      </svg>
      <svg
        viewBox="0 0 24 24"
        className="relative h-4 w-4 text-white/50 transition group-hover:text-white/75"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden
      >
        <path strokeLinecap="round" d="M4 18v-4" />
        <path strokeLinecap="round" d="M8 18V10" />
        <path strokeLinecap="round" d="M12 18V6" />
        <path strokeLinecap="round" d="M16 18v-7" />
        <path strokeLinecap="round" d="M20 18v-3" />
      </svg>
    </button>
  );
}
