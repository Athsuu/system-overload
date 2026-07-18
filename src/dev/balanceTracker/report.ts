import { formatRunElapsedMs } from '../../game/runElapsed';
import { diffBuildSnapshots, resolveBuildLabel } from './buildCatalog';
import {
  formatOverloadDominantLabel,
  formatOverloadPercent,
} from './overloadSummary';
import type { BalanceRunRecord, BalanceTrackerState } from './types';

function formatOutcome(outcome: BalanceRunRecord['outcome']): string {
  return outcome === 'victory_boss' ? 'Victoire' : 'Meltdown';
}

function formatBuildChanges(changes: readonly string[]): string {
  return changes.length > 0 ? changes.join(', ') : '—';
}

function formatSessionStartedAt(state: BalanceTrackerState): string {
  if (state.sessionStartedAt) {
    return new Date(state.sessionStartedAt).toLocaleString('fr-FR');
  }
  if (state.runs.length > 0) {
    return new Date(state.runs[0].recordedAt).toLocaleString('fr-FR');
  }
  return new Date().toLocaleString('fr-FR');
}

export function formatBalanceTrackerPreviewLine(
  _state: BalanceTrackerState,
  run: BalanceRunRecord,
  index: number,
): string {
  const buildDelta = formatBuildChanges(run.buildChanges);
  const dominant = formatOverloadDominantLabel(run.overload.dominant);
  return `#${index + 1} · ${run.shardsRun} shards · Δ ${buildDelta} · ${dominant}`;
}

export function formatBalanceTrackerReport(state: BalanceTrackerState): string {
  const lines: string[] = [];
  const sessionStarted = formatSessionStartedAt(state);
  const totalShards = state.runs.reduce((sum, run) => sum + run.shardsRun, 0);

  lines.push(`# Suivi équilibrage — session du ${sessionStarted}`);
  lines.push('');
  lines.push(
    `Enregistrement : **${state.recording ? 'ON' : 'OFF'}** · ${state.runs.length} run(s) · ${totalShards} shards`,
  );
  lines.push('');

  if (state.runs.length === 0) {
    lines.push('_Aucune run enregistrée._');
    return lines.join('\n');
  }

  lines.push(
    '| # | Cycle | Résultat | Kills | Durée | Shards run | Shards Σ | Δ build | Source surcharge | Passive | Hit | Build |',
  );
  lines.push(
    '|---|------:|----------|------:|------:|-----------:|---------:|---------|------------------|--------:|----:|-------|',
  );

  state.runs.forEach((run, index) => {
    const pct = formatOverloadPercent(run.overload.passive, run.overload.hit);
    const buildLabel = resolveBuildLabel(state.buildCatalog, run.buildRef);
    lines.push(
      `| ${index + 1} | ${run.cycle} | ${formatOutcome(run.outcome)} | ${run.kills} | ${formatRunElapsedMs(run.elapsedMs)} | ${run.shardsRun} | ${run.shardsSessionTotal} | ${formatBuildChanges(run.buildChanges)} | ${formatOverloadDominantLabel(run.overload.dominant)} | ${pct.passive} | ${pct.hit} | ${buildLabel} |`,
    );
  });

  lines.push('');
  lines.push(`Total session : ${state.runs.length} runs · ${totalShards} shards`);
  return lines.join('\n');
}

export function formatBalanceTrackerLastRunReport(state: BalanceTrackerState): string | null {
  const lastIndex = state.runs.length - 1;
  if (lastIndex < 0) return null;

  const run = state.runs[lastIndex];
  const pct = formatOverloadPercent(run.overload.passive, run.overload.hit);
  const buildLabel = resolveBuildLabel(state.buildCatalog, run.buildRef);
  const recordedAt = new Date(run.recordedAt).toLocaleString('fr-FR');

  const lines: string[] = [
    `# Dernière run — suivi équilibrage`,
    '',
    `Enregistrée : ${recordedAt}`,
    '',
    '| Champ | Valeur |',
    '| --- | --- |',
    `| Run # | ${lastIndex + 1} |`,
    `| Cycle | ${run.cycle} |`,
    `| Résultat | ${formatOutcome(run.outcome)} |`,
    `| Kills | ${run.kills} |`,
    `| Durée | ${formatRunElapsedMs(run.elapsedMs)} |`,
    `| Shards run | ${run.shardsRun} |`,
    `| Shards session (cumul) | ${run.shardsSessionTotal} |`,
    `| Δ build | ${formatBuildChanges(run.buildChanges)} |`,
    `| Build | ${buildLabel} |`,
    `| Source surcharge | ${formatOverloadDominantLabel(run.overload.dominant)} |`,
    `| Surcharge passive | ${run.overload.passive} (${pct.passive}) |`,
    `| Surcharge hit | ${run.overload.hit} (${pct.hit}) |`,
  ];

  return lines.join('\n');
}

export function getLastRunsWithBuildDetail(state: BalanceTrackerState, limit = 3): string[] {
  const start = Math.max(0, state.runs.length - limit);
  return state.runs.slice(start).map((run, offset) => {
    const index = start + offset;
    const buildLabel = resolveBuildLabel(state.buildCatalog, run.buildRef);
    return `${formatBalanceTrackerPreviewLine(state, run, index)} — ${buildLabel}`;
  });
}

export { diffBuildSnapshots };
