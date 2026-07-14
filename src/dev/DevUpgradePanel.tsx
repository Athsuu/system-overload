import { useMemo, useRef, useState } from 'react';
import {
  getUpgradeCost,
  getUpgradeDefinition,
  type UpgradeId,
} from '../store/upgradeCatalog';
import {
  getModuleGlyphId,
  getModuleIconBranch,
  getModuleIconBranchMeta,
  getModuleNode,
  MODULE_TREE_NODES,
  type ModuleGlyphId,
} from '../store/moduleTree';
import { useGameStore } from '../store/useGameStore';
import { ModuleBranchIcon } from '../ui/moduleTreeBranchIcons';
import { devSetUpgradeLevel, DEV_UNCAPPED_PREVIEW_LEVEL } from './devActions';
import { DevFloatingTooltip } from './DevFloatingTooltip';

function getGlyphAccentColor(
  glyph: ModuleGlyphId | null,
  iconBranch: ReturnType<typeof getModuleIconBranch>,
): string {
  if (!glyph) return getModuleIconBranchMeta()[iconBranch].color;
  if (glyph === 'shard') return '#c5a059';
  return getModuleIconBranchMeta()[iconBranch].color;
}

function DevModuleTooltipContent({ upgradeId }: { upgradeId: UpgradeId }) {
  const upgrades = useGameStore((state) => state.upgrades);
  const moduleNode = getModuleNode(upgradeId);
  const definition = getUpgradeDefinition(upgradeId);
  const iconBranch = getModuleIconBranch(upgradeId, moduleNode.branch);
  const glyph = getModuleGlyphId(upgradeId, moduleNode.branch);
  const branch = getModuleIconBranchMeta()[iconBranch];
  const glyphColor = getGlyphAccentColor(glyph, iconBranch);
  const level = upgrades[upgradeId];
  const nextCost = level < definition.maxLevel ? getUpgradeCost(definition, level) : null;

  return (
    <>
      <div className="mb-2 flex items-center gap-2">
        {glyph && (
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded border text-[15px] font-bold text-white"
            style={{ borderColor: `${branch.color}66`, backgroundColor: `${branch.color}18` }}
          >
            <ModuleBranchIcon glyph={glyph} size={18} color={glyphColor} />
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-white">{definition.name}</p>
          <p className="text-[14px] tracking-wide uppercase" style={{ color: branch.color }}>
            {branch.label} · permanent
          </p>
        </div>
      </div>

      <p className="text-[15px] leading-relaxed text-white/65">{definition.description}</p>

      <div className="mt-2 space-y-1 border-t border-white/8 pt-2 font-mono text-[14px] text-white/45">
        <p>
          Level{' '}
          <span className="text-amber-300/90">
            {level} / {definition.maxLevel}
          </span>
        </p>
        <p>
          Next cost{' '}
          {nextCost !== null && (
            <span className="text-white/70">{nextCost.toLocaleString()}</span>
          )}
        </p>
        <p className="text-white/30">id: {definition.id}</p>
      </div>

      {moduleNode.requires && moduleNode.requires.length > 0 && (
        <div className="mt-2 border-t border-white/8 pt-2">
          <p className="text-[13px] tracking-wider text-white/35 uppercase">Requires</p>
          <ul className="mt-1 space-y-0.5 text-[14px] text-white/50">
            {moduleNode.requires.map((req) => {
              const reqDef = getModuleNode(req.id);
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
  const [selectedId, setSelectedId] = useState<UpgradeId>('node0Boot');
  const [hoveredId, setHoveredId] = useState<UpgradeId | null>(null);
  const rowRefs = useRef<Partial<Record<UpgradeId, HTMLDivElement | null>>>({});

  const selectedDefinition = useMemo(
    () => getUpgradeDefinition(selectedId),
    [selectedId],
  );
  const currentLevel = upgrades[selectedId];

  const sortedTreeNodes = useMemo(
    () =>
      [...MODULE_TREE_NODES].sort((a, b) => {
        if (a.branch !== b.branch) return a.branch.localeCompare(b.branch);
        return getUpgradeDefinition(a.id).name.localeCompare(getUpgradeDefinition(b.id).name);
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
        {sortedTreeNodes.map((treeNode) => {
          const definition = getUpgradeDefinition(treeNode.id);
          const moduleNode = getModuleNode(treeNode.id);
          const level = upgrades[treeNode.id];
          const iconBranch = getModuleIconBranch(treeNode.id, moduleNode.branch);
          const glyph = getModuleGlyphId(treeNode.id, moduleNode.branch);
          const glyphColor = getGlyphAccentColor(glyph, iconBranch);
          const isSelected = selectedId === treeNode.id;

          return (
            <div
              key={treeNode.id}
              ref={(node) => {
                rowRefs.current[treeNode.id] = node;
              }}
              onMouseEnter={() => setHoveredId(treeNode.id)}
              onMouseLeave={() => setHoveredId((current) => (current === treeNode.id ? null : current))}
            >
              <button
                type="button"
                onClick={() => setSelectedId(treeNode.id)}
                className={`flex w-full items-center gap-2 px-2 py-1.5 text-left transition ${
                  isSelected
                    ? 'bg-amber-500/15 text-white'
                    : 'text-white/75 hover:bg-white/5 hover:text-white'
                }`}
              >
                {glyph && (
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded border text-[14px] font-bold"
                    style={{
                      borderColor: `${glyphColor}55`,
                      backgroundColor: `${glyphColor}12`,
                      color: glyphColor,
                    }}
                  >
                    <ModuleBranchIcon glyph={glyph} size={16} color={glyphColor} />
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate text-[15px]">{moduleNode.name}</span>
                <span
                  className={`shrink-0 font-mono text-[14px] ${
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
        {hoveredId && <DevModuleTooltipContent upgradeId={hoveredId} />}
      </DevFloatingTooltip>

      <div className="rounded-lg border border-white/8 bg-white/5 p-2">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="truncate text-[15px] font-medium text-white/85">{selectedDefinition.name}</p>
          <span className="shrink-0 font-mono text-[14px] text-amber-300/90">
            LVL {currentLevel}/{selectedDefinition.maxLevel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setLevel(0)}
            className="rounded border border-white/10 px-2 py-1 text-[14px] text-white/60 hover:border-white/25 hover:text-white"
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
            onClick={() =>
              setLevel(
                Number.isFinite(selectedDefinition.maxLevel)
                  ? selectedDefinition.maxLevel
                  : DEV_UNCAPPED_PREVIEW_LEVEL,
              )
            }
            className="rounded border border-white/10 px-2 py-1 text-[14px] text-white/60 hover:border-white/25 hover:text-white"
          >
            Max
          </button>
        </div>

        <p className="mt-2 text-[14px] leading-relaxed text-white/40">{selectedDefinition.description}</p>
      </div>
    </div>
  );
}
