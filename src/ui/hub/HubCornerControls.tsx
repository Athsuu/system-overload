import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { PlayerStatsButton } from './PlayerStatsButton';
import { PlayerStatsPanel } from './PlayerStatsPanel';
import { SettingsGearButton } from '../settings/SettingsGearButton';

export function HubCornerControls() {
  const [statsOpen, setStatsOpen] = useState(false);
  const closeSettings = useSettingsStore((state) => state.closeSettings);
  const isSettingsOpen = useSettingsStore((state) => state.isOpen);
  const gameState = useGameStore((state) => state.gameState);

  useEffect(() => {
    if (isSettingsOpen) setStatsOpen(false);
  }, [isSettingsOpen]);

  useEffect(() => {
    if (gameState === 'PLAYING') setStatsOpen(false);
  }, [gameState]);

  const handleStatsToggle = () => {
    if (!statsOpen && isSettingsOpen) {
      closeSettings();
    }
    setStatsOpen((open) => !open);
  };

  const handleCloseStats = () => setStatsOpen(false);

  return (
    <div className="pointer-events-auto absolute top-8 left-8">
      <div className="relative flex flex-col items-center gap-2">
        <SettingsGearButton />
        <PlayerStatsButton isOpen={statsOpen} onToggle={handleStatsToggle} />
        <PlayerStatsPanel isOpen={statsOpen} onClose={handleCloseStats} />
      </div>
    </div>
  );
}
