import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { canRecompile, computeSeedFragmentsGain } from '../store/prestigeLogic';
import { useGameStrings } from '../i18n/useGameStrings';
import { SEED_PROTOCOL_VISUAL } from './seedProtocolTheme';
import { HexActionButton } from './HexActionButton';
import { SeedFragmentIcon } from './currencyIcons';

interface RecompileConfirmModalProps {
  onClose: () => void;
}

export function RecompileConfirmModal({ onClose }: RecompileConfirmModalProps) {
  const strings = useGameStrings();
  const recompile = useGameStore((state) => state.recompile);
  const cyclesCleared = useGameStore((state) => state.cyclesCleared);
  const coreProtocols = useGameStore((state) => state.coreProtocols);
  const bankShards = useGameStore((state) => state.bankShards);
  const bankAnchorFragments = useGameStore((state) => state.bankAnchorFragments);
  const recompileDepth = useGameStore((state) => state.recompileDepth);
  const [busy, setBusy] = useState(false);

  const fragmentsGain = computeSeedFragmentsGain(cyclesCleared, coreProtocols);
  const nextDepth = recompileDepth + 1;

  const handleConfirm = () => {
    if (busy) return;
    setBusy(true);
    const ok = recompile();
    if (!ok) {
      setBusy(false);
      onClose();
    }
  };

  if (!canRecompile(cyclesCleared)) return null;

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label={strings.ui.skip}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg px-8 py-8 text-center"
        style={{
          backgroundColor: 'rgba(8, 16, 24, 0.94)',
          border: `1px solid ${SEED_PROTOCOL_VISUAL.accent}66`,
          boxShadow: `0 0 32px ${SEED_PROTOCOL_VISUAL.accentGlow}33`,
        }}
      >
        <p className="text-[13px] tracking-[0.32em] uppercase" style={{ color: SEED_PROTOCOL_VISUAL.accentMuted }}>
          {strings.seedProtocols.recompileConfirmTitle}
        </p>
        <h2 className="so-font-display mt-2 text-xl font-semibold tracking-[0.14em] uppercase text-white">
          {strings.seedProtocols.recompileAction}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-white/55">
          {strings.seedProtocols.recompileConfirmBody}
        </p>

        <div className="mt-6 space-y-2 text-left text-[14px] text-white/45">
          <p>{strings.seedProtocols.recompileLoseShards.replace('{n}', String(bankShards))}</p>
          <p>{strings.seedProtocols.recompileLoseAnchors.replace('{n}', String(bankAnchorFragments))}</p>
          <p>{strings.seedProtocols.recompileLoseModules}</p>
          <p>{strings.seedProtocols.recompileLoseCycles}</p>
        </div>

        <div
          className="mt-6 flex items-center justify-center gap-2 border-t border-white/[0.06] pt-5"
          style={{ color: SEED_PROTOCOL_VISUAL.accentMuted }}
        >
          <SeedFragmentIcon size={24} />
          <span className="font-mono text-lg font-semibold tabular-nums text-white">
            +{fragmentsGain}
          </span>
          <span className="text-[14px] tracking-[0.2em] uppercase">
            {strings.currency.seedFragmentsLabel}
          </span>
        </div>
        <p className="mt-2 text-[13px] text-white/35">
          {strings.seedProtocols.recompileDepthAfter
            .replace('{n}', String(nextDepth))}
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <HexActionButton
            label={strings.seedProtocols.recompileCancel}
            onClick={onClose}
            variant="secondary"
            disabled={busy}
          />
          <HexActionButton
            label={strings.seedProtocols.recompileAction}
            onClick={handleConfirm}
            variant="primary"
            disabled={busy}
            clickSound="startRun"
          />
        </div>
      </div>
    </div>
  );
}
