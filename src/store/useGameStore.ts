import { create } from 'zustand';
import { saveGame } from './persistence';
import { DEFAULT_PRESTIGE } from './prestigeTypes';
import {
  DEFAULT_RUN_DRAFT_LEVELS,
  getXpToNextLevel,
  rollDraftOptions,
  type RunDraftId,
  type RunDraftLevels,
  type RunDraftOption,
} from './runDraftCatalog';
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

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'DRAFT' | 'RUN_END' | 'UPGRADING' | 'GAME_OVER';
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
  pendingDraftCount: number;
  draftOptions: RunDraftOption[];
  runDraftLevels: RunDraftLevels;
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
  openDraft: () => void;
  pickDraft: (id: RunDraftId) => void;
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
  pendingDraftCount: 0,
  draftOptions: [],
  runDraftLevels: { ...DEFAULT_RUN_DRAFT_LEVELS },
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
        runLevel: 1,
        runXp: 0,
        runXpToNext: getXpToNextLevel(1),
        pendingDraftCount: 0,
        draftOptions: [],
        runDraftLevels: { ...DEFAULT_RUN_DRAFT_LEVELS },
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
      runLevel: 1,
      runXp: 0,
      runXpToNext: getXpToNextLevel(1),
      pendingDraftCount: 0,
      draftOptions: [],
      runDraftLevels: { ...DEFAULT_RUN_DRAFT_LEVELS },
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
    let pendingDraftCount = state.pendingDraftCount;

    while (runXp >= runXpToNext) {
      runXp -= runXpToNext;
      runLevel += 1;
      runXpToNext = getXpToNextLevel(runLevel);
      pendingDraftCount += 1;
    }

    set({ runXp, runLevel, runXpToNext, pendingDraftCount });

    if (pendingDraftCount > state.pendingDraftCount && get().gameState === 'PLAYING') {
      get().openDraft();
    }
  },
  openDraft: () => {
    const state = get();
    if (state.pendingDraftCount <= 0) return;

    set({
      gameState: 'DRAFT',
      draftOptions: rollDraftOptions(state.runDraftLevels),
    });
  },
  pickDraft: (id) => {
    const state = get();
    const level = (state.runDraftLevels[id] ?? 0) + 1;
    const runDraftLevels = { ...state.runDraftLevels, [id]: level };
    const pendingDraftCount = Math.max(0, state.pendingDraftCount - 1);

    if (pendingDraftCount > 0) {
      set({
        runDraftLevels,
        pendingDraftCount,
        draftOptions: rollDraftOptions(runDraftLevels),
        gameState: 'DRAFT',
      });
      return;
    }

    set({
      runDraftLevels,
      pendingDraftCount: 0,
      draftOptions: [],
      gameState: 'PLAYING',
    });
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
