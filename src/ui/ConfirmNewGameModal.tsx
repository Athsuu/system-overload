import { DARK_HEX } from '../theme/darkHexTerminal';
import { triggerSfx } from '../audio/sfxApi';
import { useGameStrings } from '../i18n/useGameStrings';
import { HexActionButton } from './HexActionButton';
interface ConfirmNewGameModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmNewGameModal({ onCancel, onConfirm }: ConfirmNewGameModalProps) {
  const strings = useGameStrings();

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label={strings.mainMenu.confirmCancel}
        onClick={() => {
          triggerSfx('uiBack');
          onCancel();
        }}
      />
      <div
        className="so-animate-card-confirm relative w-full max-w-sm border px-8 py-8 text-center"
        style={{
          backgroundColor: DARK_HEX.tooltipBg,
          borderColor: DARK_HEX.tooltipBorder,
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${DARK_HEX.gold}66, transparent)` }}
        />
        <h2
          className="so-font-display text-sm font-semibold tracking-[0.25em] uppercase"
          style={{ color: DARK_HEX.gold }}
        >
          {strings.mainMenu.confirmTitle}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed tracking-[0.06em] text-white/50">
          {strings.mainMenu.confirmBody}
        </p>
        <div className="mt-8 flex items-center justify-center gap-6">
          <HexActionButton
            label={strings.mainMenu.confirmCancel}
            variant="secondary"
            size="md"
            clickSound="uiBack"
            onClick={onCancel}
          />
          <HexActionButton
            label={strings.mainMenu.confirmErase}
            size="md"
            clickSound="uiConfirm"
            onClick={onConfirm}
          />
        </div>
      </div>
    </div>
  );
}
