import { useState } from 'react';
import { getCoreProtocolCost, getCoreProtocolDefinition, getCoreProtocolState } from '../store/coreProtocolCatalog';
import { canRecompile } from '../store/prestigeLogic';
import type { CoreProtocolId } from '../store/prestigeTypes';
import { useGameStore } from '../store/useGameStore';
import { useGameStrings } from '../i18n/useGameStrings';
import { triggerSfx } from '../audio/sfxApi';
import { HubCornerControls } from './HubCornerControls';
import { ArchGlitchLine } from './arch/ArchGlitchText';
import { RecompileConfirmModal } from './RecompileConfirmModal';
import { SEED_PROTOCOL_IDS } from './seedProtocolLayout';
import { getCoreProtocolTierVisual, SEED_PROTOCOL_VISUAL } from './seedProtocolTheme';

function MonolithTierCard({
  id,
  isSelected,
  onSelect,
}: {
  id: CoreProtocolId;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const strings = useGameStrings();
  const seedFragments = useGameStore((state) => state.seedFragments);
  const coreProtocols = useGameStore((state) => state.coreProtocols);
  const purchaseCoreProtocol = useGameStore((state) => state.purchaseCoreProtocol);
  const definition = getCoreProtocolDefinition(id);
  const level = coreProtocols[id];
  const state = getCoreProtocolState(id, seedFragments, coreProtocols);
  const visual = getCoreProtocolTierVisual(state, isSelected, level);
  const cost = getCoreProtocolCost(definition, level);

  const handlePurchase = () => {
    const ok = purchaseCoreProtocol(id);
    if (ok) triggerSfx('purchase');
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        triggerSfx('nodeSelect');
        onSelect();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onSelect();
      }}
      className="w-[min(88vw,400px)] cursor-pointer rounded-[28px] border px-6 py-4 text-left backdrop-blur-md transition-all duration-200"
      style={{
        borderColor: visual.border,
        backgroundColor: visual.background,
        boxShadow: visual.glow,
        opacity: visual.opacity,
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-[13px] font-semibold tracking-[0.16em] uppercase" style={{ color: visual.titleColor }}>
          {definition.name}
        </span>
        <span className="font-mono text-[13px] font-semibold tabular-nums" style={{ color: visual.pipColor }}>
          {strings.ui.levelFormatUncapped.replace('{n}', String(level))}
        </span>
      </div>

      {isSelected && (
        <div className="mt-3 border-t pt-3" style={{ borderColor: visual.border }}>
          <p className="text-[13px] leading-relaxed" style={{ color: visual.textColor }}>
            {definition.description}
          </p>
          <button
            type="button"
            disabled={state !== 'available'}
            onClick={(event) => {
              event.stopPropagation();
              handlePurchase();
            }}
            className="mt-3 w-full rounded-2xl border px-4 py-2 text-[12px] font-semibold tracking-[0.18em] uppercase transition disabled:cursor-not-allowed disabled:opacity-35"
            style={{
              borderColor: `${SEED_PROTOCOL_VISUAL.accent}66`,
              color: SEED_PROTOCOL_VISUAL.accentMuted,
            }}
          >
            {strings.ui.purchase} · {cost} {strings.currency.seedFragmentsShort}
          </button>
        </div>
      )}
    </div>
  );
}

export function SeedProtocolsScreen() {
  const strings = useGameStrings();
  const closeSeedProtocols = useGameStore((state) => state.closeSeedProtocols);
  const recompileDepth = useGameStore((state) => state.recompileDepth);
  const cyclesCleared = useGameStore((state) => state.cyclesCleared);
  const [selectedId, setSelectedId] = useState<CoreProtocolId | null>(null);
  const [recompileOpen, setRecompileOpen] = useState(false);
  const showRecompile = canRecompile(cyclesCleared);

  return (
    <div className="pointer-events-auto absolute inset-0 overflow-hidden" style={{ backgroundColor: '#05070a' }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(180deg, #070b10 0%, #05070a 55%, #04060a 100%)' }}
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-40 top-[12%] h-[440px] w-[440px] rounded-full blur-[130px]"
          style={{ backgroundColor: 'rgba(56, 189, 248, 0.14)' }}
        />
        <div
          className="absolute -right-32 bottom-[8%] h-[380px] w-[380px] rounded-full blur-[130px]"
          style={{ backgroundColor: 'rgba(125, 211, 252, 0.1)' }}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center px-6 pt-10">
        <h1
          className="so-font-display so-hub-glitch-title text-xl font-semibold tracking-[0.28em] uppercase"
          style={{ color: SEED_PROTOCOL_VISUAL.accentMuted }}
        >
          <ArchGlitchLine
            text={strings.seedProtocols.screenTitle}
            variant="title"
            quote={false}
            glitchChance={0.06}
          />
        </h1>
        <p className="mt-2 text-[14px] tracking-[0.28em] text-white/40 uppercase">
          {strings.seedProtocols.screenSubtitle}
        </p>
      </div>

      <div className="absolute inset-x-0 top-24 bottom-24 flex justify-center overflow-y-auto">
        <div className="relative flex min-h-full flex-col-reverse items-center justify-center gap-8 py-8">
          <div
            className="pointer-events-none absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2"
            style={{
              background: `linear-gradient(180deg, transparent, ${SEED_PROTOCOL_VISUAL.spineLine} 12%, ${SEED_PROTOCOL_VISUAL.spineLine} 88%, transparent)`,
            }}
            aria-hidden
          />

          <div className="relative z-10 flex flex-col items-center gap-1">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: SEED_PROTOCOL_VISUAL.accent, boxShadow: `0 0 12px ${SEED_PROTOCOL_VISUAL.accentGlow}` }}
            />
            <span className="font-mono text-[11px] tracking-[0.24em] text-white/30 uppercase">
              {strings.seedProtocols.recompileDepthLabel.replace('{n}', String(recompileDepth))}
            </span>
            {showRecompile && (
              <button
                type="button"
                onClick={() => setRecompileOpen(true)}
                className="mt-3 rounded-full border px-5 py-2 text-[12px] font-semibold tracking-[0.2em] uppercase backdrop-blur-md transition hover:opacity-90"
                style={{
                  borderColor: `${SEED_PROTOCOL_VISUAL.accent}66`,
                  backgroundColor: SEED_PROTOCOL_VISUAL.glassBg,
                  color: SEED_PROTOCOL_VISUAL.accentMuted,
                }}
              >
                {strings.seedProtocols.recompileAction}
              </button>
            )}
          </div>

          {SEED_PROTOCOL_IDS.map((id) => (
            <div key={id} className="relative z-10">
              <MonolithTierCard
                id={id}
                isSelected={selectedId === id}
                onSelect={() => setSelectedId((current) => (current === id ? null : id))}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10">
        <HubCornerControls />
        <div className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2">
          <button
            type="button"
            onClick={closeSeedProtocols}
            className="rounded-full border px-6 py-2.5 text-[12px] font-semibold tracking-[0.2em] uppercase backdrop-blur-md transition hover:opacity-90"
            style={{
              borderColor: SEED_PROTOCOL_VISUAL.glassBorder,
              backgroundColor: SEED_PROTOCOL_VISUAL.glassBg,
              color: SEED_PROTOCOL_VISUAL.accentMuted,
            }}
          >
            {strings.seedProtocols.backToHub.replace('\n', ' ')}
          </button>
        </div>
      </div>

      {recompileOpen && <RecompileConfirmModal onClose={() => setRecompileOpen(false)} />}
    </div>
  );
}
