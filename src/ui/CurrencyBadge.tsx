import { useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useGameStore } from '../store/useGameStore';
import { useGameStrings } from '../i18n/useGameStrings';
import { DARK_HEX } from '../theme/darkHexTerminal';
import { MAX_CYCLES, isCycleCleared } from '../store/cycleTypes';
import { AnchorFragmentIcon, HexShardIcon, SeedFragmentIcon } from './currencyIcons';
import { isAnchorFragmentsUnlocked, isVaultShardsUnlocked } from './currencyVisibility';
import {
  CURRENCY_LORE_TOOLTIP_HEIGHT,
  CURRENCY_LORE_TOOLTIP_WIDTH,
  CurrencyLoreTooltip,
} from './CurrencyLoreTooltip';
import { HubPopover } from './HubPopover';
import { MODULE_TREE_VISUAL } from './moduleTreeTheme';
import { SEED_PROTOCOL_VISUAL } from './seedProtocolTheme';

type HoveredCurrency = 'shards' | 'anchor' | 'seed';

const HOVER_DISMISS_MS = 100;

const CURRENCY_TITLE_IDS = {
  shards: 'currency-shards-lore-title',
  anchor: 'currency-anchor-lore-title',
  seed: 'currency-seed-lore-title',
} as const;

interface CurrencyBadgeProps {
  containerRef: RefObject<HTMLDivElement | null>;
  showPrestigeEntry?: boolean;
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

export function CurrencyBadge({ containerRef, showPrestigeEntry = false }: CurrencyBadgeProps) {
  const bankShards = useGameStore((state) => state.bankShards);
  const bankAnchorFragments = useGameStore((state) => state.bankAnchorFragments);
  const seedFragments = useGameStore((state) => state.seedFragments);
  const recompileDepth = useGameStore((state) => state.recompileDepth);
  const cyclesCleared = useGameStore((state) => state.cyclesCleared);
  const openSeedProtocols = useGameStore((state) => state.openSeedProtocols);
  const upgrades = useGameStore((state) => state.upgrades);
  const strings = useGameStrings();

  const showSeedProtocolsEntry =
    showPrestigeEntry && (recompileDepth > 0 || isCycleCleared(cyclesCleared, MAX_CYCLES));

  const [hoveredCurrency, setHoveredCurrency] = useState<HoveredCurrency | null>(null);
  const shardsIconRef = useRef<HTMLDivElement>(null);
  const anchorIconRef = useRef<HTMLDivElement>(null);
  const seedIconRef = useRef<HTMLDivElement>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showShards = isVaultShardsUnlocked(bankShards, upgrades);
  const showAnchors = isAnchorFragmentsUnlocked(bankAnchorFragments);
  const showSeed = recompileDepth > 0 || seedFragments > 0;

  const hoveredAnchorRef =
    hoveredCurrency === 'shards'
      ? shardsIconRef
      : hoveredCurrency === 'anchor'
        ? anchorIconRef
        : hoveredCurrency === 'seed'
          ? seedIconRef
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

  if (!showShards && !showAnchors && !showSeed) return null;

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
        : hoveredCurrency === 'seed'
          ? {
              title: strings.currency.seedFragmentsLabel,
              lore: strings.currency.seedLoreTooltip,
              isAnchor: false,
              titleId: CURRENCY_TITLE_IDS.seed,
              icon: <SeedFragmentIcon size={28} />,
            }
          : null;

  return (
    <>
      <div className="flex flex-col items-end gap-2.5">
        <div className="flex items-center gap-3">
          {showSeedProtocolsEntry && (
            <button
              type="button"
              onClick={openSeedProtocols}
              className="rounded-full border px-4 py-1.5 text-[12px] font-semibold tracking-[0.2em] uppercase backdrop-blur-md transition hover:opacity-90"
              style={{
                borderColor: SEED_PROTOCOL_VISUAL.glassBorder,
                backgroundColor: SEED_PROTOCOL_VISUAL.glassBg,
                color: SEED_PROTOCOL_VISUAL.accentMuted,
              }}
            >
              {strings.seedProtocols.openButton.replace('\n', ' ')}
            </button>
          )}
          {showShards && (
            <CurrencyRow
              iconRef={shardsIconRef}
              icon={<HexShardIcon size={26} />}
              value={bankShards}
              valueColor={MODULE_TREE_VISUAL.gold}
              onHoverStart={() => showCurrency('shards')}
              onHoverEnd={scheduleDismiss}
              ariaLabel={`${strings.currency.availableShardsLabel}: ${bankShards}`}
              tutorialAnchor="hex-shards"
            />
          )}
        </div>
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
        {showSeed && (
          <CurrencyRow
            iconRef={seedIconRef}
            icon={<SeedFragmentIcon size={26} />}
            value={seedFragments}
            valueColor="#7dd3fc"
            onHoverStart={() => showCurrency('seed')}
            onHoverEnd={scheduleDismiss}
            ariaLabel={`${strings.currency.seedFragmentsLabel}: ${seedFragments}`}
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

interface HexShardsBadgeLayerProps {
  /** Show the Seed Protocols entry point inline with the top currency row (hub only). */
  showPrestigeEntry?: boolean;
}

/** Shared top-right badge shell (hub + run). */
export function HexShardsBadgeLayer({ showPrestigeEntry = false }: HexShardsBadgeLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 z-30">
      <div className="pointer-events-auto absolute top-8 right-8">
        <CurrencyBadge containerRef={containerRef} showPrestigeEntry={showPrestigeEntry} />
      </div>
    </div>
  );
}
