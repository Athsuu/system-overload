import {
  MODULE_TREE_GRAPH,
  type TreeParentId,
} from '../../store/moduleTree';
import { MODULE_TREE_PLACEHOLDERS } from '../../store/moduleTreePlaceholders';
import { pixelToAxial } from '../../store/moduleTreeHexGrid';
import type { UpgradeId } from '../../store/upgradeCatalog';
import {
  formatHexCoord,
  formatProductionRequires,
  formatRequiresFromParentIds,
  draftParentToGraphParent,
} from './devModuleTreeExportShared';
import {
  formatGlobalPathFromParent,
  getDevModuleTreeGlobalDraft,
  getGlobalPrimaryParent,
  type DevModuleTreeGlobalEntry,
} from './devModuleTreeGlobalDraft';

function formatReadableEntry(entry: DevModuleTreeGlobalEntry, index: number): string[] {
  const paths = entry.parentIds.map(
    (parentId) => `${parentId}: ${formatGlobalPathFromParent(parentId, entry.q, entry.r) ?? 'n/a'}`,
  );

  return [
    `[${index}] ${entry.id} (${entry.kind})`,
    `  parents: ${entry.parentIds.join(', ')} (${entry.branch})`,
    `  primary: ${getGlobalPrimaryParent(entry)}`,
    `  hex: ${formatHexCoord(entry.q, entry.r)}`,
    ...paths.map((path) => `  chemin ${path}`),
    `  position: positionFromAxial(${entry.q}, ${entry.r})`,
  ];
}

function resolveRequiresForExport(entry: DevModuleTreeGlobalEntry): string | null {
  if (entry.id === 'node0Boot') return null;

  const graphParent = draftParentToGraphParent(getGlobalPrimaryParent(entry)) as TreeParentId;
  const productionNode = MODULE_TREE_GRAPH.find((node) => node.id === entry.id);

  if (
    productionNode?.requires &&
    productionNode.parentId === graphParent &&
    entry.parentIds.length === 1
  ) {
    return formatProductionRequires(productionNode.requires);
  }

  return formatRequiresFromParentIds(entry.parentIds);
}

function formatUpgradeGraphNode(entry: DevModuleTreeGlobalEntry): string {
  const graphParent = draftParentToGraphParent(getGlobalPrimaryParent(entry));
  const requiresLine = resolveRequiresForExport(entry);
  const lines = [
    '  {',
    `    id: '${entry.id}',`,
    `    kind: 'upgrade',`,
    `    parentId: '${graphParent}',`,
    `    position: positionFromAxial(${entry.q}, ${entry.r}),`,
    `    branch: '${entry.branch}',`,
  ];

  if (requiresLine) {
    lines.push(`    ${requiresLine}`);
  }

  lines.push('  },');
  return lines.join('\n');
}

function formatPlaceholderDef(entry: DevModuleTreeGlobalEntry): string {
  const parentIds = entry.parentIds.map((parentId) => `'${parentId}'`).join(', ');
  return `  {
    id: '${entry.id}',
    parentIds: [${parentIds}],
    q: ${entry.q},
    r: ${entry.r},
    branch: '${entry.branch}',
  },`;
}

function sortGraphExportEntries(entries: readonly DevModuleTreeGlobalEntry[]): DevModuleTreeGlobalEntry[] {
  const modules = entries.filter((entry) => entry.kind === 'module');
  const byId = new Map(modules.map((entry) => [entry.id, entry]));
  const sorted: DevModuleTreeGlobalEntry[] = [];
  const visited = new Set<string>();

  const visit = (id: string) => {
    if (visited.has(id)) return;
    const entry = byId.get(id);
    if (!entry) return;

    const parent = getGlobalPrimaryParent(entry);
    if (parent !== 'core' && byId.has(parent)) {
      visit(parent);
    }

    visited.add(id);
    sorted.push(entry);
  };

  for (const entry of modules) {
    visit(entry.id);
  }

  return sorted;
}

function getProductionAxial(id: UpgradeId): { q: number; r: number } | null {
  const node = MODULE_TREE_GRAPH.find((entry) => entry.id === id);
  if (!node) return null;
  return pixelToAxial(node.position.x, node.position.y);
}

function summarizeChanges(entries: readonly DevModuleTreeGlobalEntry[]): string[] {
  const lines: string[] = [];
  const movedModules: string[] = [];
  const newPlaceholders: string[] = [];
  const movedPlaceholders: string[] = [];

  for (const entry of entries) {
    if (entry.kind === 'module' && entry.id !== 'node0Boot') {
      const prodAxial = getProductionAxial(entry.id as UpgradeId);
      if (prodAxial && (prodAxial.q !== entry.q || prodAxial.r !== entry.r)) {
        movedModules.push(
          `${entry.id} ${formatHexCoord(prodAxial.q, prodAxial.r)} → ${formatHexCoord(entry.q, entry.r)}`,
        );
      }
      continue;
    }

    if (entry.kind !== 'placeholder') continue;

    const prodPlaceholder = MODULE_TREE_PLACEHOLDERS.find((item) => item.id === entry.id);
    if (!prodPlaceholder) {
      newPlaceholders.push(`${entry.id} @ ${formatHexCoord(entry.q, entry.r)}`);
      continue;
    }

    if (prodPlaceholder.q !== entry.q || prodPlaceholder.r !== entry.r) {
      movedPlaceholders.push(
        `${entry.id} ${formatHexCoord(prodPlaceholder.q, prodPlaceholder.r)} → ${formatHexCoord(entry.q, entry.r)}`,
      );
    }
  }

  if (movedModules.length > 0) {
    lines.push(`Modules déplacés (${movedModules.length}) :`);
    movedModules.forEach((item) => lines.push(`  - ${item}`));
  }

  if (newPlaceholders.length > 0) {
    lines.push(`Nouveaux placeholders (${newPlaceholders.length}) :`);
    newPlaceholders.forEach((item) => lines.push(`  - ${item}`));
  }

  if (movedPlaceholders.length > 0) {
    lines.push(`Placeholders déplacés (${movedPlaceholders.length}) :`);
    movedPlaceholders.forEach((item) => lines.push(`  - ${item}`));
  }

  if (lines.length === 0) {
    lines.push('Aucun déplacement détecté vs production (copie identique ou placeholders inchangés).');
  }

  return lines;
}

function formatModuleTreeGraphBlock(entries: readonly DevModuleTreeGlobalEntry[]): string {
  const modules = sortGraphExportEntries(entries);
  const nodes = modules.map((entry) => formatUpgradeGraphNode(entry)).join('\n');

  return [
    '// src/store/moduleTree.ts — remplacer MODULE_TREE_GRAPH[]',
    '// Imports requis en tête de fichier : requireLevel depuis upgradeCatalog',
    'export const MODULE_TREE_GRAPH: ModuleTreeGraphNode[] = [',
    nodes,
    '];',
  ].join('\n');
}

function formatPlaceholdersBlock(entries: readonly DevModuleTreeGlobalEntry[]): string {
  const placeholders = entries.filter((entry) => entry.kind === 'placeholder');

  if (placeholders.length === 0) {
    return [
      '// src/store/moduleTreePlaceholders.ts',
      '// Aucun placeholder dans le plan global.',
      'export const MODULE_TREE_PLACEHOLDERS: readonly ModuleTreePlaceholderDef[] = [] as const;',
    ].join('\n');
  }

  const nodes = placeholders.map((entry) => formatPlaceholderDef(entry)).join('\n');
  return [
    '// src/store/moduleTreePlaceholders.ts — remplacer MODULE_TREE_PLACEHOLDERS[]',
    'export const MODULE_TREE_PLACEHOLDERS: readonly ModuleTreePlaceholderDef[] = [',
    nodes,
    '] as const;',
  ].join('\n');
}

function formatAgentChecklist(): string {
  return [
    '--- CHECKLIST AGENT (promotion plan → jeu) ---',
    '1. Coller le bloc MODULE_TREE_GRAPH dans src/store/moduleTree.ts',
    '2. Coller le bloc MODULE_TREE_PLACEHOLDERS dans src/store/moduleTreePlaceholders.ts',
    '3. npm run build',
    '4. Mettre à jour docs/lexique-jeu.md §4 (positions) + §15 si workflow export',
    '5. Nouveau module jouable (pas placeholder) → checklist §14 complète (catalogue, effets, i18n)',
    '6. Ne pas committer sans demande PO',
  ].join('\n');
}

export function formatDevModuleTreeGlobalPlan(): string {
  const entries = getDevModuleTreeGlobalDraft();
  const moduleCount = entries.filter((entry) => entry.kind === 'module').length;
  const placeholderCount = entries.filter((entry) => entry.kind === 'placeholder').length;
  const lines: string[] = [];

  lines.push('=== ZERO ARCHIVE — EXPORT PLAN GLOBAL (dev) ===');
  lines.push(`Généré : ${new Date().toISOString()}`);
  lines.push(`Nœuds : ${entries.length} (${moduleCount} modules, ${placeholderCount} placeholders)`);
  lines.push('');

  if (entries.length === 0) {
    lines.push('(plan global vide — importer l’arbre actuel)');
    return lines.join('\n');
  }

  lines.push('--- RÉSUMÉ vs production ---');
  lines.push(...summarizeChanges(entries));
  lines.push('');

  lines.push('--- PLAN LISIBLE ---');
  entries.forEach((entry, index) => {
    lines.push(...formatReadableEntry(entry, index + 1));
    lines.push('');
  });

  lines.push(formatModuleTreeGraphBlock(entries));
  lines.push('');
  lines.push(formatPlaceholdersBlock(entries));
  lines.push('');
  lines.push(formatAgentChecklist());

  return lines.join('\n');
}

export async function copyDevModuleTreeGlobalPlanToClipboard(): Promise<boolean> {
  const text = formatDevModuleTreeGlobalPlan();
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
