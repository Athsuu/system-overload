import {
  MODULE_TREE_GRAPH,
  getUpgradeBranch,
  type BranchId,
  type TreeParentId,
} from '../../store/moduleTree';
import { axialToPixel, formatPathFromParentAxial, pixelToAxial } from '../../store/moduleTreeHexGrid';
import type { UpgradeId } from '../../store/upgradeCatalog';

export type DraftParentId = UpgradeId | string;

export interface DevModuleTreeDraftEntry {
  id: string;
  /** First entry = primary tree parent (branch, cascade). Additional = extra requires / edges. */
  parentIds: DraftParentId[];
  q: number;
  r: number;
  branch: BranchId;
}

/** Plan validé PO — placeholders Purge bas (2026-07-15). */
export const CANONICAL_DEV_MODULE_TREE_DRAFT: readonly DevModuleTreeDraftEntry[] = [
  {
    id: 'placeholder_01',
    parentIds: ['purgeStrike'],
    q: 0,
    r: 2,
    branch: 'degats',
  },
  {
    id: 'placeholder_02',
    parentIds: ['latencyInjection', 'purgeSplash'],
    q: 0,
    r: 3,
    branch: 'degats',
  },
] as const;

const STORAGE_KEY = 'dev-module-tree-draft';

let draftEntries: DevModuleTreeDraftEntry[] = loadDraftFromStorage();

export const DEV_MODULE_TREE_DRAFT_EVENT = 'dev-module-tree-draft-change';

function notifyDraftChange(): void {
  window.dispatchEvent(new CustomEvent(DEV_MODULE_TREE_DRAFT_EVENT));
}

function normalizeStoredEntry(value: unknown): DevModuleTreeDraftEntry | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as {
    id?: string;
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

  return {
    id: raw.id,
    parentIds,
    q: raw.q,
    r: raw.r,
    branch: raw.branch,
  };
}

function loadDraftFromStorage(): DevModuleTreeDraftEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...CANONICAL_DEV_MODULE_TREE_DRAFT];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...CANONICAL_DEV_MODULE_TREE_DRAFT];
    const entries = parsed
      .map(normalizeStoredEntry)
      .filter((entry): entry is DevModuleTreeDraftEntry => entry !== null);
    return entries.length > 0 ? entries : [...CANONICAL_DEV_MODULE_TREE_DRAFT];
  } catch {
    return [...CANONICAL_DEV_MODULE_TREE_DRAFT];
  }
}

function persistDraft(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draftEntries));
}

export function getDevModuleTreeDraft(): readonly DevModuleTreeDraftEntry[] {
  return draftEntries;
}

export function getDraftPrimaryParent(entry: DevModuleTreeDraftEntry): DraftParentId {
  return entry.parentIds[0]!;
}

export function getDraftPosition(id: DraftParentId): { x: number; y: number } {
  const draft = draftEntries.find((entry) => entry.id === id);
  if (draft) return axialToPixel(draft.q, draft.r);

  const graphNode = MODULE_TREE_GRAPH.find((node) => node.id === id);
  if (graphNode) return graphNode.position;

  throw new Error(`[devModuleTreeDraft] Unknown parent id: ${id}`);
}

export function getParentAxial(parentId: DraftParentId): { q: number; r: number } {
  const draft = draftEntries.find((entry) => entry.id === parentId);
  if (draft) return { q: draft.q, r: draft.r };

  const graphNode = MODULE_TREE_GRAPH.find((node) => node.id === parentId);
  if (graphNode) return pixelToAxial(graphNode.position.x, graphNode.position.y);

  return { q: 0, r: 0 };
}

export function resolveParentBranch(parentId: DraftParentId): BranchId {
  const draft = draftEntries.find((entry) => entry.id === parentId);
  if (draft) return draft.branch;

  return getUpgradeBranch(parentId as UpgradeId);
}

function nextPlaceholderId(): string {
  const used = new Set(draftEntries.map((entry) => entry.id));
  let index = draftEntries.length + 1;
  while (used.has(`placeholder_${String(index).padStart(2, '0')}`)) {
    index += 1;
  }
  return `placeholder_${String(index).padStart(2, '0')}`;
}

function isCellOccupied(q: number, r: number): boolean {
  if (q === 0 && r === 0) return true;
  for (const node of MODULE_TREE_GRAPH) {
    const axial = pixelToAxial(node.position.x, node.position.y);
    if (axial.q === q && axial.r === r) return true;
  }
  return draftEntries.some((entry) => entry.q === q && entry.r === r);
}

export function canPlaceDraftAt(q: number, r: number): boolean {
  if (q === 0 && r === 0) return false;
  return !isCellOccupied(q, r);
}

export function getDraftAtCell(q: number, r: number): DevModuleTreeDraftEntry | undefined {
  return draftEntries.find((entry) => entry.q === q && entry.r === r);
}

function collectDraftCascadeIds(rootId: string): Set<string> {
  const toRemove = new Set<string>();
  const queue = [rootId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (toRemove.has(current)) continue;
    toRemove.add(current);
    for (const entry of draftEntries) {
      if (getDraftPrimaryParent(entry) === current) queue.push(entry.id);
    }
  }

  return toRemove;
}

export function countDraftCascadeDelete(id: string): number {
  return collectDraftCascadeIds(id).size;
}

export function addDevModuleTreeDraftEntry(
  parentId: DraftParentId,
  q: number,
  r: number,
): DevModuleTreeDraftEntry | null {
  if (!canPlaceDraftAt(q, r)) return null;

  const entry: DevModuleTreeDraftEntry = {
    id: nextPlaceholderId(),
    parentIds: [parentId],
    q,
    r,
    branch: resolveParentBranch(parentId),
  };

  draftEntries = [...draftEntries, entry];
  persistDraft();
  notifyDraftChange();
  return entry;
}

export function addDraftParentLink(
  draftId: string,
  parentId: DraftParentId,
): DevModuleTreeDraftEntry | null {
  const entry = draftEntries.find((item) => item.id === draftId);
  if (!entry) return null;
  if (parentId === draftId) return null;
  if (entry.parentIds.includes(parentId)) return null;

  const updated: DevModuleTreeDraftEntry = {
    ...entry,
    parentIds: [...entry.parentIds, parentId],
  };

  draftEntries = draftEntries.map((item) => (item.id === draftId ? updated : item));
  persistDraft();
  notifyDraftChange();
  return updated;
}

export function removeDevModuleTreeDraftEntry(id: string): void {
  const toRemove = collectDraftCascadeIds(id);
  draftEntries = draftEntries.filter((entry) => !toRemove.has(entry.id));
  persistDraft();
  notifyDraftChange();
}

export function clearDevModuleTreeDraft(): void {
  draftEntries = [];
  persistDraft();
  notifyDraftChange();
}

export function applyCanonicalDevModuleTreeDraft(): void {
  draftEntries = CANONICAL_DEV_MODULE_TREE_DRAFT.map((entry) => ({ ...entry, parentIds: [...entry.parentIds] }));
  persistDraft();
  notifyDraftChange();
}

export function formatPathFromParent(
  parentId: DraftParentId,
  q: number,
  r: number,
): string | null {
  const parentAxial = getParentAxial(parentId);
  return formatPathFromParentAxial(parentAxial, parentId, { q, r });
}

export function resolveEdgeParentKey(parentId: TreeParentId | DraftParentId): UpgradeId | 'core' | string {
  if (parentId === 'root') return 'core';
  return parentId;
}
