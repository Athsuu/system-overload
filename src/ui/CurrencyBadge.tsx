import { useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useGameStore } from '../store/useGameStore';
import { useGameStrings } from '../i18n/useGameStrings';
import { DARK_HEX } from '../theme/darkHexTerminal';
import { AnchorFragmentIcon, HexShardIcon } from './currencyIcons';
import { isAnchorFragmentsUnlocked, isVaultShardsUnlocked } from './currencyVisibility';
import {
  CURRENCY_LORE_TOOLTIP_HEIGHT,
  CURRENCY_LORE_TOOLTIP_WIDTH,
  CurrencyLoreTooltip,
} from './CurrencyLoreTooltip';
import { HubPopover } from './HubPopover';
import { SKILL_TREE_VISUAL } from './skillTreeTheme';

type HoveredCurrency = 'shards' | 'anchor';

const HOVER_DISMISS_MS = 100;

const CURRENCY_TITLE_IDS = {
  shards: 'currency-shards-lore-title',
  anchor: 'currency-anchor-lore-title',
} as const;

interface CurrencyBadgeProps {
  containerRef: RefObject<HTMLDivElement | null>;
}

function CurrencyRow({
  iconRef,
  icon,
  value,
  valueColor,
  onHoverStart,
  onHoverEnd,
  ariaLabel,
  tutorialAnchor,
}: {
  iconRef: RefObject<HTMLDivElement | null>;
  icon: ReactNode;
  value: number;
  valueColor: string;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  ariaLabel: string;
  tutorialAnchor?: string;
}) {
  return (
    <div
      {...(tutorialAnchor ? { 'data-tutorial-anchor': tutorialAnchor } : {})}
      className="flex items-center gap-2.5"
    >
      <div
        ref={iconRef}
        data-currency-icon
        aria-label={ariaLabel}
        onPointerEnter={onHoverStart}
        onPointerLeave={onHoverEnd}
        className="shrink-0 rounded-sm outline-none"
      >
        {icon}
      </div>
      <span
        className="min-w-[2ch] font-mono text-lg font-semibold tabular-nums"
        style={{ color: valueColor }}
      >
        {value.toLocaleString()}
      </span>
    </div>
  );
}

export function CurrencyBadge({ containerRef }: CurrencyBadgeProps) {
  const bankShards = useGameStore((state) => state.bankShards);
  const bankAnchorFragments = useGameStore((state) => state.bankAnchorFragments);
  const upgrades = useGameStore((state) => state.upgrades);
  const strings = useGameStrings();

  const [hoveredCurrency, setHoveredCurrency] = useState<HoveredCurrency | null>(null);
  const shardsIconRef = useRef<HTMLDivElement>(null);
  const anchorIconRef = useRef<HTMLDivElement>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showShards = isVaultShardsUnlocked(bankShards, upgrades);
  const showAnchors = isAnchorFragmentsUnlocked(bankAnchorFragments);

  const hoveredAnchorRef =
    hoveredCurrency === 'shards'
      ? shardsIconRef
      : hoveredCurrency === 'anchor'
        ? anchorIconRef
        : { current: null };

  const clearDismissTimer = () => {
    if (!dismissTimerRef.current) return;
    clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = null;
  };

  const scheduleDismiss = () => {
    clearDismissTimer();
    dismissTimerRef.current = setTimeout(() => setHoveredCurrency(null), HOVER_DISMISS_MS);
  };

  const showCurrency = (currency: HoveredCurrency) => {
    clearDismissTimer();
    setHoveredCurrency(currency);
  };

  if (!showShards && !showAnchors) return null;

  const popoverContent =
    hoveredCurrency === 'shards'
      ? {
          title: strings.currency.availableShardsLabel,
          lore: strings.currency.shardsLoreTooltip,
          isAnchor: false,
          titleId: CURRENCY_TITLE_IDS.shards,
          icon: <HexShardIcon size={28} />,
        }
      : hoveredCurrency === 'anchor'
        ? {
            title: strings.currency.anchorFragmentsLabel,
            lore: strings.currency.anchorLoreTooltip,
            isAnchor: true,
            titleId: CURRENCY_TITLE_IDS.anchor,
            icon: <AnchorFragmentIcon size={28} />,
          }
        : null;

  return (
    <>
      <div className="flex flex-col items-end gap-2.5">
        {showShards && (
          <CurrencyRow
            iconRef={shardsIconRef}
            icon={<HexShardIcon size={26} />}
            value={bankShards}
            valueColor={SKILL_TREE_VISUAL.gold}
            onHoverStart={() => showCurrency('shards')}
            onHoverEnd={scheduleDismiss}
            ariaLabel={`${strings.currency.availableShardsLabel}: ${bankShards}`}
            tutorialAnchor="hex-shards"
          />
        )}
        {showAnchors && (
          <CurrencyRow
            iconRef={anchorIconRef}
            icon={<AnchorFragmentIcon size={26} />}
            value={bankAnchorFragments}
            valueColor={DARK_HEX.breachGlow}
            onHoverStart={() => showCurrency('anchor')}
            onHoverEnd={scheduleDismiss}
            ariaLabel={`${strings.currency.anchorFragmentsLabel}: ${bankAnchorFragments}`}
          />
        )}
      </div>

      {popoverContent &&
        containerRef.current &&
        createPortal(
          <HubPopover
            containerRef={containerRef}
            anchorRef={hoveredAnchorRef}
            active={hoveredCurrency !== null}
            popoverWidth={CURRENCY_LORE_TOOLTIP_WIDTH}
            popoverHeight={CURRENCY_LORE_TOOLTIP_HEIGHT}
            titleId={popoverContent.titleId}
            autoFocus={false}
            onDialogPointerEnter={clearDismissTimer}
            onDialogPointerLeave={scheduleDismiss}
          >
            <CurrencyLoreTooltip
              title={popoverContent.title}
              lore={popoverContent.lore}
              isAnchor={popoverContent.isAnchor}
              titleId={popoverContent.titleId}
              icon={popoverContent.icon}
            />
          </HubPopover>,
          containerRef.current,
        )}
    </>
  );
}

/** Shared top-right badge shell (hub + run). */
export function HexShardsBadgeLayer() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 z-30">
      <div className="pointer-events-auto absolute top-8 right-8">
        <CurrencyBadge containerRef={containerRef} />
      </div>
    </div>
  );
}
