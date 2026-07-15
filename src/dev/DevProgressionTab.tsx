import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import {
  devAddBankAnchorFragments,
  devAddBankShards,
  devAddSeedFragments,
  devMaxAllUpgrades,
  devResetToNewPlayer,
  devResetUpgrades,
  devTogglePrestigeUnlocked,
  devUnlockCyclesUpTo,
  devWipeProgress,
} from './devActions';
import { DevBalanceSnapshotPanel } from './DevBalanceSnapshotPanel';
import { DevButton, DevConfirmButton } from './DevButton';
import { DevUpgradePanel } from './DevUpgradePanel';
import { DevFormRow, DevSection, DevToggleButton } from './devUi';
import { DEV_HINT_CLASS, DEV_INPUT_CLASS, DEV_SELECT_CLASS } from './devUi/devStyles';

type CurrencyTarget = 'vault' | 'anchor' | 'seed';

const CURRENCY_LABELS: Record<CurrencyTarget, string> = {
  vault: 'Hex Shards (coffre)',
  anchor: 'Anchor Fragments',
  seed: 'Seed Fragments (prestige)',
};

function injectCurrency(target: CurrencyTarget, amount: number): void {
  if (target === 'vault') devAddBankShards(amount);
  else if (target === 'anchor') devAddBankAnchorFragments(amount);
  else devAddSeedFragments(amount);
}

function CurrencyInjector() {
  const [amount, setAmount] = useState('1000');
  const [target, setTarget] = useState<CurrencyTarget>('vault');

  const handleSubmit = () => {
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed === 0) return;
    injectCurrency(target, parsed);
  };

  return (
    <DevFormRow submitLabel="Injecter" onSubmit={handleSubmit}>
      <input
        type="number"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        className={`w-24 ${DEV_INPUT_CLASS}`}
      />
      <select
        value={target}
        onChange={(event) => setTarget(event.target.value as CurrencyTarget)}
        className={DEV_SELECT_CLASS}
      >
        {(Object.entries(CURRENCY_LABELS) as [CurrencyTarget, string][]).map(([value, label]) => (
          <option key={value} value={value} className="bg-black">
            {label}
          </option>
        ))}
      </select>
    </DevFormRow>
  );
}

function CycleUnlocker() {
  const [target, setTarget] = useState('');

  const handleSubmit = () => {
    const parsed = Number(target);
    if (!Number.isFinite(parsed) || parsed < 1) return;
    devUnlockCyclesUpTo(parsed);
  };

  return (
    <DevFormRow submitLabel="Débloquer" onSubmit={handleSubmit}>
      <input
        type="number"
        min={1}
        value={target}
        onChange={(event) => setTarget(event.target.value)}
        placeholder="Cycle cible"
        className={`w-32 ${DEV_INPUT_CLASS}`}
      />
    </DevFormRow>
  );
}

function PrestigeToggle() {
  const prestigeUnlocked = useGameStore((state) => state.prestigeUnlocked);

  return (
    <DevToggleButton
      label="Prestige débloqué"
      active={prestigeUnlocked}
      onToggle={() => devTogglePrestigeUnlocked()}
    />
  );
}

export function DevProgressionTab() {
  return (
    <div className="space-y-4">
      <DevSection title="Snapshot équilibrage">
        <DevBalanceSnapshotPanel />
      </DevSection>

      <DevSection title="Monnaie">
        <CurrencyInjector />
      </DevSection>

      <DevSection title="Prestige">
        <PrestigeToggle />
      </DevSection>

      <DevSection
        title="Cycles"
        description="Marque comme complétés tous les cycles de 1 au cycle cible inclus."
      >
        <CycleUnlocker />
      </DevSection>

      <DevSection title="Modules">
        <div className="flex flex-wrap gap-1.5">
          <DevButton onClick={() => devMaxAllUpgrades()}>Tout au max</DevButton>
          <DevButton onClick={() => devResetUpgrades()}>Reset modules</DevButton>
        </div>
        <div className="mt-3">
          <DevUpgradePanel />
        </div>
      </DevSection>

      <DevSection title="Hard reset">
        <p className={`mb-2 ${DEV_HINT_CLASS}`}>Cliquer deux fois pour confirmer.</p>
        <div className="flex flex-wrap gap-1.5">
          <DevConfirmButton onConfirm={() => devWipeProgress()}>Effacer save</DevConfirmButton>
          <DevConfirmButton onConfirm={() => devResetToNewPlayer()}>Reset nouveau joueur</DevConfirmButton>
        </div>
      </DevSection>
    </div>
  );
}
