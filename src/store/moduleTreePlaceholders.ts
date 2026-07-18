import {
  MODULE_TREE_GRAPH,
  isNodeRevealed,
  type BranchId,
} from './moduleTree';
import { getUpgradeLevel, type UpgradeId, type UpgradeLevels } from './upgradeCatalog';

export type ModuleTreePlaceholderId = `placeholder_${string}`;

export interface ModuleTreePlaceholderDef {
  id: ModuleTreePlaceholderId;
  /** First = primary parent (révélation). Additional = arêtes visuelles. */
  parentIds: Array<UpgradeId | 'core'>;
  q: number;
  r: number;
  branch: BranchId;
}

/** Placeholders visibles joueur (RESERVED) — source partagée production + éditeur dev. */
export const MODULE_TREE_PLACEHOLDERS: readonly ModuleTreePlaceholderDef[] = [] as const;

const PRODUCTION_PLACEHOLDER_IDS = new Set<string>(
  MODULE_TREE_PLACEHOLDERS.map((entry) => entry.id),
);

export function isProductionPlaceholderId(id: string): boolean {
  return PRODUCTION_PLACEHOLDER_IDS.has(id);
}

export function getModuleTreePlaceholder(id: string): ModuleTreePlaceholderDef | undefined {
  return MODULE_TREE_PLACEHOLDERS.find((entry) => entry.id === id);
}

export function isPlaceholderRevealed(
  placeholder: ModuleTreePlaceholderDef,
  upgrades: UpgradeLevels,
): boolean {
  return placeholder.parentIds.every((parentId) => {
    if (parentId === 'core') return true;
    const parentNode = MODULE_TREE_GRAPH.find((node) => node.id === parentId);
    if (!parentNode || !isNodeRevealed(parentNode, upgrades)) return false;
    return getUpgradeLevel(upgrades, parentId) >= 1;
  });
}

export function getRevealedPlaceholders(
  upgrades: UpgradeLevels,
): readonly ModuleTreePlaceholderDef[] {
  return MODULE_TREE_PLACEHOLDERS.filter((entry) => isPlaceholderRevealed(entry, upgrades));
}
