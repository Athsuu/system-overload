import { useEffect, useRef, type RefObject } from 'react';
import { useGameStrings } from '../i18n/useGameStrings';
import { useGameStore } from '../store/useGameStore';
import { DARK_HEX } from '../theme/darkHexTerminal';
import { getPlayerStatSheet } from './playerStats';

interface PlayerStatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLDivElement | null>;
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[11px]">
      <span className="shrink-0 text-white/45">{label}</span>
      <span className="text-right font-mono text-white/85">{value}</span>
    </div>
  );
}

export function PlayerStatsPanel({ isOpen, onClose, anchorRef }: PlayerStatsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const upgrades = useGameStore((state) => state.upgrades);
  const strings = useGameStrings();
  const lines = getPlayerStatSheet(upgrades);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [anchorRef, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="so-animate-fade-in-slow absolute top-full left-0 z-20 mt-2 w-[252px] border px-4 py-3"
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
        className="so-font-display mb-3 text-[9px] font-semibold tracking-[0.28em] uppercase"
        style={{ color: DARK_HEX.gold }}
      >
        {strings.playerStats.title}
      </p>
      <div className="space-y-2">
        {lines.map((line) => (
          <StatLine key={line.id} label={line.label} value={line.value} />
        ))}
      </div>
    </div>
  );
}
