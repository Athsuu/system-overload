import {
  formatPathFromParent,
  getDevModuleTreeDraft,
  getDraftPrimaryParent,
  type DevModuleTreeDraftEntry,
} from './devModuleTreeDraft';

function formatDraftEntry(entry: DevModuleTreeDraftEntry, index: number): string[] {
  const fmt = (value: number) => (value > 0 ? `+${value}` : String(value));
  const paths = entry.parentIds.map(
    (parentId) => `${parentId}: ${formatPathFromParent(parentId, entry.q, entry.r) ?? 'n/a'}`,
  );

  return [
    `[${index}] ${entry.id}`,
    `  parents: ${entry.parentIds.join(', ')} (${entry.branch})`,
    `  primary: ${getDraftPrimaryParent(entry)}`,
    `  hex: (${fmt(entry.q)}, ${fmt(entry.r)})`,
    ...paths.map((path) => `  chemin ${path}`),
    `  position: positionFromAxial(${entry.q}, ${entry.r})`,
  ];
}

function formatRequiresSnippet(entry: DevModuleTreeDraftEntry): string {
  if (entry.parentIds.length === 1) {
    return `requires: requireLevel('${entry.parentIds[0]}', 1),`;
  }
  const lines = entry.parentIds.map((parentId) => `    requireLevel('${parentId}', 1),`);
  return `requires: [\n${lines.join('\n')}\n  ],`;
}

function formatDraftSnippet(entry: DevModuleTreeDraftEntry): string {
  return `{
  id: '${entry.id}',
  kind: 'placeholder',
  parentId: '${getDraftPrimaryParent(entry)}',
  branch: '${entry.branch}',
  position: positionFromAxial(${entry.q}, ${entry.r}),
  ${formatRequiresSnippet(entry)}
},`;
}

export function formatDevModuleTreePlan(): string {
  const entries = getDevModuleTreeDraft();
  const lines: string[] = [];

  lines.push('=== ZERO ARCHIVE — PLAN MODULE TREE (dev) ===');
  lines.push(`Généré : ${new Date().toISOString()}`);
  lines.push(`Placeholders : ${entries.length}`);
  lines.push('');

  if (entries.length === 0) {
    lines.push('(aucun placeholder placé)');
    return lines.join('\n');
  }

  entries.forEach((entry, index) => {
    lines.push(...formatDraftEntry(entry, index + 1));
    lines.push('');
  });

  lines.push('--- SNIPPET TypeScript ---');
  for (const entry of entries) {
    lines.push(formatDraftSnippet(entry));
  }

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
