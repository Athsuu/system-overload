import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import {
  KERNEL_MODULE_CATALOG,
  getKernelModuleDefinition,
  type KernelModuleId,
} from '../store/kernelModuleCatalog';
import { DARK_HEX } from '../theme/darkHexTerminal';
import { GAME_NARRATIVE } from './gameNarrative';
import { hexagonPoints } from './skillTreeGeometry';

function ModuleCard({
  id,
  onInstall,
}: {
  id: KernelModuleId;
  onInstall: (id: KernelModuleId) => void;
}) {
  const runCycles = useGameStore((state) => state.runCycles);
  const level = useGameStore((state) => state.runModuleLevels[id] ?? 0);
  const definition = getKernelModuleDefinition(id);
  const isMaxed = level >= definition.maxLevel;
  const canAfford = runCycles >= definition.cycleCost;
  const { installLabel, maxedLabel, cycleCostSuffix } = GAME_NARRATIVE.moduleBay;

  return (
    <div
      className="flex flex-col border px-3 py-4 text-center"
      style={{
        backgroundColor: DARK_HEX.tooltipBg,
        borderColor: isMaxed ? 'rgba(197, 160, 89, 0.15)' : DARK_HEX.tooltipBorder,
      }}
    >
      <svg viewBox="0 0 64 64" className="mx-auto mb-2 h-12 w-12">
        <polygon
          points={hexagonPoints(32, 32, 28)}
          fill="#120808"
          stroke={isMaxed ? DARK_HEX.goldMuted : DARK_HEX.gold}
          strokeWidth={1}
          strokeOpacity={0.55}
        />
      </svg>
      <h3
        className="text-[11px] tracking-[0.12em] uppercase"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: DARK_HEX.gold }}
      >
        {definition.name}
      </h3>
      <p className="mt-1.5 min-h-[2.5rem] text-[10px] leading-relaxed text-white/45">
        {definition.description}
      </p>
      <p className="mt-2 font-mono text-[9px] text-white/35">
        LVL {level}/{definition.maxLevel}
      </p>
      {isMaxed ? (
        <span className="mt-3 text-[9px] tracking-[0.15em] text-white/25 uppercase">
          {maxedLabel}
        </span>
      ) : (
        <button
          type="button"
          disabled={!canAfford}
          onClick={() => onInstall(id)}
          className="mt-3 border px-3 py-1.5 text-[9px] font-semibold tracking-[0.14em] uppercase transition enabled:hover:border-white/30 enabled:hover:text-white/80 disabled:cursor-not-allowed disabled:opacity-35"
          style={{
            borderColor: canAfford ? DARK_HEX.tooltipBorder : 'rgba(255,255,255,0.08)',
            color: canAfford ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.3)',
          }}
        >
          {installLabel} · {definition.cycleCost} {cycleCostSuffix}
        </button>
      )}
    </div>
  );
}

export function ModuleBayScreen() {
  const runCycles = useGameStore((state) => state.runCycles);
  const runLevel = useGameStore((state) => state.runLevel);
  const purchaseModule = useGameStore((state) => state.purchaseModule);
  const closeModuleBay = useGameStore((state) => state.closeModuleBay);
  const {
    title,
    subtitle,
    cyclesLabel,
    levelUpHint,
    resumeLabel,
    loreSnippet,
  } = GAME_NARRATIVE.moduleBay;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      closeModuleBay();
    };

    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
  }, [closeModuleBay]);

  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center">
      <div className="so-animate-fade-in-slow absolute inset-0 bg-[#0a0a0f]/92" />

      <div
        className="relative mx-4 flex max-h-[90vh] w-full max-w-3xl flex-col border px-6 py-6"
        style={{
          backgroundColor: DARK_HEX.tooltipBg,
          borderColor: DARK_HEX.tooltipBorder,
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${DARK_HEX.gold}, transparent)`,
          }}
        />

        <div className="text-center">
          <p className="text-[10px] tracking-[0.35em] text-white/40 uppercase">{levelUpHint}</p>
          <h2
            className="mt-2 text-xl tracking-[0.22em] uppercase"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: DARK_HEX.gold }}
          >
            {title}
          </h2>
          <p className="mt-1 text-[11px] tracking-[0.12em] text-white/45">{subtitle}</p>
          <p className="mt-2 text-[10px] italic leading-relaxed text-white/30">{loreSnippet}</p>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2">
          <span className="text-[10px] tracking-[0.2em] text-white/40 uppercase">{cyclesLabel}</span>
          <span
            className="font-mono text-lg font-semibold"
            style={{ color: DARK_HEX.gold }}
          >
            {runCycles}
          </span>
          <span className="text-[9px] tracking-[0.15em] text-white/25 uppercase">
            · Kernel LVL {runLevel}
          </span>
        </div>

        <div className="mt-5 grid flex-1 grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
          {KERNEL_MODULE_CATALOG.map((module) => (
            <ModuleCard key={module.id} id={module.id} onInstall={purchaseModule} />
          ))}
        </div>

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={closeModuleBay}
            className="border px-10 py-2.5 text-[10px] font-semibold tracking-[0.18em] text-white/55 uppercase transition hover:border-white/25 hover:text-white/80"
            style={{ borderColor: DARK_HEX.tooltipBorder }}
          >
            {resumeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
