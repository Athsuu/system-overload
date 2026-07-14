import { useState } from 'react';
import {
  devAddBankShards,
  devAddRunShards,
  devAddSeedFragments,
  devMaxAllUpgrades,
  devResetToNewPlayer,
  devResetUpgrades,
  devUnlockCyclesUpTo,
  devWipeProgress,
} from './devActions';
import { DevButton, DevConfirmButton } from './DevButton';
import { DevUpgradePanel } from './DevUpgradePanel';

type CurrencyTarget = 'vault' | 'run' | 'seed';

const CURRENCY_LABELS: Record<CurrencyTarget, string> = {
  vault: 'Vault Shards',
  run: 'Run Shards',
  seed: 'Seed Fragments (Prestige)',
};

function injectCurrency(target: CurrencyTarget, amount: number): void {
  if (target === 'vault') devAddBankShards(amount);
  else if (target === 'run') devAddRunShards(amount);
  else devAddSeedFragments(amount);
}

function CurrencyInjector() {
  const [amount, setAmount] = useState('1000');
  const [target, setTarget] = useState<CurrencyTarget>('vault');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed === 0) return;
    injectCurrency(target, parsed);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-1.5">
      <input
        type="number"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        className="w-24 rounded-md border border-white/10 bg-black/40 px-2 py-1.5 font-mono text-[13px] text-white/85 outline-none focus:border-cyan-500/40"
      />
      <select
        value={target}
        onChange={(event) => setTarget(event.target.value as CurrencyTarget)}
        className="rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-[13px] text-white/85 outline-none focus:border-cyan-500/40"
      >
        {(Object.entries(CURRENCY_LABELS) as [CurrencyTarget, string][]).map(([value, label]) => (
          <option key={value} value={value} className="bg-black">
            {label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-200 transition hover:bg-cyan-500/20"
      >
        Injecter
      </button>
    </form>
  );
}

function CycleUnlocker() {
  const [target, setTarget] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = Number(target);
    if (!Number.isFinite(parsed) || parsed < 1) return;
    devUnlockCyclesUpTo(parsed);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-1.5">
      <input
        type="number"
        min={1}
        value={target}
        onChange={(event) => setTarget(event.target.value)}
        placeholder="Target Cycle"
        className="w-32 rounded-md border border-white/10 bg-black/40 px-2 py-1.5 font-mono text-[13px] text-white/85 outline-none focus:border-cyan-500/40"
      />
      <button
        type="submit"
        className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-200 transition hover:bg-cyan-500/20"
      >
        Débloquer
      </button>
    </form>
  );
}

export function DevProgressionTab() {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-[14px] tracking-wider text-white/40 uppercase">Monnaie</p>
        <CurrencyInjector />
      </div>

      <div>
        <p className="mb-2 text-[14px] tracking-wider text-white/40 uppercase">Cycles</p>
        <p className="mb-2 text-[13px] text-white/30">
          Marque comme complétés (cyclesCleared) tous les cycles de 1 au cycle cible inclus.
        </p>
        <CycleUnlocker />
      </div>

      <div>
        <p className="mb-2 text-[14px] tracking-wider text-white/40 uppercase">Upgrades</p>
        <div className="flex flex-wrap gap-1.5">
          <DevButton onClick={() => devMaxAllUpgrades()}>Max upgrades</DevButton>
          <DevButton onClick={() => devResetUpgrades()}>Reset upgrades</DevButton>
        </div>
        <div className="mt-3">
          <DevUpgradePanel />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[14px] tracking-wider text-white/40 uppercase">Hard reset</p>
        <p className="mb-2 text-[13px] text-white/30">Cliquer deux fois pour confirmer.</p>
        <div className="flex flex-wrap gap-1.5">
          <DevConfirmButton onConfirm={() => devWipeProgress()}>Wipe save</DevConfirmButton>
          <DevConfirmButton onConfirm={() => devResetToNewPlayer()}>Reset nouveau joueur</DevConfirmButton>
        </div>
      </div>
    </div>
  );
}
