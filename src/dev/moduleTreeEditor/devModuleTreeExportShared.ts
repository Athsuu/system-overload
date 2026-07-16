import type { UpgradeRequirement } from '../../store/upgradeCatalog';
import type { DraftParentId } from './devModuleTreeDraft';

export function formatHexCoord(q: number, r: number): string {
  const fmt = (value: number) => (value > 0 ? `+${value}` : String(value));
  return `(${fmt(q)}, ${fmt(r)})`;
}

export function draftParentToGraphParent(parentId: DraftParentId): 'root' | string {
  return parentId === 'core' ? 'root' : parentId;
}

export function draftParentToRequireId(parentId: DraftParentId): string | null {
  if (parentId === 'core') return 'node0Boot';
  return parentId;
}

export function formatProductionRequires(requires: UpgradeRequirement[]): string {
  if (requires.length === 1) {
    const requirement = requires[0]!;
    return `requires: requireLevel('${requirement.id}', ${requirement.minLevel ?? 1}),`;
  }

  const lines = requires.map(
    (requirement) => `    { id: '${requirement.id}', minLevel: ${requirement.minLevel ?? 1} },`,
  );
  return `requires: [\n${lines.join('\n')}\n  ],`;
}

export function formatRequiresFromParentIds(parentIds: DraftParentId[]): string | null {
  if (parentIds.length === 0) return null;

  if (parentIds.length === 1) {
    const requireId = draftParentToRequireId(parentIds[0]!);
    if (!requireId) return null;
    return `requires: requireLevel('${requireId}', 1),`;
  }

  const spreads = parentIds
    .map((parentId) => draftParentToRequireId(parentId))
    .filter((id): id is string => id !== null)
    .map((id) => `    ...requireLevel('${id}', 1),`);

  if (spreads.length === 0) return null;
  return `requires: [\n${spreads.join('\n')}\n  ],`;
}
