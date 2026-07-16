import { useEffect, useRef, useState } from 'react';
import { useGameStrings } from '../../i18n/useGameStrings';
import { useGameStore } from '../../store/useGameStore';
import { DARK_HEX } from '../../theme/darkHexTerminal';
import {
  getPlayerStatsForTab,
  PLAYER_STAT_TAB_ORDER,
  type PlayerStatTabId,
} from './playerStats';

interface PlayerStatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[15px]">
      <span className="shrink-0 text-white/45">{label}</span>
      <span className="text-right font-mono text-white/85">{value}</span>
    </div>
  );
}

export function PlayerStatsPanel({ isOpen, onClose }: PlayerStatsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const upgrades = useGameStore((state) => state.upgrades);
  const selectedCycle = useGameStore((state) => state.selectedCycle);
  const strings = useGameStrings();
  const [activeTab, setActiveTab] = useState<PlayerStatTabId>('damage');
  const lines = getPlayerStatsForTab(upgrades, activeTab);
  const tabLabels = strings.playerStats.tabs;

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) setActiveTab('damage');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="so-animate-fade-in-slow absolute top-full left-0 z-20 mt-2 w-[280px] border px-4 py-3"
      style={{
        backgroundColor: DARK_HEX.tooltipBg,
        borderColor: DARK_HEX.tooltipBorder,
      }}
      role="region"
      aria-label={strings.playerStats.title}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${DARK_HEX.gold}, transparent)`,
        }}
      />
      <p
        className="so-font-display mb-3 text-[13px] font-semibold tracking-[0.28em] uppercase"
        style={{ color: DARK_HEX.gold }}
      >
        {strings.playerStats.title}
      </p>

      <div
        className="mb-3 flex gap-1 border-b pb-2"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        role="tablist"
        aria-label={strings.playerStats.title}
      >
        {PLAYER_STAT_TAB_ORDER.map((tabId) => {
          const selected = activeTab === tabId;
          return (
            <button
              key={tabId}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveTab(tabId)}
              className="flex-1 px-1 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase transition"
              style={{
                color: selected ? DARK_HEX.gold : 'rgba(255,255,255,0.35)',
                borderBottom: selected ? `1px solid ${DARK_HEX.gold}` : '1px solid transparent',
              }}
            >
              {tabLabels[tabId]}
            </button>
          );
        })}
      </div>

      <div className="min-h-[7.5rem] space-y-2" role="tabpanel" key={selectedCycle}>
        {lines.length > 0 ? (
          lines.map((line) => (
            <StatLine key={line.id} label={line.label} value={line.value} />
          ))
        ) : (
          <p className="text-[14px] leading-relaxed text-white/30">
            {strings.playerStats.emptyTab}
          </p>
        )}
      </div>
    </div>
  );
}
