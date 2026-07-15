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
import { DevSection } from './devUi';
import { DEV_INPUT_CLASS } from './devUi/devStyles';

function StatRow({
  field,
  currentValue,
  onChanged,
}: {
  field: DevStatFieldMeta;
  currentValue: number;
  onChanged: () => void;
}) {
  const [draft, setDraft] = useState(String(currentValue));
  const overridden = isDevRunConfigOverridden(field.key);

  const apply = () => {
    const parsed = Number(draft);
    if (!Number.isFinite(parsed)) return;
    devSetRunConfigOverride(field.key, parsed);
    onChanged();
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        apply();
      }}
      className={`flex flex-wrap items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[13px] ${
        overridden ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/8 bg-white/[0.03]'
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-white/80">{field.label}</p>
        <p className="font-mono text-white/40">
          actuel :{' '}
          <span className={overridden ? 'text-amber-300' : 'text-white/70'}>{currentValue}</span>
          {overridden ? ' (forcé)' : ''}
        </p>
      </div>
      <input
        type="number"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        className={`w-24 ${DEV_INPUT_CLASS}`}
      />
      <DevButton variant="primary" onClick={apply}>
        Appliquer
      </DevButton>
      {overridden && (
        <DevButton
          onClick={() => {
            devClearRunConfigOverride(field.key);
            onChanged();
          }}
        >
          Reset
        </DevButton>
      )}
    </form>
  );
}

export function DevStatsLabTab() {
  const upgrades = useGameStore((state) => state.upgrades);
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
      <DevSection title="Labo stats">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Filtrer les stats…"
          className={`mb-2 w-full ${DEV_INPUT_CLASS}`}
        />
        <DevButton
          onClick={() => {
            devClearAllRunConfigOverrides();
            forceRefresh();
          }}
        >
          Effacer tous les overrides
        </DevButton>
      </DevSection>

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
