import { playHubSfx } from '../audio/hubAudio';
import { ensureHubAudioUnlocked } from '../audio/useHubAudio';
import { useGameStrings } from '../i18n/useGameStrings';
import { useGameStore } from '../store/useGameStore';
import { markTutorialSignal } from '../tutorial/tutorialSignals';
import { HexActionButton } from './HexActionButton';

export function PlayRunButton() {
  const startRun = useGameStore((state) => state.startRun);
  const strings = useGameStrings();

  const handleStartRun = () => {
    ensureHubAudioUnlocked();
    playHubSfx('startRun');
    markTutorialSignal('runsStarted');
    startRun();
  };

  return (
    <div data-tutorial-anchor="start-run" className="inline-flex">
      <HexActionButton
        label={strings.ui.startRun}
        onClick={handleStartRun}
        size="hubRun"
        variant="primary"
        className="hover:scale-[1.03]"
      />
    </div>
  );
}
