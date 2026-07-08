import { useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { PlayerStatsButton } from './PlayerStatsButton';
import { PlayerStatsPanel } from './PlayerStatsPanel';
import { SettingsGearButton } from './SettingsGearButton';

export function HubCornerControls() {
  const [statsOpen, setStatsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const closeSettings = useSettingsStore((state) => state.closeSettings);
  const isSettingsOpen = useSettingsStore((state) => state.isOpen);

  useEffect(() => {
    if (isSettingsOpen) setStatsOpen(false);
  }, [isSettingsOpen]);

  const handleStatsToggle = () => {
    if (!statsOpen && isSettingsOpen) {
      closeSettings();
    }
    setStatsOpen((open) => !open);
  };

  const handleCloseStats = () => setStatsOpen(false);

  return (
    <div ref={anchorRef} className="pointer-events-auto absolute top-8 left-8">
      <div className="relative flex flex-col items-center gap-2">
        <SettingsGearButton />
        <PlayerStatsButton isOpen={statsOpen} onToggle={handleStatsToggle} />
        <PlayerStatsPanel
          isOpen={statsOpen}
          onClose={handleCloseStats}
          anchorRef={anchorRef}
        />
      </div>
    </div>
  );
}
