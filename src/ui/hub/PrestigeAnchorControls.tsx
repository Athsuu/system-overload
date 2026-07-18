import { ANCHOR_SUPERCHARGE_COST } from '../../store/upgradeCatalog';
import { useGameStrings } from '../../i18n/useGameStrings';
import { type PrestigeAnchorToolId } from '../../store/prestigeUnlocks';
import { useGameStore } from '../../store/useGameStore';
import { DARK_HEX } from '../../theme/darkHexTerminal';
import { SEED_PROTOCOL_VISUAL } from './seedProtocolTheme';

interface PrestigeAnchorControlsProps {
  protocolId: PrestigeAnchorToolId;
  owned: boolean;
}

export function PrestigeAnchorControls({ protocolId, owned }: PrestigeAnchorControlsProps) {
  const strings = useGameStrings();
  const bankAnchorFragments = useGameStore((state) => state.bankAnchorFragments);
  const anchored = useGameStore((state) => state.anchoredNodes[protocolId]);
  const purchaseAnchorSupercharge = useGameStore((state) => state.purchaseAnchorSupercharge);
  const toggleAnchorSupercharge = useGameStore((state) => state.toggleAnchorSupercharge);

  if (!owned) return null;

  const isAnchored = anchored !== undefined;
  const anchorActive = anchored === true;
  const canSupercharge = !isAnchored && bankAnchorFragments >= ANCHOR_SUPERCHARGE_COST;

  return (
    <div className="mt-3 border-t pt-3" style={{ borderColor: `${SEED_PROTOCOL_VISUAL.accent}33` }}>
      <p className="mb-2 text-[10px] font-semibold tracking-[0.16em] text-white/40 uppercase">
        {strings.hardwareSupercharge.sectionTitle}
      </p>
      {isAnchored ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            toggleAnchorSupercharge(protocolId);
          }}
          className="flex w-full items-center justify-between rounded-full border px-3 py-1.5 transition"
          style={{
            borderColor: anchorActive ? DARK_HEX.breachGlow : '#3a3a42',
            backgroundColor: anchorActive ? '#2a1508' : '#15151a',
          }}
        >
          <span
            className="text-[10px] font-semibold tracking-wide uppercase"
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
        <button
          type="button"
          disabled={!canSupercharge}
          onClick={(event) => {
            event.stopPropagation();
            purchaseAnchorSupercharge(protocolId);
          }}
          className="w-full rounded-xl border px-2 py-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase transition disabled:cursor-not-allowed disabled:opacity-35"
          style={{
            borderColor: `${SEED_PROTOCOL_VISUAL.accent}66`,
            color: SEED_PROTOCOL_VISUAL.accentMuted,
          }}
        >
          {strings.hardwareSupercharge.superchargeButton} ·{' '}
          {strings.hardwareSupercharge.costFormat.replace('{n}', String(ANCHOR_SUPERCHARGE_COST))}
        </button>
      )}
    </div>
  );
}
