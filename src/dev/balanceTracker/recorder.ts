import { runElapsedMsRef } from '../../game/runElapsed';
import { getRunOverloadTelemetry } from '../../game/runOverloadTelemetry';
import { listOwnedModules } from '../formatOwnedModules';
import { useGameStore, type RunOutcome } from '../../store/useGameStore';
import { diffBuildSnapshots, upsertBuildCatalogEntry } from './buildCatalog';
import { formatBalanceTrackerLastRunReport, formatBalanceTrackerReport } from './report';
import { resolveOverloadDominantSource } from './overloadSummary';
import { loadBalanceTrackerState, saveBalanceTrackerState } from './storage';
import {
  BALANCE_TRACKER_EVENT,
  type BalanceRunRecord,
  type BalanceTrackerState,
  createEmptyBalanceTrackerState,
} from './types';

let state: BalanceTrackerState = loadBalanceTrackerState();

function notify(): void {
  window.dispatchEvent(new CustomEvent(BALANCE_TRACKER_EVENT));
}

function persist(): void {
  saveBalanceTrackerState(state);
  notify();
}

export function getBalanceTrackerState(): BalanceTrackerState {
  return state;
}

export function isBalanceTrackerRecording(): boolean {
  return state.recording;
}

export function startBalanceTrackerRecording(): void {
  if (state.recording) return;
  state = {
    ...state,
    recording: true,
    sessionStartedAt: state.sessionStartedAt ?? new Date().toISOString(),
  };
  persist();
}

export function stopBalanceTrackerRecording(): void {
  if (!state.recording) return;
  state = { ...state, recording: false };
  persist();
}

export function resetBalanceTrackerLog(): void {
  state = createEmptyBalanceTrackerState();
  persist();
}

export function appendBalanceRunRecord(outcome: RunOutcome | null): void {
  if (!state.recording || !outcome) return;

  const game = useGameStore.getState();
  const telemetry = getRunOverloadTelemetry();
  const modules = listOwnedModules(game.upgrades);
  const { catalog, buildRef } = upsertBuildCatalogEntry(state.buildCatalog, modules);

  const previousRun = state.runs[state.runs.length - 1];
  const previousModules =
    previousRun !== undefined
      ? state.buildCatalog[previousRun.buildRef]?.modules ?? []
      : [];
  const buildChanges = diffBuildSnapshots(previousModules, modules);

  const shardsRun = game.lastRunShards;
  const previousSessionTotal = previousRun?.shardsSessionTotal ?? 0;
  const shardsSessionTotal = previousSessionTotal + shardsRun;

  const record: BalanceRunRecord = {
    recordedAt: new Date().toISOString(),
    cycle: game.activeCycle,
    outcome,
    kills: game.runKills,
    elapsedMs: runElapsedMsRef.value,
    shardsRun,
    shardsSessionTotal,
    overload: {
      passive: Math.round(telemetry.passiveTotal * 100) / 100,
      hit: Math.round(telemetry.hitTotal * 100) / 100,
      dominant: resolveOverloadDominantSource(telemetry.passiveTotal, telemetry.hitTotal),
    },
    buildRef,
    buildChanges,
  };

  state = {
    ...state,
    buildCatalog: catalog,
    runs: [...state.runs, record],
  };
  persist();
}

export function getBalanceTrackerSessionShardTotal(): number {
  return state.runs.reduce((sum, run) => sum + run.shardsRun, 0);
}

export async function copyBalanceTrackerReport(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(formatBalanceTrackerReport(state));
    return true;
  } catch {
    return false;
  }
}

export async function copyBalanceTrackerLastRun(): Promise<boolean> {
  const markdown = formatBalanceTrackerLastRunReport(state);
  if (!markdown) return false;
  try {
    await navigator.clipboard.writeText(markdown);
    return true;
  } catch {
    return false;
  }
}

export function downloadBalanceTrackerReport(): void {
  const markdown = formatBalanceTrackerReport(state);
  const date = new Date().toISOString().slice(0, 10);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `balance-session-${date}.md`;
  anchor.click();
  URL.revokeObjectURL(url);
}
