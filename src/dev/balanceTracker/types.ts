import type { RunOutcome } from '../../store/useGameStore';
import type { OwnedModuleEntry } from '../formatOwnedModules';

export const BALANCE_TRACKER_SCHEMA_VERSION = 1;
export const BALANCE_TRACKER_STORAGE_KEY = 'dev-balance-tracker';
export const BALANCE_TRACKER_EVENT = 'dev-balance-tracker-change';
export const BALANCE_TRACKER_MAX_RUNS = 500;
export const BALANCE_TRACKER_REPORT_FILENAME_PREFIX = 'balance-session';

export type OverloadDominantSource = 'passive' | 'hit' | 'tie';

export interface BalanceTrackerOverload {
  passive: number;
  hit: number;
  dominant: OverloadDominantSource;
}

export interface BalanceTrackerBuildEntry {
  fingerprint: string;
  labelCompact: string;
  modules: OwnedModuleEntry[];
}

export interface BalanceRunRecord {
  recordedAt: string;
  cycle: number;
  outcome: RunOutcome;
  kills: number;
  elapsedMs: number;
  shardsRun: number;
  shardsSessionTotal: number;
  overload: BalanceTrackerOverload;
  buildRef: number;
  buildChanges: string[];
}

export interface BalanceTrackerState {
  schemaVersion: number;
  recording: boolean;
  sessionStartedAt: string | null;
  buildCatalog: BalanceTrackerBuildEntry[];
  runs: BalanceRunRecord[];
}

export function createEmptyBalanceTrackerState(): BalanceTrackerState {
  return {
    schemaVersion: BALANCE_TRACKER_SCHEMA_VERSION,
    recording: false,
    sessionStartedAt: null,
    buildCatalog: [],
    runs: [],
  };
}
