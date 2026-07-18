import {
  BALANCE_TRACKER_MAX_RUNS,
  BALANCE_TRACKER_SCHEMA_VERSION,
  BALANCE_TRACKER_STORAGE_KEY,
  type BalanceTrackerState,
  createEmptyBalanceTrackerState,
} from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function sanitizeBuildCatalog(raw: unknown): BalanceTrackerState['buildCatalog'] {
  if (!Array.isArray(raw)) return [];
  const catalog: BalanceTrackerState['buildCatalog'] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    if (typeof item.fingerprint !== 'string' || typeof item.labelCompact !== 'string') continue;
    if (!Array.isArray(item.modules)) continue;
    const modules = item.modules
      .filter(isRecord)
      .map((module) => ({
        id: String(module.id ?? '') as BalanceTrackerState['buildCatalog'][number]['modules'][number]['id'],
        name: String(module.name ?? module.id ?? ''),
        level: typeof module.level === 'number' ? module.level : 0,
        branch: String(module.branch ?? ''),
      }))
      .filter((module) => module.id && module.level > 0);
    catalog.push({ fingerprint: item.fingerprint, labelCompact: item.labelCompact, modules });
  }
  return catalog;
}

function sanitizeRuns(raw: unknown): BalanceTrackerState['runs'] {
  if (!Array.isArray(raw)) return [];
  const runs: BalanceTrackerState['runs'] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    if (typeof item.recordedAt !== 'string') continue;
    if (item.outcome !== 'victory_boss' && item.outcome !== 'defeat_breach') continue;
    if (typeof item.buildRef !== 'number' || !isRecord(item.overload)) continue;
    const dominant = item.overload.dominant;
    if (dominant !== 'passive' && dominant !== 'hit' && dominant !== 'tie') continue;
    runs.push({
      recordedAt: item.recordedAt,
      cycle: typeof item.cycle === 'number' ? item.cycle : 1,
      outcome: item.outcome,
      kills: typeof item.kills === 'number' ? item.kills : 0,
      elapsedMs: typeof item.elapsedMs === 'number' ? item.elapsedMs : 0,
      shardsRun: typeof item.shardsRun === 'number' ? item.shardsRun : 0,
      shardsSessionTotal: typeof item.shardsSessionTotal === 'number' ? item.shardsSessionTotal : 0,
      overload: {
        passive: typeof item.overload.passive === 'number' ? item.overload.passive : 0,
        hit: typeof item.overload.hit === 'number' ? item.overload.hit : 0,
        dominant,
      },
      buildRef: item.buildRef,
      buildChanges: Array.isArray(item.buildChanges)
        ? item.buildChanges.filter((change): change is string => typeof change === 'string')
        : [],
    });
  }
  return runs;
}

export function trimBalanceTrackerState(state: BalanceTrackerState): BalanceTrackerState {
  if (state.runs.length <= BALANCE_TRACKER_MAX_RUNS) return state;
  const overflow = state.runs.length - BALANCE_TRACKER_MAX_RUNS;
  const runs = state.runs.slice(overflow);
  const usedRefs = new Set(runs.map((run) => run.buildRef));
  const buildCatalog = state.buildCatalog
    .map((entry, index) => ({ entry, index }))
    .filter(({ index }) => usedRefs.has(index))
    .map(({ entry }) => entry);
  const refMap = new Map<number, number>();
  state.buildCatalog.forEach((entry, oldIndex) => {
    const newIndex = buildCatalog.indexOf(entry);
    if (newIndex >= 0) refMap.set(oldIndex, newIndex);
  });
  return {
    ...state,
    buildCatalog,
    runs: runs.map((run) => ({
      ...run,
      buildRef: refMap.get(run.buildRef) ?? 0,
    })),
  };
}

export function loadBalanceTrackerState(): BalanceTrackerState {
  try {
    const raw = localStorage.getItem(BALANCE_TRACKER_STORAGE_KEY);
    if (!raw) return createEmptyBalanceTrackerState();
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return createEmptyBalanceTrackerState();
    const schemaVersion =
      typeof parsed.schemaVersion === 'number'
        ? parsed.schemaVersion
        : BALANCE_TRACKER_SCHEMA_VERSION;
    if (schemaVersion !== BALANCE_TRACKER_SCHEMA_VERSION) {
      return createEmptyBalanceTrackerState();
    }
    const state: BalanceTrackerState = {
      schemaVersion,
      recording: parsed.recording === true,
      sessionStartedAt:
        typeof parsed.sessionStartedAt === 'string' ? parsed.sessionStartedAt : null,
      buildCatalog: sanitizeBuildCatalog(parsed.buildCatalog),
      runs: sanitizeRuns(parsed.runs),
    };
    return trimBalanceTrackerState(state);
  } catch {
    return createEmptyBalanceTrackerState();
  }
}

export function saveBalanceTrackerState(state: BalanceTrackerState): void {
  const trimmed = trimBalanceTrackerState(state);
  localStorage.setItem(BALANCE_TRACKER_STORAGE_KEY, JSON.stringify(trimmed));
}

export function clearBalanceTrackerStorage(): void {
  localStorage.removeItem(BALANCE_TRACKER_STORAGE_KEY);
}
