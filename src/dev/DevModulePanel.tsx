import { useMemo, useRef, useState } from 'react';
import {
  getKernelModuleDefinition,
  KERNEL_MODULE_CATALOG,
  type KernelModuleId,
} from '../store/kernelModuleCatalog';
import { useGameStore } from '../store/useGameStore';
import { devSetModuleLevel } from './devActions';
import { DevFloatingTooltip } from './DevFloatingTooltip';

function moduleAbbrev(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function DevModuleTooltipContent({ moduleId }: { moduleId: KernelModuleId }) {
  const runModuleLevels = useGameStore((state) => state.runModuleLevels);
  const definition = getKernelModuleDefinition(moduleId);
  const level = runModuleLevels[moduleId] ?? 0;

  return (
    <>
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-cyan-500/35 bg-cyan-500/10 text-[10px] font-bold text-cyan-200">
          {moduleAbbrev(definition.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-white">{definition.name}</p>
          <p className="text-[10px] tracking-wide text-cyan-400/80 uppercase">Run module</p>
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-white/65">{definition.description}</p>

      <div className="mt-2 space-y-1 border-t border-white/8 pt-2 font-mono text-[10px] text-white/45">
        <p>
          Level{' '}
          <span className="text-cyan-300/90">
            {level} / {definition.maxLevel}
          </span>
        </p>
        <p>
          Cycle cost <span className="text-white/70">{definition.cycleCost}</span>
        </p>
        <p className="text-white/30">id: {definition.id}</p>
      </div>

      <p className="mt-2 border-t border-white/8 pt-2 text-[10px] text-white/35">
        Mid-run only — levels reset when a new run starts.
      </p>
    </>
  );
}

export function DevModulePanel() {
  const runModuleLevels = useGameStore((state) => state.runModuleLevels);
  const [selectedId, setSelectedId] = useState<KernelModuleId>(KERNEL_MODULE_CATALOG[0].id);
  const [hoveredId, setHoveredId] = useState<KernelModuleId | null>(null);
  const rowRefs = useRef<Partial<Record<KernelModuleId, HTMLDivElement | null>>>({});

  const selectedDefinition = useMemo(
    () => getKernelModuleDefinition(selectedId),
    [selectedId],
  );
  const currentLevel = runModuleLevels[selectedId] ?? 0;

  const sortedCatalog = useMemo(
    () => [...KERNEL_MODULE_CATALOG].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const setLevel = (level: number) => {
    devSetModuleLevel(selectedId, level);
  };

  const hoveredAnchorRef = {
    get current() {
      return hoveredId ? (rowRefs.current[hoveredId] ?? null) : null;
    },
  };

  return (
    <div className="space-y-2">
      <div className="max-h-32 overflow-y-auto rounded-lg border border-cyan-500/15 bg-black/30 pr-1">
        {sortedCatalog.map((definition) => {
          const level = runModuleLevels[definition.id] ?? 0;
          const isSelected = selectedId === definition.id;

          return (
            <div
              key={definition.id}
              ref={(node) => {
                rowRefs.current[definition.id] = node;
              }}
              onMouseEnter={() => setHoveredId(definition.id)}
              onMouseLeave={() => setHoveredId((current) => (current === definition.id ? null : current))}
            >
              <button
                type="button"
                onClick={() => setSelectedId(definition.id)}
                className={`flex w-full items-center gap-2 px-2 py-1.5 text-left transition ${
                  isSelected
                    ? 'bg-cyan-500/12 text-white'
                    : 'text-white/75 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-cyan-500/30 bg-cyan-500/8 text-[9px] font-bold text-cyan-200/90">
                  {moduleAbbrev(definition.name)}
                </span>
                <span className="min-w-0 flex-1 truncate text-[11px]">{definition.name}</span>
                <span
                  className={`shrink-0 font-mono text-[10px] ${
                    level >= definition.maxLevel ? 'text-emerald-400/90' : 'text-white/40'
                  }`}
                >
                  {level}/{definition.maxLevel}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <DevFloatingTooltip open={hoveredId !== null} anchorRef={hoveredAnchorRef} anchorKey={hoveredId}>
        {hoveredId && <DevModuleTooltipContent moduleId={hoveredId} />}
      </DevFloatingTooltip>

      <div className="rounded-lg border border-white/8 bg-white/5 p-2">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="truncate text-[11px] font-medium text-white/85">{selectedDefinition.name}</p>
          <span className="shrink-0 font-mono text-[10px] text-cyan-300/90">
            LVL {currentLevel}/{selectedDefinition.maxLevel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setLevel(0)}
            className="rounded border border-white/10 px-2 py-1 text-[10px] text-white/60 hover:border-white/25 hover:text-white"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => setLevel(Math.max(0, currentLevel - 1))}
            disabled={currentLevel <= 0}
            className="rounded border border-white/10 px-2.5 py-1 text-xs text-white/70 hover:border-cyan-500/30 disabled:opacity-30"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setLevel(Math.min(selectedDefinition.maxLevel, currentLevel + 1))}
            disabled={currentLevel >= selectedDefinition.maxLevel}
            className="rounded border border-white/10 px-2.5 py-1 text-xs text-white/70 hover:border-cyan-500/30 disabled:opacity-30"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setLevel(selectedDefinition.maxLevel)}
            className="rounded border border-white/10 px-2 py-1 text-[10px] text-white/60 hover:border-white/25 hover:text-white"
          >
            Max
          </button>
        </div>

        <p className="mt-2 text-[10px] leading-relaxed text-white/40">{selectedDefinition.description}</p>
      </div>
    </div>
  );
}
