import type { OwnedModuleEntry } from '../formatOwnedModules';
import {
  buildModulesFingerprint,
  formatModuleLevelLabel,
  formatModulesCompact,
} from '../formatOwnedModules';
import type { BalanceTrackerBuildEntry } from './types';

export function createBuildCatalogEntry(modules: OwnedModuleEntry[]): BalanceTrackerBuildEntry {
  return {
    fingerprint: buildModulesFingerprint(modules),
    labelCompact: formatModulesCompact(modules),
    modules: modules.map((module) => ({ ...module })),
  };
}

export function findBuildCatalogIndex(
  catalog: readonly BalanceTrackerBuildEntry[],
  fingerprint: string,
): number {
  return catalog.findIndex((entry) => entry.fingerprint === fingerprint);
}

export function upsertBuildCatalogEntry(
  catalog: BalanceTrackerBuildEntry[],
  modules: OwnedModuleEntry[],
): { catalog: BalanceTrackerBuildEntry[]; buildRef: number } {
  const entry = createBuildCatalogEntry(modules);
  const existingIndex = findBuildCatalogIndex(catalog, entry.fingerprint);
  if (existingIndex >= 0) {
    return { catalog, buildRef: existingIndex };
  }
  const nextCatalog = [...catalog, entry];
  return { catalog: nextCatalog, buildRef: nextCatalog.length - 1 };
}

export function diffBuildSnapshots(
  previous: readonly OwnedModuleEntry[],
  next: readonly OwnedModuleEntry[],
): string[] {
  const prevById = new Map(previous.map((module) => [module.id, module.level]));
  const nextById = new Map(next.map((module) => [module.id, module]));
  const changes: string[] = [];

  for (const module of next) {
    const prevLevel = prevById.get(module.id);
    if (prevLevel === undefined) {
      changes.push(`+${formatModuleLevelLabel(module)}`);
      continue;
    }
    if (prevLevel !== module.level) {
      changes.push(`${module.name} L${prevLevel}→L${module.level}`);
    }
  }

  for (const [id, prevLevel] of prevById) {
    if (!nextById.has(id)) {
      const prevModule = previous.find((module) => module.id === id);
      if (prevModule) {
        changes.push(`−${formatModuleLevelLabel(prevModule)}`);
      } else {
        changes.push(`−${id} L${prevLevel}`);
      }
    }
  }

  return changes;
}

export function resolveBuildLabel(
  catalog: readonly BalanceTrackerBuildEntry[],
  buildRef: number,
): string {
  const entry = catalog[buildRef];
  return entry?.labelCompact ?? '—';
}
