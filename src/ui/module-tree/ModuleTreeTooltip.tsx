import { useEffect, useRef, type CSSProperties, type MouseEvent } from 'react';
import { useGameStore } from '../../store/useGameStore';
import {
  ANCHOR_SUPERCHARGE_COST,
  getModuleState,
  getUpgradeCost,
  getUpgradeCurrency,
  getUpgradeDefinition,
  isAnchorSuperchargeEligible,
  type UpgradeId,
} from '../../store/upgradeCatalog';
import { getModuleNode, getParentRequirementLabel, getModuleGlyphId, getUpgradeBranch } from '../../store/moduleTree';
import { useGameStrings } from '../../i18n/useGameStrings';
import { triggerSfx } from '../../audio/sfxApi';
import { getTooltipHeight, getUpgradeTooltipLines } from './upgradeTooltipStats';
import { playOneShotAnimation } from '../shared/animations';
import { ModuleBranchIcon } from './moduleTreeBranchIcons';
import { MODULE_TREE_VISUAL } from './moduleTreeTheme';
import { DARK_HEX } from '../../theme/darkHexTerminal';
import { formatCompactNumber } from '../shared/formatNumber';

const STAT_GREEN = '#4ade80';
export const MODULE_TREE_TOOLTIP_TITLE_ID = 'module-tree-popover-title';

export function getModuleTreeTooltipHeight(statLineCount: number): number {
  return getTooltipHeight(statLineCount);
}

export const MODULE_TREE_POPOVER_WIDTH = 300;

function getPurchaseButtonStyle(isAvailable: boolean, isAnchor: boolean): CSSProperties {
  if (isAvailable) {
    return {
      borderColor: isAnchor ? `${DARK_HEX.breachGlow}88` : `${MODULE_TREE_VISUAL.edgeActive}88`,
      backgroundColor: '#2a0808',
      boxShadow: `0 0 16px ${isAnchor ? DARK_HEX.breachGlow : MODULE_TREE_VISUAL.edgeActive}33`,
    };
  }
  return { borderColor: '#5c1515', backgroundColor: '#120808' };
}

function StatRow({
  label,
  current,
  next,
  isMaxed,
  maxLabel,
}: {
  label: string;
  current: string;
  next: string | null;
  isMaxed: boolean;
  maxLabel: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-[15px]">
      <span className="min-w-0 flex-1 break-words text-white/45">{label}</span>
      <span className="shrink-0 text-right font-mono whitespace-nowrap">
        <span className="text-white/85">{current}</span>
        {!isMaxed && next !== null && (
          <>
            <span className="mx-1 text-white/25">→</span>
            <span style={{ color: STAT_GREEN }}>{next}</span>
          </>
        )}
        {isMaxed && <span className="ml-1.5 text-[13px] tracking-wider text-white/30 uppercase">{maxLabel}</span>}
      </span>
    </div>
  );
}

interface ModuleTreeTooltipProps {
  selectedId: UpgradeId;
}

export function ModuleTreeTooltip({ selectedId }: ModuleTreeTooltipProps) {
  const bankShards = useGameStore((state) => state.bankShards);
  const bankAnchorFragments = useGameStore((state) => state.bankAnchorFragments);
  const upgrades = useGameStore((state) => state.upgrades);
  const purchaseUpgrade = useGameStore((state) => state.purchaseUpgrade);
  const anchored = useGameStore((state) => state.anchoredNodes[selectedId]);
  const purchaseAnchorSupercharge = useGameStore((state) => state.purchaseAnchorSupercharge);
  const toggleAnchorSupercharge = useGameStore((state) => state.toggleAnchorSupercharge);
  const strings = useGameStrings();
  const panelRef = useRef<HTMLDivElement>(null);

  const moduleNode = getModuleNode(selectedId);
  const definition = getUpgradeDefinition(selectedId);
  const currency = getUpgradeCurrency(selectedId);
  const isAnchor = currency === 'anchor';
  const level = upgrades[selectedId];
  const state = getModuleState(
    selectedId,
    bankShards,
    bankAnchorFragments,
    upgrades,
    moduleNode.requires,
  );
  const isMaxed = state === 'maxed';
  const isAvailable = state === 'available';
  const cost = isMaxed ? 0 : getUpgradeCost(definition, level);
  const balance = isAnchor ? bankAnchorFragments : bankShards;
  const costProgress = isMaxed ? 100 : Math.min(100, (balance / Math.max(cost, 1)) * 100);
  const statLines = getUpgradeTooltipLines(selectedId, upgrades);
  const branch = getUpgradeBranch(selectedId);
  const glyph = getModuleGlyphId(selectedId, branch);

  useEffect(() => {
    playOneShotAnimation(panelRef.current, 'so-animate-slide-up');
  }, [selectedId, level]);

  const handlePurchase = (event: MouseEvent<HTMLButtonElement>) => {
    if (!purchaseUpgrade(selectedId)) return;
    triggerSfx('purchase');
    playOneShotAnimation(event.currentTarget, 'so-animate-purchase-flash');
  };

  const isSuperchargeEligible = isAnchorSuperchargeEligible(selectedId) && level >= 1;
  const isAnchored = anchored !== undefined;
  const anchorActive = anchored === true;
  const canSupercharge = bankAnchorFragments >= ANCHOR_SUPERCHARGE_COST;

  const handleSupercharge = (event: MouseEvent<HTMLButtonElement>) => {
    if (!purchaseAnchorSupercharge(selectedId)) return;
    triggerSfx('purchase');
    playOneShotAnimation(event.currentTarget, 'so-animate-purchase-flash');
  };

  const handleToggleSupercharge = () => {
    toggleAnchorSupercharge(selectedId);
    triggerSfx('uiConfirm');
  };

  return (
    <div
      ref={panelRef}
      data-module-tooltip
      className="pointer-events-auto w-full min-w-0 overflow-hidden rounded border px-4 py-3 shadow-[0_0_32px_rgba(255,77,0,0.15)]"
      style={{
        backgroundColor: MODULE_TREE_VISUAL.tooltipBg,
        borderColor: isAnchor ? DARK_HEX.breachGlow : MODULE_TREE_VISUAL.tooltipBorder,
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
        <div className="flex items-start gap-3">
          {glyph && (
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded border text-sm font-bold text-white"
              style={{
                borderColor: isAnchor ? DARK_HEX.breachGlow : MODULE_TREE_VISUAL.goldMuted,
                backgroundColor: '#2a0808',
              }}
            >
              <ModuleBranchIcon glyph={glyph} size={22} color="#ffffff" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p
              id={MODULE_TREE_TOOLTIP_TITLE_ID}
              className="text-[14px] font-semibold tracking-[0.2em] uppercase"
              style={{ color: isAnchor ? DARK_HEX.breachGlow : MODULE_TREE_VISUAL.gold }}
            >
              {definition.name}
            </p>
            <p className="mt-0.5 text-[13px] tracking-wide text-white/30 uppercase">
              {Number.isFinite(definition.maxLevel)
                ? strings.ui.levelFormat
                    .replace('{current}', String(level))
                    .replace('{max}', String(definition.maxLevel))
                : strings.ui.levelFormatUncapped.replace('{n}', String(level))}
            </p>
          </div>
        </div>

        <p className="mt-2 text-[15px] leading-relaxed text-white/45">{definition.description}</p>

        <div className="mt-3 space-y-1.5 border-t border-white/8 pt-2.5">
          {statLines.map((stat) => (
            <StatRow
              key={stat.label}
              label={stat.label}
              current={stat.current}
              next={stat.next}
              isMaxed={isMaxed}
              maxLabel={strings.tooltipStats.max}
            />
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-[14px] text-white/45">
          <span className="min-w-0 text-white/35">
            {isMaxed ? strings.ui.fullyUpgraded : strings.ui.nextRankCost}
          </span>
          {!isMaxed ? (
            <span className="shrink-0 font-mono" style={{ color: isAnchor ? DARK_HEX.breachGlow : MODULE_TREE_VISUAL.gold }}>
              {formatCompactNumber(balance)} / {formatCompactNumber(cost)}
            </span>
          ) : (
            <button
              type="button"
              disabled
              className="shrink-0 rounded border px-4 py-1.5 text-xs font-semibold tracking-wide text-white uppercase opacity-35"
              style={getPurchaseButtonStyle(false, isAnchor)}
            >
              {strings.ui.max}
            </button>
          )}
        </div>

        {!isMaxed && (
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${costProgress}%`,
                background: `linear-gradient(90deg, #5c1515, ${isAnchor ? DARK_HEX.breachGlow : MODULE_TREE_VISUAL.edgeActive})`,
              }}
            />
          </div>
        )}

        {state === 'locked' && (
          <p className="mt-2 text-[14px]" style={{ color: '#ff5533' }}>
            {getParentRequirementLabel(moduleNode.requires) ?? strings.ui.requirementsNotMet}
          </p>
        )}

        {!isMaxed && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              disabled={!isAvailable}
              onClick={handlePurchase}
              className="rounded border px-4 py-1.5 text-xs font-semibold tracking-wide text-white uppercase transition disabled:cursor-not-allowed disabled:opacity-35"
              style={getPurchaseButtonStyle(isAvailable, isAnchor)}
            >
              {isAnchor ? strings.ui.purchaseAnchor : strings.ui.purchase}
            </button>
          </div>
        )}

        {isSuperchargeEligible && (
          <div className="mt-3 border-t border-white/8 pt-2.5">
            <p className="mb-1.5 text-[13px] tracking-wider text-white/40 uppercase">
              {strings.hardwareSupercharge.sectionTitle}
            </p>

            {isAnchored ? (
              <button
                type="button"
                onClick={handleToggleSupercharge}
                className="flex w-full items-center justify-between rounded-full border px-3 py-1.5 transition"
                style={{
                  borderColor: anchorActive ? DARK_HEX.breachGlow : '#3a3a42',
                  backgroundColor: anchorActive ? '#2a1508' : '#15151a',
                }}
              >
                <span
                  className="text-[13px] font-semibold tracking-wide uppercase"
                  style={{ color: anchorActive ? DARK_HEX.breachGlow : 'rgba(255,255,255,0.4)' }}
                >
                  {anchorActive ? strings.hardwareSupercharge.toggleOn : strings.hardwareSupercharge.toggleOff}
                </span>
                <span
                  className="h-4 w-8 rounded-full transition"
                  style={{ backgroundColor: anchorActive ? DARK_HEX.breachGlow : '#3a3a42' }}
                >
                  <span
                    className="block h-4 w-4 rounded-full bg-white transition-transform"
                    style={{ transform: anchorActive ? 'translateX(1rem)' : 'translateX(0)' }}
                  />
                </span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={!canSupercharge}
                  onClick={handleSupercharge}
                  className="w-full rounded border px-4 py-1.5 text-xs font-semibold tracking-wide text-white uppercase transition disabled:cursor-not-allowed disabled:opacity-35"
                  style={getPurchaseButtonStyle(canSupercharge, true)}
                >
                  {strings.hardwareSupercharge.superchargeButton} ·{' '}
                  {strings.hardwareSupercharge.costFormat.replace('{n}', String(ANCHOR_SUPERCHARGE_COST))}
                </button>
                <p className="mt-1.5 text-[12px]" style={{ color: '#4ade80' }}>
                  {strings.hardwareSupercharge.bonusLabel}
                </p>
                <p className="text-[12px]" style={{ color: DARK_HEX.breachGlow }}>
                  {strings.hardwareSupercharge.malusLabel}
                </p>
              </>
            )}
          </div>
        )}
    </div>
  );
}
