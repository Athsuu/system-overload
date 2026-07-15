import { useGameStrings } from '../../i18n/useGameStrings';
import { TerminalBackdrop } from '../hub/TerminalBackdrop';

export function MainMenuBackdrop() {
  const strings = useGameStrings();

  return (
    <div className="pointer-events-none absolute inset-0">
      <TerminalBackdrop patternId="mainMenuHexGrid" variant="menu" />
      <p className="so-arch-channel-label absolute bottom-6 left-1/2 z-[1] -translate-x-1/2 font-mono text-[13px] tracking-[0.28em] text-white/25 uppercase">
        {strings.mainMenu.statusUnstable}
      </p>
    </div>
  );
}
