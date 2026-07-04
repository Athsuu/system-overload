import { useEffect, useRef, type CSSProperties, type MouseEvent } from 'react';
import { useGameStore } from '../store/useGameStore';
import {
  getSkillState,
  getUpgradeCost,
  getUpgradeDefinition,
  type UpgradeId,
} from '../store/upgradeCatalog';
import { getSkillNode, NODE_RADIUS } from '../store/skillTree';
import { playOneShotAnimation } from './animations';
import { SKILL_TREE_VISUAL } from './skillTreeTheme';

const TOOLTIP_WIDTH = 280;
const TOOLTIP_HEIGHT = 168;
const TOOLTIP_OFFSET_Y = 16;

interface SkillTreeTooltipProps {
  selectedId: UpgradeId;
}

function getPurchaseButtonStyle(isAvailable: boolean): CSSProperties {
  if (isAvailable) {
    return {
      borderColor: `${SKILL_TREE_VISUAL.edgeActive}88`,
      backgroundColor: '#2a0808',
      boxShadow: `0 0 16px ${SKILL_TREE_VISUAL.edgeActive}33`,
    };
  }
  return { borderColor: '#5c1515', backgroundColor: '#120808' };
}

export function SkillTreeTooltip({ selectedId }: SkillTreeTooltipProps) {
  const bankShards = useGameStore((state) => state.bankShards);
  const upgrades = useGameStore((state) => state.upgrades);
  const purchaseUpgrade = useGameStore((state) => state.purchaseUpgrade);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    playOneShotAnimation(panelRef.current, 'so-animate-slide-up');
  }, [selectedId]);

  const skillNode = getSkillNode(selectedId);
  const definition = getUpgradeDefinition(selectedId);
  const level = upgrades[selectedId];
  const state = getSkillState(selectedId, bankShards, upgrades, skillNode.requires);
  const isMaxed = state === 'maxed';
  const isAvailable = state === 'available';
  const cost = isMaxed ? 0 : getUpgradeCost(definition.baseCost, level);
  const costProgress = isMaxed ? 100 : Math.min(100, (bankShards / Math.max(cost, 1)) * 100);

  const { x, y } = skillNode.position;

  const handlePurchase = (event: MouseEvent<HTMLButtonElement>) => {
    if (!purchaseUpgrade(selectedId)) return;
    playOneShotAnimation(event.currentTarget, 'so-animate-purchase-flash');
  };

  return (
    <foreignObject
      x={x - TOOLTIP_WIDTH / 2}
      y={y - NODE_RADIUS - TOOLTIP_HEIGHT - TOOLTIP_OFFSET_Y}
      width={TOOLTIP_WIDTH}
      height={TOOLTIP_HEIGHT}
      style={{ overflow: 'visible' }}
    >
      <div
        ref={panelRef}
        data-skill-tooltip
        className="pointer-events-auto rounded border px-4 py-3 shadow-[0_0_32px_rgba(255,77,0,0.15)]"
        style={{
          backgroundColor: SKILL_TREE_VISUAL.tooltipBg,
          borderColor: SKILL_TREE_VISUAL.tooltipBorder,
        }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded border text-sm font-bold text-white"
            style={{ borderColor: SKILL_TREE_VISUAL.goldMuted, backgroundColor: '#2a0808' }}
          >
            {skillNode.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-[10px] font-semibold tracking-[0.2em] uppercase"
              style={{ color: SKILL_TREE_VISUAL.gold }}
            >
              {definition.name}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-white/60">{definition.description}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] text-white/45">
          <span>
            LVL {level} / {definition.maxLevel}
          </span>
          {!isMaxed && (
            <span className="font-mono" style={{ color: SKILL_TREE_VISUAL.gold }}>
              {bankShards.toLocaleString()} / {cost.toLocaleString()}
            </span>
          )}
        </div>

        {!isMaxed && (
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${costProgress}%`,
                background: `linear-gradient(90deg, #5c1515, ${SKILL_TREE_VISUAL.edgeActive})`,
              }}
            />
          </div>
        )}

        {state === 'locked' && (
          <p className="mt-2 text-[10px]" style={{ color: '#ff5533' }}>
            Requirements not met
          </p>
        )}

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            disabled={!isAvailable}
            onClick={handlePurchase}
            className="rounded border px-4 py-1.5 text-xs font-semibold tracking-wide text-white uppercase transition disabled:cursor-not-allowed disabled:opacity-35"
            style={getPurchaseButtonStyle(isAvailable)}
          >
            {isMaxed ? 'MAX' : 'Purchase'}
          </button>
        </div>
      </div>
    </foreignObject>
  );
}
