import { MODULE_TREE_NODES } from '../store/moduleTree';
import {
  UPGRADE_CATALOG,
  getUpgradeDefinition,
  getUpgradeLevel,
  type UpgradeId,
  type UpgradeLevels,
} from '../store/upgradeCatalog';

export interface OwnedModuleEntry {
  id: UpgradeId;
  name: string;
  level: number;
  branch: string;
}

function resolveModuleName(id: UpgradeId): string {
  try {
    return getUpgradeDefinition(id).name;
  } catch {
    return id;
  }
}

export function getUpgradeDisplayName(id: UpgradeId): string {
  return resolveModuleName(id);
}

function resolveModuleBranch(id: UpgradeId): string {
  const node = MODULE_TREE_NODES.find((entry) => entry.id === id);
  return node?.branch ?? 'zzz';
}

/** Modules possédés (niveau > 0), tri stable branche puis nom. */
export function listOwnedModules(upgrades: UpgradeLevels): OwnedModuleEntry[] {
  return UPGRADE_CATALOG.map((entry) => ({
    id: entry.id,
    name: resolveModuleName(entry.id),
    level: getUpgradeLevel(upgrades, entry.id),
    branch: resolveModuleBranch(entry.id),
  }))
    .filter((module) => module.level > 0)
    .sort((a, b) => {
      const branchCmp = a.branch.localeCompare(b.branch);
      if (branchCmp !== 0) return branchCmp;
      return a.name.localeCompare(b.name, 'fr');
    });
}

export function formatModuleLevelLabel(module: Pick<OwnedModuleEntry, 'name' | 'level'>): string {
  return `${module.name} L${module.level}`;
}

export function formatModulesCompact(modules: readonly OwnedModuleEntry[]): string {
  if (modules.length === 0) return '—';
  return modules.map((module) => formatModuleLevelLabel(module)).join(', ');
}

export function buildModulesFingerprint(modules: readonly OwnedModuleEntry[]): string {
  return [...modules]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((module) => `${module.id}:${module.level}`)
    .join('|');
}
