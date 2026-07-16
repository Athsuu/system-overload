import { getBranchLabels } from '../../store/moduleTree';
import type { UnusedTreeEntry } from './devModuleTreeUnusedCatalog';
import { formatUnusedEntryLabel } from './devModuleTreeUnusedCatalog';
import { DevSection } from '../devUi';

const BRANCH_CHIP_CLASS: Record<UnusedTreeEntry['branch'], string> = {
  degats: 'border-red-500/50 bg-red-950/50 text-red-200',
  thermique: 'border-orange-500/50 bg-orange-950/50 text-orange-200',
};

interface DevUnusedModulesPanelProps {
  entries: readonly UnusedTreeEntry[];
  title: string;
  description: string;
  emptyMessage: string;
  selectedEntryId?: string | null;
  onSelectEntry?: (entry: UnusedTreeEntry) => void;
}

export function DevUnusedModulesPanel({
  entries,
  title,
  description,
  emptyMessage,
  selectedEntryId = null,
  onSelectEntry,
}: DevUnusedModulesPanelProps) {
  const branchLabels = getBranchLabels();

  return (
    <DevSection title={`${title} (${entries.length})`} description={description}>
      {entries.length === 0 ? (
        <p className="rounded-lg border border-emerald-500/35 bg-emerald-950/30 px-3 py-2.5 text-[13px] font-medium text-emerald-100/90">
          {emptyMessage}
        </p>
      ) : (
        <ul className="so-dev-scroll max-h-56 space-y-2 overflow-y-auto pr-1">
          {entries.map((entry) => {
            const isSelected = selectedEntryId === entry.id;
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => onSelectEntry?.(entry)}
                  disabled={!onSelectEntry}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg border-2 px-3 py-2.5 text-left transition ${
                    isSelected
                      ? 'border-amber-400/80 bg-amber-950/60 shadow-[0_0_18px_rgba(251,191,36,0.22)]'
                      : 'border-cyan-400/45 bg-cyan-950/55 shadow-[0_0_14px_rgba(34,211,238,0.12)] hover:border-cyan-300/70 hover:bg-cyan-900/55'
                  } ${onSelectEntry ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[15px] font-bold tracking-wide text-cyan-50">
                      {formatUnusedEntryLabel(entry.id, entry.kind)}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-white/45">{entry.id}</p>
                    {isSelected && (
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-amber-200/90">
                        Parent puis case sur l&apos;arbre
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${BRANCH_CHIP_CLASS[entry.branch]}`}
                  >
                    {branchLabels[entry.branch].label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </DevSection>
  );
}
