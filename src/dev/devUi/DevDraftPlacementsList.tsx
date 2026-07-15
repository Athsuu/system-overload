import type { DevModuleTreeDraftEntry } from '../moduleTreeEditor/devModuleTreeDraft';
import { removeDevModuleTreeDraftEntry } from '../moduleTreeEditor/devModuleTreeDraft';
import { DevSection } from './DevSection';

interface DevDraftPlacementsListProps {
  drafts: readonly DevModuleTreeDraftEntry[];
}

export function DevDraftPlacementsList({ drafts }: DevDraftPlacementsListProps) {
  if (drafts.length === 0) return null;

  return (
    <DevSection title="Placements">
      <ul className="so-dev-scroll max-h-40 space-y-1 overflow-y-auto">
        {drafts.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center justify-between gap-2 rounded border border-white/8 bg-black/30 px-2 py-1 font-mono text-[11px] text-white/70"
          >
            <span>
              {entry.id} ← {entry.parentIds.join(' + ')} ({entry.q},{entry.r})
            </span>
            <button
              type="button"
              className="text-red-300/80 hover:text-red-200"
              onClick={() => removeDevModuleTreeDraftEntry(entry.id)}
              aria-label={`Supprimer ${entry.id}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </DevSection>
  );
}
