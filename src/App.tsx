import { DevMenu } from './dev/DevMenu';
import { isDevMenuEnabled } from './dev/isDevMenuEnabled';
import { GameCanvas } from './game/GameCanvas';
import { useBreachEndWatcher } from './game/useBreachEndWatcher';
import { useGameStore } from './store/useGameStore';
import { ArenaHexOverlay } from './ui/ArenaHexOverlay';
import { HUD } from './ui/HUD';
import { PauseScreen } from './ui/PauseScreen';
import { RunDraftScreen } from './ui/RunDraftScreen';
import { RunEndScreen } from './ui/RunEndScreen';
import { ScreenTransition } from './ui/ScreenTransition';
import { SkillTreeScreen } from './ui/SkillTreeScreen';
import { usePauseHotkey } from './ui/usePauseHotkey';

function App() {
  useBreachEndWatcher();
  usePauseHotkey();
  const gameState = useGameStore((state) => state.gameState);
  const isPlaying = gameState === 'PLAYING';
  const isPaused = gameState === 'PAUSED';
  const isDraft = gameState === 'DRAFT';
  const isRunEnd = gameState === 'RUN_END';
  const isArenaVisible = isPlaying || isPaused || isDraft || isRunEnd;
  const isHub = gameState === 'MENU' || gameState === 'UPGRADING';

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0a0a0f]">
      {isArenaVisible && (
        <>
          <ArenaHexOverlay />
          <GameCanvas />
        </>
      )}
      <div className="pointer-events-none absolute inset-0 z-10">
        {isPlaying && (
          <ScreenTransition screenKey="hud" className="absolute inset-0">
            <HUD />
          </ScreenTransition>
        )}
        {isPaused && (
          <ScreenTransition screenKey="pause" className="absolute inset-0">
            <PauseScreen />
          </ScreenTransition>
        )}
        {isDraft && (
          <ScreenTransition screenKey="draft" className="absolute inset-0">
            <RunDraftScreen />
          </ScreenTransition>
        )}
        {isRunEnd && (
          <ScreenTransition screenKey="run-end" className="absolute inset-0">
            <RunEndScreen />
          </ScreenTransition>
        )}
        {isHub && (
          <ScreenTransition screenKey={`hub-${gameState}`} className="absolute inset-0">
            <SkillTreeScreen mode={gameState} />
          </ScreenTransition>
        )}
      </div>
      {isDevMenuEnabled() && <DevMenu />}
    </div>
  );
}

export default App;
