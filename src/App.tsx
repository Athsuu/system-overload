import { DevMenu } from './dev/DevMenu';
import { isDevMenuEnabled } from './dev/isDevMenuEnabled';
import { useHubAudio } from './audio/useHubAudio';
import { GameCanvas } from './game/GameCanvas';
import { useBreachWarningSound } from './game/useBreachWarningSound';
import { useProgressAutosave } from './store/useProgressAutosave';
import { useSettingsStore } from './store/useSettingsStore';
import { useGameStore } from './store/useGameStore';
import { ArenaHexOverlay } from './ui/ArenaHexOverlay';
import { HexShardsBadgeLayer } from './ui/CurrencyBadge';
import { HUD } from './ui/HUD';
import { PauseScreen } from './ui/PauseScreen';
import { RunEndScreen } from './ui/RunEndScreen';
import { ScreenTransition } from './ui/ScreenTransition';
import { SettingsOverlay } from './ui/SettingsOverlay';
import { MainMenuScreen } from './ui/MainMenuScreen';
import { SkillTreeScreen } from './ui/SkillTreeScreen';
import { TutorialCoach } from './ui/TutorialCoach';
import { ArchAmbient } from './ui/ArchAmbient';
import { usePauseHotkey } from './ui/usePauseHotkey';
import { DARK_HEX } from './theme/darkHexTerminal';

function App() {
  useBreachWarningSound();
  usePauseHotkey();
  const gameState = useGameStore((state) => state.gameState);
  const isSettingsOpen = useSettingsStore((state) => state.isOpen);
  const isPlaying = gameState === 'PLAYING';
  const isPaused = gameState === 'PAUSED';
  const isRunEnd = gameState === 'RUN_END';
  const isArenaVisible = isPlaying || isPaused || isRunEnd;
  const isMainMenu = gameState === 'MAIN_MENU';
  const isHub = gameState === 'MENU' || gameState === 'UPGRADING';
  const showHubSettings = isSettingsOpen && isHub;
  const showMainMenuSettings = isSettingsOpen && isMainMenu;

  const showHexShardsBadge = isHub || isPlaying || isPaused;

  useHubAudio();
  useProgressAutosave();

  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{ backgroundColor: DARK_HEX.canvasBg }}
    >
      {isArenaVisible && (
        <>
          <ArenaHexOverlay />
          <GameCanvas />
        </>
      )}
      {showHexShardsBadge && <HexShardsBadgeLayer />}
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
        {isRunEnd && (
          <ScreenTransition screenKey="run-end" className="absolute inset-0">
            <RunEndScreen />
          </ScreenTransition>
        )}
        {isMainMenu && (
          <ScreenTransition screenKey="main-menu" className="absolute inset-0">
            <MainMenuScreen />
          </ScreenTransition>
        )}
        {isHub && (
          <ScreenTransition screenKey={`hub-${gameState}`} className="absolute inset-0">
            <SkillTreeScreen mode={gameState} />
          </ScreenTransition>
        )}
      </div>
      {(showHubSettings || showMainMenuSettings) && <SettingsOverlay />}
      <TutorialCoach />
      <ArchAmbient />
      {isDevMenuEnabled() && <DevMenu />}
    </div>
  );
}

export default App;
