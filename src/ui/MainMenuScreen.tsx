import { useEffect, useState } from 'react';
import { ensureHubAudioUnlocked } from '../audio/useHubAudio';
import { useGameStrings } from '../i18n/useGameStrings';
import { canQuitApp, quitApp } from '../platform/canQuitApp';
import { hasSave } from '../store/persistence';
import { useSettingsStore } from '../store/useSettingsStore';
import { clearProgressionData } from '../store/playerReset';
import { useGameStore, persistCurrentProgress, resetToFreshPlayer } from '../store/useGameStore';
import { DARK_HEX } from '../theme/darkHexTerminal';
import { ConfirmNewGameModal } from './ConfirmNewGameModal';
import { HexActionButton } from './HexActionButton';
import { MainMenuBackdrop } from './MainMenuBackdrop';
import { ArchGlitchLine } from './ArchGlitchText';

export function MainMenuScreen() {
  const strings = useGameStrings();
  const setGameState = useGameStore((state) => state.setGameState);
  const openSettings = useSettingsStore((state) => state.openSettings);
  const [confirmNewGame, setConfirmNewGame] = useState(false);
  const [buttonSize, setButtonSize] = useState<'md' | 'lg' | 'xl'>('xl');
  const saveExists = hasSave();
  const quitEnabled = canQuitApp();

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (w < 640) setButtonSize('md');
      else if (w < 960) setButtonSize('lg');
      else setButtonSize('xl');
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const enterHub = () => {
    ensureHubAudioUnlocked();
    setGameState('MENU');
    persistCurrentProgress();
  };

  const handleNewGame = () => {
    if (saveExists) {
      setConfirmNewGame(true);
      return;
    }
    enterHub();
  };

  const handleContinue = () => {
    if (!saveExists) return;
    enterHub();
  };

  const handleQuit = () => {
    if (!quitEnabled) return;
    quitApp();
  };

  const handleConfirmNewGame = () => {
    clearProgressionData();
    resetToFreshPlayer();
    ensureHubAudioUnlocked();
    setConfirmNewGame(false);
    setGameState('MENU');
  };

  return (
    <div
      className="pointer-events-auto absolute inset-0 overflow-hidden"
      style={{ backgroundColor: DARK_HEX.canvasBg }}
    >
      <MainMenuBackdrop />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 py-16">
        <div className="flex flex-col items-center">
          <h1
            className="so-font-display so-animate-reveal-title relative text-center text-[35px] font-semibold tracking-[0.22em] uppercase sm:text-[41px] md:text-[53px]"
            style={{ color: DARK_HEX.gold }}
          >
            <ArchGlitchLine
              text={strings.title.toUpperCase()}
              variant="title"
              quote={false}
              glitchChance={0.06}
            />
            <span className="so-title-cursor-blink ml-1 text-white/70">|</span>
          </h1>

          <p className="so-animate-reveal-step-1 mt-4 max-w-md text-center text-[10px] tracking-[0.18em] text-white/35">
            {strings.tagline}
          </p>
        </div>

        <div
          className={`so-animate-reveal-step-3 mt-[calc(3.5rem+3cm)] flex flex-row flex-wrap items-center justify-center gap-5 sm:mt-[calc(4rem+3cm)] sm:gap-7 md:gap-8 ${
            buttonSize === 'xl' ? 'max-w-[min(98vw,820px)]' : buttonSize === 'md' ? 'max-w-[min(96vw,480px)]' : ''
          }`}
        >
          <HexActionButton label={strings.mainMenu.newGame} size={buttonSize} onClick={handleNewGame} />
          <HexActionButton
            label={strings.mainMenu.continue}
            size={buttonSize}
            disabled={!saveExists}
            onClick={handleContinue}
          />
          <HexActionButton label={strings.mainMenu.settings} size={buttonSize} onClick={openSettings} />
          <HexActionButton
            label={strings.mainMenu.quit}
            size={buttonSize}
            variant="secondary"
            disabled={!quitEnabled}
            title={quitEnabled ? undefined : strings.mainMenu.quitDisabledTooltip}
            onClick={handleQuit}
          />
        </div>
      </div>

      {confirmNewGame && (
        <ConfirmNewGameModal
          onCancel={() => setConfirmNewGame(false)}
          onConfirm={handleConfirmNewGame}
        />
      )}
    </div>
  );
}
