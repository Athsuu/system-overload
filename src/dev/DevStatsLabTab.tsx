import { useMemo, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { getRunConfig } from '../game/runConfig';
import {
  DEV_STAT_FIELDS,
  devClearAllRunConfigOverrides,
  devClearRunConfigOverride,
  devSetRunConfigOverride,
  isDevRunConfigOverridden,
  type DevStatFieldMeta,
} from './devRunConfigOverrides';
import { DevButton } from './DevButton';

function StatRow({ field, currentValue, onChanged }: { field: DevStatFieldMeta; currentValue: number; onChanged: () => void }) {
  const [draft, setDraft] = useState(String(currentValue));
  const overridden = isDevRunConfigOverridden(field.key);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = Number(draft);
    if (!Number.isFinite(parsed)) return;
    devSetRunConfigOverride(field.key, parsed);
    onChanged();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-wrap items-center gap-2 rounded-lg border px-2.5 py-2 text-[13px] ${
        overridden ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/8 bg-white/[0.03]'
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-white/80">{field.label}</p>
        <p className="font-mono text-white/40">
          actuel : <span className={overridden ? 'text-amber-300' : 'text-white/70'}>{currentValue}</span>
          {overridden ? ' (forcé)' : ''}
        </p>
      </div>
      <input
        type="number"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        className="w-24 rounded-md border border-white/10 bg-black/40 px-2 py-1 font-mono text-white/85 outline-none focus:border-cyan-500/40"
      />
      <button
        type="submit"
        className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-200 transition hover:bg-cyan-500/20"
      >
        Set
      </button>
      {overridden && (
        <button
          type="button"
          onClick={() => {
            devClearRunConfigOverride(field.key);
            onChanged();
          }}
          className="rounded-md border border-white/10 px-2 py-1 text-xs text-white/50 transition hover:border-white/25 hover:text-white/80"
        >
          Reset
        </button>
      )}
    </form>
  );
}

export function DevStatsLabTab() {
  const upgrades = useGameStore((state) => state.upgrades);
  // Le Hardware Supercharge (anchoredNodes) modifie getRunConfig sans toucher upgrades — s'abonner pour rafraîchir l'affichage au toggle.
  useGameStore((state) => state.anchoredNodes);
  const [search, setSearch] = useState('');
  const [, setRefreshTick] = useState(0);

  const config = getRunConfig(upgrades);

  const filteredFields = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return DEV_STAT_FIELDS;
    return DEV_STAT_FIELDS.filter((field) => field.label.toLowerCase().includes(query));
  }, [search]);

  const forceRefresh = () => setRefreshTick((tick) => tick + 1);

  return (
    <div className="space-y-3">
      <form onSubmit={(event) => event.preventDefault()}>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Filtrer les stats…"
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-[13px] text-white/85 outline-none focus:border-cyan-500/40"
        />
      </form>

      <DevButton onClick={() => { devClearAllRunConfigOverrides(); forceRefresh(); }}>
        Effacer tous les overrides
      </DevButton>

      <div className="space-y-1.5">
        {filteredFields.map((field) => (
          <StatRow key={field.key} field={field} currentValue={config[field.key]} onChanged={forceRefresh} />
        ))}
        {filteredFields.length === 0 && (
          <p className="px-1 text-[13px] text-white/30">Aucune stat ne correspond à « {search} ».</p>
        )}
      </div>
    </div>
  );
}
