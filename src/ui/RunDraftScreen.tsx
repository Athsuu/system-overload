import { useState } from 'react';
import type { RunDraftId } from '../store/runDraftCatalog';
import { useGameStore } from '../store/useGameStore';
import type { RunDraftOption } from '../store/runDraftCatalog';
import { DARK_HEX } from '../theme/darkHexTerminal';
import { hexagonPoints } from './skillTreeGeometry';

const STAGGER_CLASSES = [
  'so-animate-slide-up-delay-1',
  'so-animate-slide-up-delay-2',
  'so-animate-slide-up-delay-3',
] as const;

function DraftCard({
  option,
  staggerClass,
  isConfirming,
  disabled,
  onPick,
}: {
  option: RunDraftOption;
  staggerClass: string;
  isConfirming: boolean;
  disabled: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onPick}
      className={`group so-animate-slide-up ${staggerClass} relative flex w-full max-w-[200px] flex-col items-center border px-4 py-6 text-center transition hover:border-amber-500/50 disabled:cursor-wait ${isConfirming ? 'so-animate-card-confirm' : ''}`}
      style={{
        backgroundColor: DARK_HEX.tooltipBg,
        borderColor: isConfirming ? DARK_HEX.breach : DARK_HEX.tooltipBorder,
      }}
    >
      <svg viewBox="0 0 80 80" className="mb-3 h-16 w-16">
        <polygon
          points={hexagonPoints(40, 40, 36)}
          fill="#120808"
          stroke={isConfirming ? DARK_HEX.breach : DARK_HEX.gold}
          strokeWidth={1}
          className="transition group-hover:stroke-amber-400"
        />
      </svg>
      <h3
        className="text-sm tracking-[0.15em] uppercase"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: DARK_HEX.gold }}
      >
        {option.name}
      </h3>
      <p className="mt-2 text-[11px] leading-relaxed text-white/50">{option.description}</p>
    </button>
  );
}

export function RunDraftScreen() {
  const draftOptions = useGameStore((state) => state.draftOptions);
  const runLevel = useGameStore((state) => state.runLevel);
  const pickDraft = useGameStore((state) => state.pickDraft);
  const [confirmingId, setConfirmingId] = useState<RunDraftId | null>(null);

  const handlePick = (id: RunDraftId) => {
    if (confirmingId) return;
    setConfirmingId(id);
    window.setTimeout(() => {
      pickDraft(id);
      setConfirmingId(null);
    }, 250);
  };

  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center">
      <div className="so-animate-fade-in-slow absolute inset-0 bg-[#0a0a0f]/92" />

      <div className="relative px-6 text-center">
        <p className="so-animate-slide-up text-[10px] tracking-[0.35em] text-white/40 uppercase">
          Level Up
        </p>
        <h2
          className="so-animate-slide-up so-animate-slide-up-delay-1 mt-2 text-xl tracking-[0.25em] uppercase"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: DARK_HEX.gold }}
        >
          Choose Enhancement
        </h2>
        <p className="so-animate-slide-up so-animate-slide-up-delay-1 mt-1 text-xs text-white/35">
          Run level {runLevel}
        </p>

        <div className="mt-8 flex flex-wrap items-start justify-center gap-4">
          {draftOptions.map((option, index) => (
            <DraftCard
              key={option.id}
              option={option}
              staggerClass={STAGGER_CLASSES[Math.min(index, STAGGER_CLASSES.length - 1)]}
              isConfirming={confirmingId === option.id}
              disabled={confirmingId !== null}
              onPick={() => handlePick(option.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
