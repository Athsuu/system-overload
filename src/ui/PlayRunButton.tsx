import { useGameStrings } from '../i18n/useGameStrings';
import { useGameStore } from '../store/useGameStore';
import { markTutorialSignal } from '../tutorial/tutorialSignals';
import { HexActionButton } from './HexActionButton';
import { useScreenTransition } from './transitions/useScreenTransition';

export function PlayRunButton() {
  const selectedCycle = useGameStore((state) => state.selectedCycle);
  const strings = useGameStrings();
  const { launchHubToArena, isTransitioning } = useScreenTransition();

  const handleStartRun = () => {
    if (isTransitioning) return;
    markTutorialSignal('runsStarted');
    launchHubToArena(selectedCycle);
  };

  return (
    <div data-tutorial-anchor="start-run" className="inline-flex">
      <HexActionButton
        label={strings.ui.startRun}
        onClick={handleStartRun}
        clickSound="startRun"
        size="hubRun"
        variant="primary"
        className="hover:scale-[1.03]"
        disabled={isTransitioning}
      />
    </div>
  );
}
