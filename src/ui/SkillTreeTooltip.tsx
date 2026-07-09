import { useEffect, useRef, type CSSProperties, type MouseEvent } from 'react';
import { useGameStore } from '../store/useGameStore';
import {
  getSkillState,
  getUpgradeCost,
  getUpgradeCurrency,
  getUpgradeDefinition,
  type UpgradeId,
} from '../store/upgradeCatalog';
import { getSkillNode, getParentRequirementLabel, getSkillGlyphId, getUpgradeBranch } from '../store/skillTree';
import { useGameStrings } from '../i18n/useGameStrings';
import { triggerSfx } from '../audio/sfxApi';
import { getTooltipHeight, getUpgradeTooltipLines } from './upgradeTooltipStats';
import { playOneShotAnimation } from './animations';
import { SkillBranchIcon } from './skillTreeBranchIcons';
import { SKILL_TREE_VISUAL } from './skillTreeTheme';
import { DARK_HEX } from '../theme/darkHexTerminal';

const STAT_GREEN = '#4ade80';
export const SKILL_TREE_TOOLTIP_TITLE_ID = 'skill-tree-popover-title';

export function getSkillTreeTooltipHeight(statLineCount: number): number {
  return getTooltipHeight(statLineCount);
}

export const SKILL_TREE_POPOVER_WIDTH = 300;

function getPurchaseButtonStyle(isAvailable: boolean, isAnchor: boolean): CSSProperties {
  if (isAvailable) {
    return {
      borderColor: isAnchor ? `${DARK_HEX.breachGlow}88` : `${SKILL_TREE_VISUAL.edgeActive}88`,
      backgroundColor: '#2a0808',
      boxShadow: `0 0 16px ${isAnchor ? DARK_HEX.breachGlow : SKILL_TREE_VISUAL.edgeActive}33`,
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
      <span className="shrink-0 text-white/45">{label}</span>
      <span className="text-right font-mono">
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

interface SkillTreeTooltipProps {
  selectedId: UpgradeId;
}

export function SkillTreeTooltip({ selectedId }: SkillTreeTooltipProps) {
  const bankShards = useGameStore((state) => state.bankShards);
  const bankAnchorFragments = useGameStore((state) => state.bankAnchorFragments);
  const upgrades = useGameStore((state) => state.upgrades);
  const purchaseUpgrade = useGameStore((state) => state.purchaseUpgrade);
  const strings = useGameStrings();
  const panelRef = useRef<HTMLDivElement>(null);

  const skillNode = getSkillNode(selectedId);
  const definition = getUpgradeDefinition(selectedId);
  const currency = getUpgradeCurrency(selectedId);
  const isAnchor = currency === 'anchor';
  const level = upgrades[selectedId];
  const state = getSkillState(
    selectedId,
    bankShards,
    bankAnchorFragments,
    upgrades,
    skillNode.requires,
  );
  const isMaxed = state === 'maxed';
  const isAvailable = state === 'available';
  const cost = isMaxed ? 0 : getUpgradeCost(definition, level);
  const balance = isAnchor ? bankAnchorFragments : bankShards;
  const costProgress = isMaxed ? 100 : Math.min(100, (balance / Math.max(cost, 1)) * 100);
  const statLines = getUpgradeTooltipLines(selectedId, upgrades);
  const branch = getUpgradeBranch(selectedId);
  const glyph = getSkillGlyphId(selectedId, branch);

  useEffect(() => {
    playOneShotAnimation(panelRef.current, 'so-animate-slide-up');
  }, [selectedId, level]);

  const handlePurchase = (event: MouseEvent<HTMLButtonElement>) => {
    if (!purchaseUpgrade(selectedId)) return;
    triggerSfx('purchase');
    playOneShotAnimation(event.currentTarget, 'so-animate-purchase-flash');
  };

  return (
    <div
      ref={panelRef}
      data-skill-tooltip
      className="pointer-events-auto rounded border px-4 py-3 shadow-[0_0_32px_rgba(255,77,0,0.15)]"
      style={{
        backgroundColor: SKILL_TREE_VISUAL.tooltipBg,
        borderColor: isAnchor ? DARK_HEX.breachGlow : SKILL_TREE_VISUAL.tooltipBorder,
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
        <div className="flex items-start gap-3">
          {glyph && (
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded border text-sm font-bold text-white"
              style={{
                borderColor: isAnchor ? DARK_HEX.breachGlow : SKILL_TREE_VISUAL.goldMuted,
                backgroundColor: '#2a0808',
              }}
            >
              <SkillBranchIcon glyph={glyph} size={22} color="#ffffff" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p
              id={SKILL_TREE_TOOLTIP_TITLE_ID}
              className="text-[14px] font-semibold tracking-[0.2em] uppercase"
              style={{ color: isAnchor ? DARK_HEX.breachGlow : SKILL_TREE_VISUAL.gold }}
            >
              {definition.name}
            </p>
            <p className="mt-0.5 text-[13px] tracking-wide text-white/30 uppercase">
              {strings.ui.levelFormat
                .replace('{current}', String(level))
                .replace('{max}', String(definition.maxLevel))}
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

        <div className="mt-3 flex items-center justify-between text-[14px] text-white/45">
          <span className="text-white/35">
            {isMaxed ? strings.ui.fullyUpgraded : strings.ui.nextRankCost}
          </span>
          {!isMaxed && (
            <span className="font-mono" style={{ color: isAnchor ? DARK_HEX.breachGlow : SKILL_TREE_VISUAL.gold }}>
              {balance.toLocaleString()} / {cost.toLocaleString()}
            </span>
          )}
        </div>

        {!isMaxed && (
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${costProgress}%`,
                background: `linear-gradient(90deg, #5c1515, ${isAnchor ? DARK_HEX.breachGlow : SKILL_TREE_VISUAL.edgeActive})`,
              }}
            />
          </div>
        )}

        {state === 'locked' && (
          <p className="mt-2 text-[14px]" style={{ color: '#ff5533' }}>
            {getParentRequirementLabel(skillNode.requires) ?? strings.ui.requirementsNotMet}
          </p>
        )}

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            disabled={!isAvailable}
            onClick={handlePurchase}
            className="rounded border px-4 py-1.5 text-xs font-semibold tracking-wide text-white uppercase transition disabled:cursor-not-allowed disabled:opacity-35"
            style={getPurchaseButtonStyle(isAvailable, isAnchor)}
          >
            {isMaxed ? strings.ui.max : isAnchor ? strings.ui.purchaseAnchor : strings.ui.purchase}
          </button>
        </div>
    </div>
  );
}
