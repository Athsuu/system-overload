import { triggerSfx } from '../audio/sfxApi';
import { useGameStrings } from '../i18n/useGameStrings';
import { isCycleCleared } from '../store/cycleTypes';
import { useGameStore } from '../store/useGameStore';
import { markTutorialSignal } from '../tutorial/tutorialSignals';
import { DARK_HEX } from '../theme/darkHexTerminal';
import { MODULE_TREE_VISUAL } from './moduleTreeTheme';
import { HexActionButton } from './HexActionButton';
import { useScreenTransition } from './transitions/useScreenTransition';

function CycleArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'left' | 'right';
  disabled: boolean;
  onClick: () => void;
}) {
  const label = direction === 'left' ? '◀' : '▶';

  const handleClick = () => {
    if (disabled) return;
    triggerSfx('nodeSelect');
    onClick();
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : handleClick}
      aria-label={direction === 'left' ? 'Previous cycle' : 'Next cycle'}
      className={`flex h-11 w-11 items-center justify-center rounded-sm border text-sm transition ${
        disabled
          ? 'cursor-not-allowed border-white/10 text-white/20'
          : 'border-white/20 text-white/70 hover:border-amber-500/40 hover:text-amber-200'
      }`}
      style={{
        backgroundColor: disabled ? 'rgba(18, 8, 8, 0.4)' : 'rgba(18, 8, 8, 0.85)',
        boxShadow: disabled ? undefined : `0 0 12px ${MODULE_TREE_VISUAL.edgeActive}22`,
      }}
    >
      {label}
    </button>
  );
}

export function CycleRunLauncher() {
  const selectedCycle = useGameStore((state) => state.selectedCycle);
  const highestCycleUnlocked = useGameStore((state) => state.highestCycleUnlocked);
  const cyclesCleared = useGameStore((state) => state.cyclesCleared);
  const setSelectedCycle = useGameStore((state) => state.setSelectedCycle);
  const strings = useGameStrings();
  const { launchHubToArena, isTransitioning } = useScreenTransition();

  const canGoLeft = selectedCycle > 1;
  const canGoRight = selectedCycle < highestCycleUnlocked;
  const cleared = isCycleCleared(cyclesCleared, selectedCycle);
  const cycleLabel = strings.ui.cycleLabel.replace('{n}', String(selectedCycle));

  const handlePrev = () => {
    if (!canGoLeft) return;
    setSelectedCycle(selectedCycle - 1);
  };

  const handleNext = () => {
    if (!canGoRight) return;
    setSelectedCycle(selectedCycle + 1);
  };

  const handleStartRun = () => {
    if (isTransitioning) return;
    markTutorialSignal('runsStarted');
    launchHubToArena(selectedCycle);
  };

  return (
    <div data-tutorial-anchor="start-run" className="flex flex-col items-center gap-2">
      <div className="flex flex-col items-center gap-0.5">
        <p
          className="so-font-display text-[15px] font-semibold tracking-[0.42em] uppercase"
          style={{ color: DARK_HEX.gold }}
        >
          {cycleLabel}
        </p>
        {cleared && (
          <span className="text-[13px] tracking-[0.2em] text-white/30 uppercase" title="Cycle cleared">
            ✓
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <CycleArrowButton direction="left" disabled={!canGoLeft} onClick={handlePrev} />
        <HexActionButton
          label={strings.ui.startRun}
          onClick={handleStartRun}
          clickSound="startRun"
          size="hubRun"
          variant="primary"
          className="hover:scale-[1.03]"
          disabled={isTransitioning}
        />
        <CycleArrowButton direction="right" disabled={!canGoRight} onClick={handleNext} />
      </div>
    </div>
  );
}
