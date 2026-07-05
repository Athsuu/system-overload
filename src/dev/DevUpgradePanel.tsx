import { useMemo, useRef, useState } from 'react';
import {
  getUpgradeCost,
  UPGRADE_CATALOG,
  type UpgradeId,
} from '../store/upgradeCatalog';
import { BRANCH_LABELS, getSkillNode } from '../store/skillTree';
import { useGameStore } from '../store/useGameStore';
import { devSetUpgradeLevel } from './devActions';
import { DevFloatingTooltip } from './DevFloatingTooltip';

function DevSkillTooltipContent({ upgradeId }: { upgradeId: UpgradeId }) {
  const upgrades = useGameStore((state) => state.upgrades);
  const skillNode = getSkillNode(upgradeId);
  const definition = skillNode;
  const branch = BRANCH_LABELS[skillNode.branch];
  const level = upgrades[upgradeId];
  const nextCost = level < definition.maxLevel ? getUpgradeCost(definition.baseCost, level) : null;

  return (
    <>
      <div className="mb-2 flex items-center gap-2">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded border text-[11px] font-bold text-white"
          style={{ borderColor: `${branch.color}66`, backgroundColor: `${branch.color}18` }}
        >
          {skillNode.icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-white">{definition.name}</p>
          <p className="text-[10px] tracking-wide uppercase" style={{ color: branch.color }}>
            {branch.label} · permanent
          </p>
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-white/65">{definition.description}</p>

      <div className="mt-2 space-y-1 border-t border-white/8 pt-2 font-mono text-[10px] text-white/45">
        <p>
          Level{' '}
          <span className="text-amber-300/90">
            {level} / {definition.maxLevel}
          </span>
        </p>
        <p>
          Base cost <span className="text-white/70">{definition.baseCost}</span>
          {nextCost !== null && (
            <>
              {' '}
              · Next{' '}
              <span className="text-white/70">{nextCost.toLocaleString()}</span>
            </>
          )}
        </p>
        <p className="text-white/30">id: {definition.id}</p>
      </div>

      {skillNode.requires && skillNode.requires.length > 0 && (
        <div className="mt-2 border-t border-white/8 pt-2">
          <p className="text-[9px] tracking-wider text-white/35 uppercase">Requires</p>
          <ul className="mt-1 space-y-0.5 text-[10px] text-white/50">
            {skillNode.requires.map((req) => {
              const reqDef = getSkillNode(req.id);
              const reqLevel = upgrades[req.id];
              const met = reqLevel >= req.minLevel;
              return (
                <li key={req.id} className={met ? 'text-emerald-400/80' : 'text-red-400/80'}>
                  {reqDef.name} LVL {req.minLevel}+ ({reqLevel}/{reqDef.maxLevel})
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}

export function DevUpgradePanel() {
  const upgrades = useGameStore((state) => state.upgrades);
  const [selectedId, setSelectedId] = useState<UpgradeId>(UPGRADE_CATALOG[0].id);
  const [hoveredId, setHoveredId] = useState<UpgradeId | null>(null);
  const rowRefs = useRef<Partial<Record<UpgradeId, HTMLDivElement | null>>>({});

  const selectedDefinition = useMemo(
    () => UPGRADE_CATALOG.find((entry) => entry.id === selectedId) ?? UPGRADE_CATALOG[0],
    [selectedId],
  );
  const currentLevel = upgrades[selectedId];

  const sortedCatalog = useMemo(
    () =>
      [...UPGRADE_CATALOG].sort((a, b) => {
        const branchA = getSkillNode(a.id).branch;
        const branchB = getSkillNode(b.id).branch;
        if (branchA !== branchB) return branchA.localeCompare(branchB);
        return a.name.localeCompare(b.name);
      }),
    [],
  );

  const setLevel = (level: number) => {
    devSetUpgradeLevel(selectedId, level);
  };

  const hoveredAnchorRef = {
    get current() {
      return hoveredId ? (rowRefs.current[hoveredId] ?? null) : null;
    },
  };

  return (
    <div className="space-y-2">
      <div className="max-h-32 overflow-y-auto rounded-lg border border-white/8 bg-black/30 pr-1">
        {sortedCatalog.map((definition) => {
          const skillNode = getSkillNode(definition.id);
          const level = upgrades[definition.id];
          const branch = BRANCH_LABELS[skillNode.branch];
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
                    ? 'bg-amber-500/15 text-white'
                    : 'text-white/75 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded border text-[10px] font-bold"
                  style={{
                    borderColor: `${branch.color}55`,
                    backgroundColor: `${branch.color}12`,
                    color: branch.color,
                  }}
                >
                  {skillNode.icon}
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
        {hoveredId && <DevSkillTooltipContent upgradeId={hoveredId} />}
      </DevFloatingTooltip>

      <div className="rounded-lg border border-white/8 bg-white/5 p-2">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="truncate text-[11px] font-medium text-white/85">{selectedDefinition.name}</p>
          <span className="shrink-0 font-mono text-[10px] text-amber-300/90">
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
