import {
  MODULE_TREE_GRAPH,
  getUpgradeBranch,
  type BranchId,
} from '../../store/moduleTree';
import {
  getModuleTreePlaceholder,
  MODULE_TREE_PLACEHOLDERS,
} from '../../store/moduleTreePlaceholders';
import { axialToPixel, formatPathFromParentAxial, pixelToAxial } from '../../store/moduleTreeHexGrid';
import type { UpgradeId } from '../../store/upgradeCatalog';
import type { DraftParentId } from './devModuleTreeDraft';
import { canPlaceEditorAt } from './moduleTreeEditorOccupancy';

export type DevModuleTreeGlobalEntryKind = 'module' | 'placeholder';

export interface DevModuleTreeGlobalEntry {
  id: string;
  kind: DevModuleTreeGlobalEntryKind;
  parentIds: DraftParentId[];
  q: number;
  r: number;
  branch: BranchId;
}

const STORAGE_KEY = 'dev-module-tree-global-draft';

let globalEntries: DevModuleTreeGlobalEntry[] = loadGlobalFromStorage();

export const DEV_MODULE_TREE_GLOBAL_DRAFT_EVENT = 'dev-module-tree-global-draft-change';

function notifyGlobalChange(): void {
  window.dispatchEvent(new CustomEvent(DEV_MODULE_TREE_GLOBAL_DRAFT_EVENT));
}

function graphParentToDraftParent(parentId: 'root' | UpgradeId): DraftParentId {
  return parentId === 'root' ? 'core' : parentId;
}

function normalizeStoredEntry(value: unknown): DevModuleTreeGlobalEntry | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as {
    id?: string;
    kind?: DevModuleTreeGlobalEntryKind;
    parentId?: string;
    parentIds?: string[];
    q?: number;
    r?: number;
    branch?: BranchId;
  };

  const parentIds =
    Array.isArray(raw.parentIds) && raw.parentIds.length > 0
      ? raw.parentIds.filter((id): id is string => typeof id === 'string')
      : typeof raw.parentId === 'string'
        ? [raw.parentId]
        : null;

  const kind = raw.kind === 'module' || raw.kind === 'placeholder' ? raw.kind : 'placeholder';

  if (
    typeof raw.id !== 'string' ||
    !parentIds ||
    parentIds.length === 0 ||
    typeof raw.q !== 'number' ||
    typeof raw.r !== 'number' ||
    (raw.branch !== 'degats' && raw.branch !== 'thermique')
  ) {
    return null;
  }

  return { id: raw.id, kind, parentIds, q: raw.q, r: raw.r, branch: raw.branch };
}

function loadGlobalFromStorage(): DevModuleTreeGlobalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeStoredEntry)
      .filter((entry): entry is DevModuleTreeGlobalEntry => entry !== null);
  } catch {
    return [];
  }
}

function persistGlobal(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(globalEntries));
}

export function getDevModuleTreeGlobalDraft(): readonly DevModuleTreeGlobalEntry[] {
  return globalEntries;
}

export function hasDevModuleTreeGlobalDraft(): boolean {
  return globalEntries.length > 0;
}

export function getGlobalPrimaryParent(entry: DevModuleTreeGlobalEntry): DraftParentId {
  return entry.parentIds[0]!;
}

export function getGlobalDraftPosition(id: DraftParentId): { x: number; y: number } {
  const entry = globalEntries.find((item) => item.id === id);
  if (entry) return axialToPixel(entry.q, entry.r);

  const productionPlaceholder = getModuleTreePlaceholder(id);
  if (productionPlaceholder) return axialToPixel(productionPlaceholder.q, productionPlaceholder.r);

  const graphNode = MODULE_TREE_GRAPH.find((node) => node.id === id);
  if (graphNode) return graphNode.position;

  if (id === 'core') return axialToPixel(0, 0);
  throw new Error(`[devModuleTreeGlobalDraft] Unknown id: ${id}`);
}

export function getGlobalParentAxial(parentId: DraftParentId): { q: number; r: number } {
  const entry = globalEntries.find((item) => item.id === parentId);
  if (entry) return { q: entry.q, r: entry.r };

  const productionPlaceholder = getModuleTreePlaceholder(parentId);
  if (productionPlaceholder) return { q: productionPlaceholder.q, r: productionPlaceholder.r };

  const graphNode = MODULE_TREE_GRAPH.find((node) => node.id === parentId);
  if (graphNode) return pixelToAxial(graphNode.position.x, graphNode.position.y);

  if (parentId === 'core') return { q: 0, r: 0 };
  return { q: 0, r: 0 };
}

export function resolveGlobalParentBranch(parentId: DraftParentId): BranchId {
  const entry = globalEntries.find((item) => item.id === parentId);
  if (entry) return entry.branch;
  return getUpgradeBranch(parentId as UpgradeId);
}

function nextGlobalPlaceholderId(): string {
  const used = new Set(globalEntries.map((entry) => entry.id));
  let index = 1;
  while (used.has(`placeholder_${String(index).padStart(2, '0')}`)) {
    index += 1;
  }
  return `placeholder_${String(index).padStart(2, '0')}`;
}

function canPlaceGlobalAt(q: number, r: number, excludeId?: string): boolean {
  return canPlaceEditorAt('global', q, r, excludeId);
}

export function getGlobalEntryAtCell(q: number, r: number): DevModuleTreeGlobalEntry | undefined {
  return globalEntries.find((entry) => entry.q === q && entry.r === r);
}

function collectGlobalCascadeIds(rootId: string): Set<string> {
  const toRemove = new Set<string>();
  const queue = [rootId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (toRemove.has(current)) continue;
    toRemove.add(current);
    for (const entry of globalEntries) {
      if (getGlobalPrimaryParent(entry) === current) queue.push(entry.id);
    }
  }

  return toRemove;
}

export function countGlobalCascadeDelete(id: string): number {
  return collectGlobalCascadeIds(id).size;
}

export function cloneProductionTreeToGlobalDraft(): void {
  const moduleEntries = MODULE_TREE_GRAPH.filter((node) => node.kind === 'upgrade').map((node) => {
    const axial = pixelToAxial(node.position.x, node.position.y);
    return {
      id: node.id,
      kind: 'module' as const,
      parentIds: [graphParentToDraftParent(node.parentId)],
      q: axial.q,
      r: axial.r,
      branch: node.branch,
    };
  });

  const placeholderEntries = MODULE_TREE_PLACEHOLDERS.map((placeholder) => ({
    id: placeholder.id,
    kind: 'placeholder' as const,
    parentIds: [...placeholder.parentIds],
    q: placeholder.q,
    r: placeholder.r,
    branch: placeholder.branch,
  }));

  globalEntries = [...moduleEntries, ...placeholderEntries];
  persistGlobal();
  notifyGlobalChange();
}

export function addGlobalTreeEntry(
  id: string,
  kind: DevModuleTreeGlobalEntryKind,
  parentId: DraftParentId,
  q: number,
  r: number,
): DevModuleTreeGlobalEntry | null {
  if (id === 'node0Boot') return null;
  if (globalEntries.some((entry) => entry.id === id)) return null;
  if (!canPlaceGlobalAt(q, r)) return null;

  const branch =
    kind === 'module'
      ? getUpgradeBranch(id as UpgradeId)
      : (getModuleTreePlaceholder(id)?.branch ?? resolveGlobalParentBranch(parentId));

  const entry: DevModuleTreeGlobalEntry = {
    id,
    kind,
    parentIds: [parentId],
    q,
    r,
    branch,
  };

  globalEntries = [...globalEntries, entry];
  persistGlobal();
  notifyGlobalChange();
  return entry;
}

export function addGlobalPlaceholderEntry(
  parentId: DraftParentId,
  q: number,
  r: number,
): DevModuleTreeGlobalEntry | null {
  if (!canPlaceGlobalAt(q, r)) return null;

  const entry: DevModuleTreeGlobalEntry = {
    id: nextGlobalPlaceholderId(),
    kind: 'placeholder',
    parentIds: [parentId],
    q,
    r,
    branch: resolveGlobalParentBranch(parentId),
  };

  globalEntries = [...globalEntries, entry];
  persistGlobal();
  notifyGlobalChange();
  return entry;
}

export function addGlobalParentLink(
  entryId: string,
  parentId: DraftParentId,
): DevModuleTreeGlobalEntry | null {
  const entry = globalEntries.find((item) => item.id === entryId);
  if (!entry) return null;
  if (parentId === entryId) return null;
  if (entry.parentIds.includes(parentId)) return null;

  const updated: DevModuleTreeGlobalEntry = {
    ...entry,
    parentIds: [...entry.parentIds, parentId],
  };

  globalEntries = globalEntries.map((item) => (item.id === entryId ? updated : item));
  persistGlobal();
  notifyGlobalChange();
  return updated;
}

export function moveGlobalDraftEntry(id: string, q: number, r: number): boolean {
  if (id === 'node0Boot') return false;
  const entry = globalEntries.find((item) => item.id === id);
  if (!entry) return false;
  if (!canPlaceGlobalAt(q, r, id)) return false;

  globalEntries = globalEntries.map((item) => (item.id === id ? { ...item, q, r } : item));
  persistGlobal();
  notifyGlobalChange();
  return true;
}

export function removeGlobalDraftEntry(id: string): void {
  if (id === 'node0Boot') return;
  const toRemove = collectGlobalCascadeIds(id);
  globalEntries = globalEntries.filter((entry) => !toRemove.has(entry.id));
  persistGlobal();
  notifyGlobalChange();
}

export function clearDevModuleTreeGlobalDraft(): void {
  globalEntries = [];
  persistGlobal();
  notifyGlobalChange();
}

export function formatGlobalPathFromParent(
  parentId: DraftParentId,
  q: number,
  r: number,
): string | null {
  const parentAxial = getGlobalParentAxial(parentId);
  return formatPathFromParentAxial(parentAxial, parentId, { q, r });
}
