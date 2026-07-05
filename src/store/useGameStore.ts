import { create } from 'zustand';
import { saveGame } from './persistence';
import { DEFAULT_PRESTIGE } from './prestigeTypes';
import {
  DEFAULT_KERNEL_MODULE_LEVELS,
  getCyclesForLevelUp,
  getKernelModuleDefinition,
  getXpToNextLevel,
  type KernelModuleId,
  type KernelModuleLevels,
} from './kernelModuleCatalog';
import {
  DEFAULT_UPGRADES,
  getUpgradeCost,
  getUpgradeDefinition,
  isSkillUnlocked,
  type UpgradeId,
  type UpgradeLevels,
} from './upgradeCatalog';
import { getBreachCap } from '../game/runConfig';
import { getSkillNode } from './skillTree';

export type GameState =
  | 'MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'MODULE_BAY'
  | 'RUN_END'
  | 'UPGRADING'
  | 'GAME_OVER';
export type RunOutcome = 'victory_boss' | 'defeat_breach';
export type WavePhase = 'idle' | 'spawning' | 'combat' | 'intermission' | 'boss';

interface GameStore {
  gameState: GameState;
  breachProgress: number;
  bankShards: number;
  runShards: number;
  lastRunShards: number;
  upgrades: UpgradeLevels;
  prestigeUnlocked: boolean;
  prestigeLevel: number;
  runOutcome: RunOutcome | null;
  prestigeUnlockedThisRun: boolean;
  waveIndex: number;
  wavePhase: WavePhase;
  showWaveClear: boolean;
  runLevel: number;
  runXp: number;
  runXpToNext: number;
  runCycles: number;
  runModuleLevels: KernelModuleLevels;
  setGameState: (state: GameState) => void;
  pauseRun: () => void;
  resumeRun: () => void;
  abortRun: () => void;
  togglePause: () => void;
  addBreachProgress: (delta: number) => void;
  addRunShards: (amount: number) => void;
  endRun: (outcome: RunOutcome) => void;
  openSkillTree: () => void;
  purchaseUpgrade: (id: UpgradeId) => boolean;
  startRun: () => void;
  resetRun: () => void;
  addRunXp: (amount: number) => void;
  openModuleBay: () => void;
  closeModuleBay: () => void;
  purchaseModule: (id: KernelModuleId) => boolean;
  setWaveIndex: (waveIndex: number) => void;
  setWavePhase: (phase: WavePhase) => void;
  setShowWaveClear: (show: boolean) => void;
  setPrestigeUnlocked: (unlocked: boolean) => void;
}

function persistProgress(
  bankShards: number,
  upgrades: UpgradeLevels,
  prestigeUnlocked: boolean,
  prestigeLevel: number,
): void {
  saveGame({ bankShards, upgrades, prestigeUnlocked, prestigeLevel });
}

function resetRunProgress(): Pick<
  GameStore,
  | 'runLevel'
  | 'runXp'
  | 'runXpToNext'
  | 'runCycles'
  | 'runModuleLevels'
> {
  return {
    runLevel: 1,
    runXp: 0,
    runXpToNext: getXpToNextLevel(1),
    runCycles: 0,
    runModuleLevels: { ...DEFAULT_KERNEL_MODULE_LEVELS },
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: 'MENU',
  breachProgress: 0,
  bankShards: 0,
  runShards: 0,
  lastRunShards: 0,
  upgrades: DEFAULT_UPGRADES,
  prestigeUnlocked: DEFAULT_PRESTIGE.prestigeUnlocked,
  prestigeLevel: DEFAULT_PRESTIGE.prestigeLevel,
  runOutcome: null,
  prestigeUnlockedThisRun: false,
  waveIndex: 0,
  wavePhase: 'idle',
  showWaveClear: false,
  runLevel: 1,
  runXp: 0,
  runXpToNext: getXpToNextLevel(1),
  runCycles: 0,
  runModuleLevels: { ...DEFAULT_KERNEL_MODULE_LEVELS },
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
      const bankShards = state.bankShards + state.runShards;
      persistProgress(bankShards, state.upgrades, state.prestigeUnlocked, state.prestigeLevel);
      return {
        gameState: 'UPGRADING',
        breachProgress: 0,
        runShards: 0,
        bankShards,
        runOutcome: null,
        waveIndex: 0,
        wavePhase: 'idle',
        showWaveClear: false,
        ...resetRunProgress(),
      };
    }),
  addBreachProgress: (delta) =>
    set((state) => {
      const maxBreach = getBreachCap(state.upgrades);
      return {
        breachProgress: Math.min(maxBreach, Math.max(0, state.breachProgress + delta)),
      };
    }),
  addRunShards: (amount) =>
    set((state) => ({
      runShards: state.runShards + amount,
    })),
  endRun: (outcome) =>
    set((state) => {
      const bankShards = state.bankShards + state.runShards;
      const lastRunShards = state.runShards;
      const prestigeUnlockedThisRun =
        outcome === 'victory_boss' && !state.prestigeUnlocked;
      const prestigeUnlocked =
        state.prestigeUnlocked || outcome === 'victory_boss';

      persistProgress(bankShards, state.upgrades, prestigeUnlocked, state.prestigeLevel);

      return {
        bankShards,
        runShards: 0,
        lastRunShards,
        runOutcome: outcome,
        prestigeUnlocked,
        prestigeUnlockedThisRun,
        gameState: 'RUN_END',
      };
    }),
  openSkillTree: () => set({ gameState: 'UPGRADING' }),
  purchaseUpgrade: (id) => {
    const state = get();
    const definition = getUpgradeDefinition(id);
    const skillNode = getSkillNode(id);
    const level = state.upgrades[id];

    if (!isSkillUnlocked(id, state.upgrades, skillNode.requires)) return false;
    if (level >= definition.maxLevel) return false;

    const cost = getUpgradeCost(definition.baseCost, level);
    if (state.bankShards < cost) return false;

    const upgrades = { ...state.upgrades, [id]: level + 1 };
    const bankShards = state.bankShards - cost;
    persistProgress(bankShards, upgrades, state.prestigeUnlocked, state.prestigeLevel);
    set({ bankShards, upgrades });
    return true;
  },
  startRun: () =>
    set({
      gameState: 'PLAYING',
      breachProgress: 0,
      runShards: 0,
      runOutcome: null,
      prestigeUnlockedThisRun: false,
      waveIndex: 1,
      wavePhase: 'spawning',
      showWaveClear: false,
      ...resetRunProgress(),
    }),
  resetRun: () =>
    set((state) => {
      const bankShards = state.bankShards + state.runShards;
      persistProgress(bankShards, state.upgrades, state.prestigeUnlocked, state.prestigeLevel);
      return {
        gameState: 'MENU',
        breachProgress: 0,
        runShards: 0,
        bankShards,
        runOutcome: null,
      };
    }),
  addRunXp: (amount) => {
    const state = get();
    let runXp = state.runXp + amount;
    let runLevel = state.runLevel;
    let runXpToNext = state.runXpToNext;
    let cyclesGained = 0;

    while (runXp >= runXpToNext) {
      runXp -= runXpToNext;
      runLevel += 1;
      runXpToNext = getXpToNextLevel(runLevel);
      cyclesGained += getCyclesForLevelUp(runLevel);
    }

    const runCycles = state.runCycles + cyclesGained;
    set({ runXp, runLevel, runXpToNext, runCycles });

    if (cyclesGained > 0 && get().gameState === 'PLAYING') {
      get().openModuleBay();
    }
  },
  openModuleBay: () => {
    if (get().gameState !== 'PLAYING' && get().gameState !== 'MODULE_BAY') return;
    set({ gameState: 'MODULE_BAY' });
  },
  closeModuleBay: () => {
    if (get().gameState !== 'MODULE_BAY') return;
    set({ gameState: 'PLAYING' });
  },
  purchaseModule: (id) => {
    const state = get();
    if (state.gameState !== 'MODULE_BAY') return false;

    const definition = getKernelModuleDefinition(id);
    const level = state.runModuleLevels[id] ?? 0;
    if (level >= definition.maxLevel) return false;
    if (state.runCycles < definition.cycleCost) return false;

    set({
      runCycles: state.runCycles - definition.cycleCost,
      runModuleLevels: { ...state.runModuleLevels, [id]: level + 1 },
    });
    return true;
  },
  setWaveIndex: (waveIndex) => set({ waveIndex }),
  setWavePhase: (wavePhase) => set({ wavePhase }),
  setShowWaveClear: (showWaveClear) => set({ showWaveClear }),
  setPrestigeUnlocked: (prestigeUnlocked) => {
    const state = get();
    persistProgress(state.bankShards, state.upgrades, prestigeUnlocked, state.prestigeLevel);
    set({ prestigeUnlocked });
  },
}));
