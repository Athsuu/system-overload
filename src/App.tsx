import { DevMenu } from './dev/DevMenu';
import { isDevMenuEnabled } from './dev/isDevMenuEnabled';
import { GameCanvas } from './game/GameCanvas';
import { useBreachEndWatcher } from './game/useBreachEndWatcher';
import { useSettingsStore } from './store/useSettingsStore';
import { useGameStore } from './store/useGameStore';
import { ArenaHexOverlay } from './ui/ArenaHexOverlay';
import { HUD } from './ui/HUD';
import { PauseScreen } from './ui/PauseScreen';
import { ModuleBayScreen } from './ui/ModuleBayScreen';
import { RunEndScreen } from './ui/RunEndScreen';
import { ScreenTransition } from './ui/ScreenTransition';
import { SettingsOverlay } from './ui/SettingsOverlay';
import { SkillTreeScreen } from './ui/SkillTreeScreen';
import { usePauseHotkey } from './ui/usePauseHotkey';

function App() {
  useBreachEndWatcher();
  usePauseHotkey();
  const gameState = useGameStore((state) => state.gameState);
  const isSettingsOpen = useSettingsStore((state) => state.isOpen);
  const isPlaying = gameState === 'PLAYING';
  const isPaused = gameState === 'PAUSED';
  const isModuleBay = gameState === 'MODULE_BAY';
  const isRunEnd = gameState === 'RUN_END';
  const isArenaVisible = isPlaying || isPaused || isModuleBay || isRunEnd;
  const isHub = gameState === 'MENU' || gameState === 'UPGRADING';
  const showHubSettings = isSettingsOpen && isHub;

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
        {isModuleBay && (
          <ScreenTransition screenKey="module-bay" className="absolute inset-0">
            <ModuleBayScreen />
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
      {showHubSettings && <SettingsOverlay />}
      {isDevMenuEnabled() && <DevMenu />}
    </div>
  );
}

export default App;
