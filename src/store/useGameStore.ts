import { create } from 'zustand';
import { saveGame, type SaveData } from './persistence';
import { loadSettings } from './settingsPersistence';
import { DEFAULT_PRESTIGE } from './prestigeTypes';
import {
  BOSS_VICTORY_SHARD_BONUS,
  DEFAULT_UPGRADES,
  getUpgradeCost,
  getUpgradeCurrency,
  getUpgradeDefinition,
  isModuleUnlocked,
  type UpgradeId,
  type UpgradeLevels,
} from './upgradeCatalog';
import {
  clampCycleIndex,
  DEFAULT_CYCLE_PROGRESS,
  isCycleCleared,
  MAX_CYCLES,
} from './cycleTypes';
import { getBreachCap } from '../game/runConfig';
import { getModuleNode } from './moduleTree';
import { markTutorialSignal } from '../tutorial/tutorialSignals';
import { clearRunArchAmbientHeard } from '../tutorial/archAmbientPersistence';

export type GameState =
  | 'MAIN_MENU'
  | 'MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'RUN_END'
  | 'UPGRADING'
  | 'GAME_OVER';
export type RunOutcome = 'victory_boss' | 'defeat_breach';
export type WavePhase = 'idle' | 'spawning' | 'combat' | 'intermission' | 'boss';

interface GameStore {
  gameState: GameState;
  breachProgress: number;
  bankShards: number;
  bankAnchorFragments: number;
  runShards: number;
  lastRunShards: number;
  lastRunAnchorFragments: number;
  anchorFragmentEarnedThisRun: boolean;
  upgrades: UpgradeLevels;
  prestigeUnlocked: boolean;
  prestigeLevel: number;
  highestCycleUnlocked: number;
  selectedCycle: number;
  cyclesCleared: number[];
  activeCycle: number;
  runOutcome: RunOutcome | null;
  prestigeUnlockedThisRun: boolean;
  waveIndex: number;
  wavePhase: WavePhase;
  showWaveClear: boolean;
  fluxDriveEnabled: boolean;
  setGameState: (state: GameState) => void;
  pauseRun: () => void;
  resumeRun: () => void;
  abortRun: () => void;
  togglePause: () => void;
  addBreachProgress: (delta: number) => void;
  addRunShards: (amount: number) => void;
  endRun: (outcome: RunOutcome) => void;
  openModuleTree: () => void;
  purchaseUpgrade: (id: UpgradeId) => boolean;
  startRun: (cycle?: number) => void;
  setSelectedCycle: (cycle: number) => void;
  toggleFluxDriveEnabled: () => void;
  setWaveIndex: (waveIndex: number) => void;
  setWavePhase: (phase: WavePhase) => void;
  setShowWaveClear: (show: boolean) => void;
  persistProgressSnapshot: () => void;
  returnToMainMenu: () => void;
}

function buildSaveSnapshot(state: {
  bankShards: number;
  bankAnchorFragments: number;
  upgrades: UpgradeLevels;
  prestigeUnlocked: boolean;
  prestigeLevel: number;
  highestCycleUnlocked: number;
  selectedCycle: number;
  cyclesCleared: number[];
}): SaveData {
  return {
    bankShards: state.bankShards,
    bankAnchorFragments: state.bankAnchorFragments,
    upgrades: state.upgrades,
    prestigeUnlocked: state.prestigeUnlocked,
    prestigeLevel: state.prestigeLevel,
    highestCycleUnlocked: state.highestCycleUnlocked,
    selectedCycle: state.selectedCycle,
    cyclesCleared: state.cyclesCleared,
  };
}

function persistProgress(state: Parameters<typeof buildSaveSnapshot>[0]): void {
  saveGame(buildSaveSnapshot(state));
}

const persistedSettings = loadSettings();

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: 'MAIN_MENU',
  breachProgress: 0,
  bankShards: 0,
  bankAnchorFragments: 0,
  runShards: 0,
  lastRunShards: 0,
  lastRunAnchorFragments: 0,
  anchorFragmentEarnedThisRun: false,
  upgrades: DEFAULT_UPGRADES,
  prestigeUnlocked: DEFAULT_PRESTIGE.prestigeUnlocked,
  prestigeLevel: DEFAULT_PRESTIGE.prestigeLevel,
  highestCycleUnlocked: DEFAULT_CYCLE_PROGRESS.highestCycleUnlocked,
  selectedCycle: DEFAULT_CYCLE_PROGRESS.selectedCycle,
  cyclesCleared: [...DEFAULT_CYCLE_PROGRESS.cyclesCleared],
  activeCycle: DEFAULT_CYCLE_PROGRESS.selectedCycle,
  runOutcome: null,
  prestigeUnlockedThisRun: false,
  waveIndex: 0,
  wavePhase: 'idle',
  showWaveClear: false,
  fluxDriveEnabled: persistedSettings.fluxDriveEnabled,
  setGameState: (gameState) => set({ gameState }),
  pauseRun: () => {
    if (get().gameState !== 'PLAYING') return;
    set({ gameState: 'PAUSED' });
  },
  resumeRun: () => {
    if (get().gameState !== 'PAUSED') return;
    set({ gameState: 'PLAYING' });
  },
  togglePause: () => {
    const state = get();
    if (state.gameState === 'PLAYING') {
      set({ gameState: 'PAUSED' });
      return;
    }
    if (state.gameState === 'PAUSED') {
      set({ gameState: 'PLAYING' });
    }
  },
  abortRun: () =>
    set((state) => {
      persistProgress(state);
      return {
        gameState: 'UPGRADING',
        breachProgress: 0,
        runShards: 0,
        runOutcome: null,
        waveIndex: 0,
        wavePhase: 'idle',
        showWaveClear: false,
        anchorFragmentEarnedThisRun: false,
        activeCycle: state.selectedCycle,
      };
    }),
  addBreachProgress: (delta) =>
    set((state) => {
      const maxBreach = getBreachCap(state.upgrades);
      const raw = Math.max(0, state.breachProgress + delta);
      const breachProgress = raw >= maxBreach - 1e-6 ? maxBreach : Math.min(maxBreach, raw);
      return { breachProgress };
    }),
  addRunShards: (amount) =>
    set((state) => {
      const bankShards = state.bankShards + amount;
      const next = { ...state, bankShards, runShards: state.runShards + amount };
      persistProgress(next);
      return {
        bankShards,
        runShards: state.runShards + amount,
      };
    }),
  endRun: (outcome) =>
    set((state) => {
      const bossBonus = outcome === 'victory_boss' ? BOSS_VICTORY_SHARD_BONUS : 0;
      const bankShards = state.bankShards + bossBonus;
      const lastRunShards = state.runShards + bossBonus;

      const firstClearThisCycle =
        outcome === 'victory_boss' && !isCycleCleared(state.cyclesCleared, state.activeCycle);
      const anchorGain = firstClearThisCycle ? 1 : 0;
      const bankAnchorFragments = state.bankAnchorFragments + anchorGain;

      let cyclesCleared = state.cyclesCleared;
      let highestCycleUnlocked = state.highestCycleUnlocked;
      if (outcome === 'victory_boss' && firstClearThisCycle) {
        cyclesCleared = [...cyclesCleared, state.activeCycle].sort((a, b) => a - b);
        highestCycleUnlocked = Math.min(MAX_CYCLES, state.activeCycle + 1);
      }

      const selectedCycle = Math.min(state.selectedCycle, highestCycleUnlocked);

      const next = {
        ...state,
        bankShards,
        bankAnchorFragments,
        cyclesCleared,
        highestCycleUnlocked,
        selectedCycle,
      };
      persistProgress(next);

      return {
        bankShards,
        bankAnchorFragments,
        cyclesCleared,
        highestCycleUnlocked,
        selectedCycle,
        runShards: 0,
        lastRunShards,
        lastRunAnchorFragments: anchorGain,
        anchorFragmentEarnedThisRun: anchorGain > 0,
        runOutcome: outcome,
        gameState: 'RUN_END' as const,
      };
    }),
  openModuleTree: () => set({ gameState: 'UPGRADING' }),
  purchaseUpgrade: (id) => {
    const state = get();
    const definition = getUpgradeDefinition(id);
    const moduleNode = getModuleNode(id);
    const level = state.upgrades[id];

    if (!isModuleUnlocked(id, state.upgrades, moduleNode.requires)) return false;
    if (level >= definition.maxLevel) return false;

    const cost = getUpgradeCost(definition, level);
    const currency = getUpgradeCurrency(id);

    if (currency === 'anchor') {
      if (state.bankAnchorFragments < cost) return false;
      const bankAnchorFragments = state.bankAnchorFragments - cost;
      const upgrades = { ...state.upgrades, [id]: level + 1 };
      persistProgress({ ...state, bankAnchorFragments, upgrades });
      markTutorialSignal('upgradePurchased');
      set({ bankAnchorFragments, upgrades });
      return true;
    }

    if (state.bankShards < cost) return false;

    const upgrades = { ...state.upgrades, [id]: level + 1 };
    const bankShards = state.bankShards - cost;
    persistProgress({ ...state, bankShards, upgrades });
    markTutorialSignal('upgradePurchased');
    set({ bankShards, upgrades });
    return true;
  },
  setSelectedCycle: (cycle) =>
    set((state) => {
      const selectedCycle = clampCycleIndex(Math.min(cycle, state.highestCycleUnlocked));
      persistProgress({ ...state, selectedCycle });
      return { selectedCycle };
    }),
  startRun: (cycle) => {
    clearRunArchAmbientHeard();
    const state = get();
    const requested = cycle ?? state.selectedCycle;
    const activeCycle = clampCycleIndex(Math.min(requested, state.highestCycleUnlocked));
    const selectedCycle = activeCycle;
    persistProgress({ ...state, selectedCycle });
    set({
      gameState: 'PLAYING',
      breachProgress: 0,
      runShards: 0,
      runOutcome: null,
      prestigeUnlockedThisRun: false,
      anchorFragmentEarnedThisRun: false,
      activeCycle,
      selectedCycle,
      waveIndex: 1,
      wavePhase: 'spawning',
      showWaveClear: false,
    });
  },
  toggleFluxDriveEnabled: () => {},
  setWaveIndex: (waveIndex) => set({ waveIndex }),
  setWavePhase: (wavePhase) => set({ wavePhase }),
  setShowWaveClear: (showWaveClear) => set({ showWaveClear }),
  persistProgressSnapshot: () => {
    persistProgress(get());
  },
  returnToMainMenu: () => {
    const state = get();
    persistProgress(state);
    set({
      gameState: 'MAIN_MENU',
      breachProgress: 0,
      runShards: 0,
      lastRunShards: 0,
      lastRunAnchorFragments: 0,
      runOutcome: null,
      prestigeUnlockedThisRun: false,
      anchorFragmentEarnedThisRun: false,
      waveIndex: 0,
      wavePhase: 'idle',
      showWaveClear: false,
      activeCycle: state.selectedCycle,
    });
  },
}));

export function resetToFreshPlayer(): void {
  const settings = loadSettings();
  useGameStore.setState({
    gameState: 'MENU',
    breachProgress: 0,
    bankShards: 0,
    bankAnchorFragments: 0,
    runShards: 0,
    lastRunShards: 0,
    lastRunAnchorFragments: 0,
    anchorFragmentEarnedThisRun: false,
    upgrades: DEFAULT_UPGRADES,
    prestigeUnlocked: DEFAULT_PRESTIGE.prestigeUnlocked,
    prestigeLevel: DEFAULT_PRESTIGE.prestigeLevel,
    highestCycleUnlocked: DEFAULT_CYCLE_PROGRESS.highestCycleUnlocked,
    selectedCycle: DEFAULT_CYCLE_PROGRESS.selectedCycle,
    cyclesCleared: [...DEFAULT_CYCLE_PROGRESS.cyclesCleared],
    activeCycle: DEFAULT_CYCLE_PROGRESS.selectedCycle,
    runOutcome: null,
    prestigeUnlockedThisRun: false,
    waveIndex: 0,
    wavePhase: 'idle',
    showWaveClear: false,
    fluxDriveEnabled: settings.fluxDriveEnabled,
  });
  useGameStore.getState().persistProgressSnapshot();
}

export function persistCurrentProgress(): void {
  useGameStore.getState().persistProgressSnapshot();
}
