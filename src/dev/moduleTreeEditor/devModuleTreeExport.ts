import { isProductionPlaceholderId } from '../../store/moduleTreePlaceholders';
import {
  formatPathFromParent,
  getDevModuleTreeDraft,
  getDraftPrimaryParent,
  type DevModuleTreeDraftEntry,
} from './devModuleTreeDraft';
import {
  formatHexCoord,
  formatRequiresFromParentIds,
} from './devModuleTreeExportShared';

function formatDraftEntry(entry: DevModuleTreeDraftEntry, index: number): string[] {
  const paths = entry.parentIds.map(
    (parentId) => `${parentId}: ${formatPathFromParent(parentId, entry.q, entry.r) ?? 'n/a'}`,
  );

  return [
    `[${index}] ${entry.id}`,
    `  parents: ${entry.parentIds.join(', ')} (${entry.branch})`,
    `  primary: ${getDraftPrimaryParent(entry)}`,
    `  hex: ${formatHexCoord(entry.q, entry.r)}`,
    ...paths.map((path) => `  chemin ${path}`),
    `  position: positionFromAxial(${entry.q}, ${entry.r})`,
  ];
}

function formatPlaceholderDef(entry: DevModuleTreeDraftEntry): string {
  const parentIds = entry.parentIds.map((parentId) => `'${parentId}'`).join(', ');
  return `  {
    id: '${entry.id}',
    parentIds: [${parentIds}],
    q: ${entry.q},
    r: ${entry.r},
    branch: '${entry.branch}',
  },`;
}

function formatPlaceholdersBlock(entries: readonly DevModuleTreeDraftEntry[]): string {
  const promotable = entries.filter((entry) => !isProductionPlaceholderId(entry.id));

  if (promotable.length === 0) {
    return [
      '// src/store/moduleTreePlaceholders.ts',
      '// Tous les placeholders locaux sont déjà en production, ou liste vide.',
    ].join('\n');
  }

  const nodes = promotable.map((entry) => formatPlaceholderDef(entry)).join('\n');
  return [
    '// src/store/moduleTreePlaceholders.ts — ajouter ou fusionner dans MODULE_TREE_PLACEHOLDERS[]',
    'export const MODULE_TREE_PLACEHOLDERS: readonly ModuleTreePlaceholderDef[] = [',
    nodes,
    '] as const;',
  ].join('\n');
}

export function formatDevModuleTreePlan(): string {
  const entries = getDevModuleTreeDraft();
  const newEntries = entries.filter((entry) => !isProductionPlaceholderId(entry.id));
  const lines: string[] = [];

  lines.push('=== ZERO ARCHIVE — EXPORT PLAN LOCAL (dev) ===');
  lines.push(`Généré : ${new Date().toISOString()}`);
  lines.push(`Placeholders brouillon : ${entries.length} (${newEntries.length} à promouvoir)`);
  lines.push('');

  if (entries.length === 0) {
    lines.push('(aucun placeholder local)');
    return lines.join('\n');
  }

  lines.push('--- PLAN LISIBLE ---');
  entries.forEach((entry, index) => {
    lines.push(...formatDraftEntry(entry, index + 1));
    lines.push('');
  });

  lines.push(formatPlaceholdersBlock(entries));
  lines.push('');

  if (newEntries.length > 0) {
    lines.push('--- SNIPPET requires (référence) ---');
    for (const entry of newEntries) {
      const requires = formatRequiresFromParentIds(entry.parentIds);
      lines.push(`// ${entry.id}`);
      if (requires) lines.push(`// ${requires}`);
      lines.push('');
    }
  }

  lines.push('--- CHECKLIST AGENT ---');
  lines.push('1. Fusionner MODULE_TREE_PLACEHOLDERS (ne pas dupliquer un id déjà en prod)');
  lines.push('2. npm run build');
  lines.push('3. Mettre à jour docs/lexique-jeu.md §4');
  lines.push('4. Module jouable complet → checklist §14');

  return lines.join('\n');
}

export async function copyDevModuleTreePlanToClipboard(): Promise<boolean> {
  const text = formatDevModuleTreePlan();
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
