import { useState } from 'react';
import {
  getCoreProtocolCost,
  getCoreProtocolDefinition,
  getCoreProtocolState,
  isCoreProtocolMaxed,
} from '../../store/coreProtocolCatalog';
import { canRecompile } from '../../store/prestigeLogic';
import type { CoreProtocolId } from '../../store/prestigeTypes';
import { useGameStore } from '../../store/useGameStore';
import { useGameStrings } from '../../i18n/useGameStrings';
import { triggerSfx } from '../../audio/sfxApi';
import { HubCornerControls } from '../hub/HubCornerControls';
import { ArchGlitchLine } from '../arch/ArchGlitchText';
import { RecompileConfirmModal } from '../hub/RecompileConfirmModal';
import {
  listBranchNodeIds,
  listFundamentalProtocolIds,
  listSkillUnlockIds,
} from '../hub/seedProtocolLayout';
import { SkillBranchTree } from '../hub/SkillBranchTree';
import { getCoreProtocolTierVisual, SEED_PROTOCOL_VISUAL } from '../hub/seedProtocolTheme';

type SeedProtocolsTab = 'fundamentals' | 'skills';

function MonolithTierCard({
  id,
  isSelected,
  onSelect,
  size = 'default',
}: {
  id: CoreProtocolId;
  isSelected: boolean;
  onSelect: () => void;
  size?: 'default' | 'tree';
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
  const maxed = isCoreProtocolMaxed(definition, level);
  const isTree = size === 'tree';

  const handlePurchase = () => {
    const ok = purchaseCoreProtocol(id);
    if (ok) triggerSfx('purchase');
  };

  const levelLabel = maxed
    ? strings.ui.levelFormat
        .replace('{current}', String(level))
        .replace('{max}', String(definition.maxLevel ?? level))
    : definition.maxLevel === null
      ? strings.ui.levelFormatUncapped.replace('{n}', String(level))
      : strings.ui.levelFormat
          .replace('{current}', String(level))
          .replace('{max}', String(definition.maxLevel));

  const purchaseLabel =
    state === 'maxed'
      ? strings.ui.max
      : state === 'locked'
        ? strings.ui.requirementsNotMet
        : `${strings.ui.purchase} · ${cost} ${strings.currency.seedFragmentsShort}`;

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
      className={
        isTree
          ? 'w-full max-w-[140px] cursor-pointer rounded-2xl border px-2.5 py-3 text-left backdrop-blur-md transition-all duration-200 sm:max-w-none'
          : 'w-[min(88vw,400px)] cursor-pointer rounded-[28px] border px-6 py-4 text-left backdrop-blur-md transition-all duration-200'
      }
      style={{
        borderColor: visual.border,
        backgroundColor: visual.background,
        boxShadow: visual.glow,
        opacity: visual.opacity,
      }}
    >
      <div className={isTree ? 'flex flex-col gap-1.5' : 'flex items-center justify-between gap-4'}>
        <span
          className={
            isTree
              ? 'text-[10px] font-semibold leading-tight tracking-[0.12em] uppercase'
              : 'text-[13px] font-semibold tracking-[0.16em] uppercase'
          }
          style={{ color: visual.titleColor }}
        >
          {definition.name}
        </span>
        <span
          className={
            isTree
              ? 'font-mono text-[10px] font-semibold tabular-nums'
              : 'font-mono text-[13px] font-semibold tabular-nums'
          }
          style={{ color: visual.pipColor }}
        >
          {levelLabel}
        </span>
      </div>

      {isSelected && (
        <div className="mt-3 border-t pt-3" style={{ borderColor: visual.border }}>
          <p
            className={isTree ? 'text-[11px] leading-relaxed' : 'text-[13px] leading-relaxed'}
            style={{ color: visual.textColor }}
          >
            {definition.description}
          </p>
          <button
            type="button"
            disabled={state !== 'available'}
            onClick={(event) => {
              event.stopPropagation();
              handlePurchase();
            }}
            className={
              isTree
                ? 'mt-2 w-full rounded-xl border px-2 py-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase transition disabled:cursor-not-allowed disabled:opacity-35'
                : 'mt-3 w-full rounded-2xl border px-4 py-2 text-[12px] font-semibold tracking-[0.18em] uppercase transition disabled:cursor-not-allowed disabled:opacity-35'
            }
            style={{
              borderColor: `${SEED_PROTOCOL_VISUAL.accent}66`,
              color: SEED_PROTOCOL_VISUAL.accentMuted,
            }}
          >
            {purchaseLabel}
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
  const coreProtocols = useGameStore((state) => state.coreProtocols);
  const [tab, setTab] = useState<SeedProtocolsTab>('fundamentals');
  const [selectedId, setSelectedId] = useState<CoreProtocolId | null>(null);
  const [recompileOpen, setRecompileOpen] = useState(false);
  const showRecompile = canRecompile(cyclesCleared);

  const fundamentalIds = listFundamentalProtocolIds();
  const skillUnlockIds = listSkillUnlockIds();

  const handleSelect = (id: CoreProtocolId) => {
    setSelectedId((current) => (current === id ? null : id));
  };

  const handleTabChange = (next: SeedProtocolsTab) => {
    setTab(next);
    setSelectedId(null);
  };

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
        <div className="pointer-events-auto mt-5 flex gap-2">
          {(
            [
              ['fundamentals', strings.seedProtocols.tabFundamentals],
              ['skills', strings.seedProtocols.tabSkills],
            ] as const
          ).map(([id, label]) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleTabChange(id)}
                className="rounded-full border px-5 py-2 text-[11px] font-semibold tracking-[0.2em] uppercase transition"
                style={{
                  borderColor: active ? `${SEED_PROTOCOL_VISUAL.accent}88` : SEED_PROTOCOL_VISUAL.glassBorder,
                  backgroundColor: active
                    ? SEED_PROTOCOL_VISUAL.glassBgSelected
                    : SEED_PROTOCOL_VISUAL.glassBg,
                  color: active ? SEED_PROTOCOL_VISUAL.accentMuted : 'rgba(148, 163, 184, 0.7)',
                  boxShadow: active ? `0 0 18px ${SEED_PROTOCOL_VISUAL.accentGlow}` : 'none',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="absolute inset-x-0 top-36 bottom-24 flex justify-center overflow-y-auto">
        <div
          className={`relative flex min-h-full items-center justify-center gap-6 py-8 ${
            tab === 'fundamentals' ? 'flex-col-reverse' : 'flex-col'
          }`}
        >
          <div
            className="pointer-events-none absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2"
            style={{
              background: `linear-gradient(180deg, transparent, ${SEED_PROTOCOL_VISUAL.spineLine} 12%, ${SEED_PROTOCOL_VISUAL.spineLine} 88%, transparent)`,
            }}
            aria-hidden
          />

          {tab === 'fundamentals' && (
            <div className="relative z-10 flex flex-col items-center gap-1">
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: SEED_PROTOCOL_VISUAL.accent,
                  boxShadow: `0 0 12px ${SEED_PROTOCOL_VISUAL.accentGlow}`,
                }}
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
          )}

          {tab === 'fundamentals' &&
            fundamentalIds.map((id) => (
              <div key={id} className="relative z-10">
                <MonolithTierCard
                  id={id}
                  isSelected={selectedId === id}
                  onSelect={() => handleSelect(id)}
                />
              </div>
            ))}

          {tab === 'skills' && (
            <>
              <div className="relative z-10 flex flex-col items-center gap-1">
                <span className="font-mono text-[11px] tracking-[0.24em] text-white/30 uppercase">
                  {strings.seedProtocols.recompileDepthLabel.replace('{n}', String(recompileDepth))}
                </span>
                {showRecompile && (
                  <button
                    type="button"
                    onClick={() => setRecompileOpen(true)}
                    className="mt-2 rounded-full border px-5 py-2 text-[12px] font-semibold tracking-[0.2em] uppercase backdrop-blur-md transition hover:opacity-90"
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
              {skillUnlockIds.map((id) => {
                const owned = coreProtocols[id] >= 1;
                const branchNodes = listBranchNodeIds(id);
                return (
                  <div key={id} className="relative z-10 flex w-full flex-col items-center gap-0 px-3">
                    <MonolithTierCard
                      id={id}
                      isSelected={selectedId === id}
                      onSelect={() => handleSelect(id)}
                    />
                    {owned && branchNodes.length > 0 && (
                      <SkillBranchTree>
                        {branchNodes.map((branchId) => (
                          <MonolithTierCard
                            key={branchId}
                            id={branchId}
                            size="tree"
                            isSelected={selectedId === branchId}
                            onSelect={() => handleSelect(branchId)}
                          />
                        ))}
                      </SkillBranchTree>
                    )}
                  </div>
                );
              })}
            </>
          )}
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
