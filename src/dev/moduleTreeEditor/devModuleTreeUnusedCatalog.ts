import { MODULE_TREE_GRAPH, type BranchId } from '../../store/moduleTree';
import { MODULE_TREE_PLACEHOLDERS } from '../../store/moduleTreePlaceholders';import { getDevModuleTreeGlobalDraft } from './devModuleTreeGlobalDraft';
import { getDevModuleTreeDraft } from './devModuleTreeDraft';

export interface UnusedTreeEntry {
  id: string;
  branch: BranchId;
  kind: 'module' | 'placeholder';
}

export function getUnusedGlobalTreeEntries(): UnusedTreeEntry[] {
  const usedIds = new Set(getDevModuleTreeGlobalDraft().map((entry) => entry.id));
  const modules: UnusedTreeEntry[] = MODULE_TREE_GRAPH.filter(
    (node) => node.kind === 'upgrade' && !usedIds.has(node.id),
  ).map((node) => ({
    id: node.id,
    branch: node.branch,
    kind: 'module' as const,
  }));

  const placeholders: UnusedTreeEntry[] = MODULE_TREE_PLACEHOLDERS.filter(
    (placeholder) => !usedIds.has(placeholder.id),
  ).map((placeholder) => ({
    id: placeholder.id,
    branch: placeholder.branch,
    kind: 'placeholder' as const,
  }));

  return [...modules, ...placeholders].sort((a, b) => a.id.localeCompare(b.id));
}

/** Placeholders canon production absents du brouillon local. */
export function getUnusedLocalPlaceholderEntries(): UnusedTreeEntry[] {
  const usedIds = new Set(getDevModuleTreeDraft().map((entry) => entry.id));
  return MODULE_TREE_PLACEHOLDERS.filter((placeholder) => !usedIds.has(placeholder.id)).map(
    (placeholder) => ({
      id: placeholder.id,
      branch: placeholder.branch,
      kind: 'placeholder' as const,
    }),
  );
}

export function formatUnusedEntryLabel(id: string, kind: UnusedTreeEntry['kind']): string {
  if (kind === 'placeholder' && id.startsWith('placeholder_')) {
    return id.replace('placeholder_', 'P');
  }
  if (id === 'node0Boot') return 'Node-0 Boot';
  return id;
}
