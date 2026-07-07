import { create } from 'zustand';
import { saveGame } from './persistence';
import { loadSettings, saveFluxDriveEnabled } from './settingsPersistence';
import { DEFAULT_PRESTIGE } from './prestigeTypes';
import {
  ANCHOR_FRAGMENTS_PER_BOSS,
  BOSS_VICTORY_SHARD_BONUS,
  DEFAULT_UPGRADES,
  getUpgradeCost,
  getUpgradeCurrency,
  getUpgradeDefinition,
  isSkillUnlocked,
  type UpgradeId,
  type UpgradeLevels,
} from './upgradeCatalog';
import { getBreachCap } from '../game/runConfig';
import { getSkillNode } from './skillTree';
import { markTutorialSignal } from '../tutorial/tutorialSignals';

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
  openSkillTree: () => void;
  purchaseUpgrade: (id: UpgradeId) => boolean;
  startRun: () => void;
  toggleFluxDriveEnabled: () => void;
  setWaveIndex: (waveIndex: number) => void;
  setWavePhase: (phase: WavePhase) => void;
  setShowWaveClear: (show: boolean) => void;
  persistProgressSnapshot: () => void;
  returnToMainMenu: () => void;
}

function persistProgress(
  bankShards: number,
  bankAnchorFragments: number,
  upgrades: UpgradeLevels,
  prestigeUnlocked: boolean,
  prestigeLevel: number,
): void {
  saveGame({ bankShards, bankAnchorFragments, upgrades, prestigeUnlocked, prestigeLevel });
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
      const bankShards = state.bankShards + state.runShards;
      persistProgress(
        bankShards,
        state.bankAnchorFragments,
        state.upgrades,
        state.prestigeUnlocked,
        state.prestigeLevel,
      );
      return {
        gameState: 'UPGRADING',
        breachProgress: 0,
        runShards: 0,
        bankShards,
        runOutcome: null,
        waveIndex: 0,
        wavePhase: 'idle',
        showWaveClear: false,
        anchorFragmentEarnedThisRun: false,
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
      const bossBonus = outcome === 'victory_boss' ? BOSS_VICTORY_SHARD_BONUS : 0;
      const bankShards = state.bankShards + state.runShards + bossBonus;
      const lastRunShards = state.runShards + bossBonus;
      const anchorGain = outcome === 'victory_boss' ? ANCHOR_FRAGMENTS_PER_BOSS : 0;
      const bankAnchorFragments = state.bankAnchorFragments + anchorGain;
      const prestigeUnlockedThisRun =
        outcome === 'victory_boss' && !state.prestigeUnlocked;
      const prestigeUnlocked =
        state.prestigeUnlocked || outcome === 'victory_boss';

      persistProgress(
        bankShards,
        bankAnchorFragments,
        state.upgrades,
        prestigeUnlocked,
        state.prestigeLevel,
      );

      return {
        bankShards,
        bankAnchorFragments,
        runShards: 0,
        lastRunShards,
        lastRunAnchorFragments: anchorGain,
        anchorFragmentEarnedThisRun: anchorGain > 0,
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

    const cost = getUpgradeCost(definition, level);
    const currency = getUpgradeCurrency(id);

    if (currency === 'anchor') {
      if (state.bankAnchorFragments < cost) return false;
      const bankAnchorFragments = state.bankAnchorFragments - cost;
      const upgrades = { ...state.upgrades, [id]: level + 1 };
      persistProgress(
        state.bankShards,
        bankAnchorFragments,
        upgrades,
        state.prestigeUnlocked,
        state.prestigeLevel,
      );
      markTutorialSignal('upgradePurchased');
      set({ bankAnchorFragments, upgrades });
      return true;
    }

    if (state.bankShards < cost) return false;

    const upgrades = { ...state.upgrades, [id]: level + 1 };
    const bankShards = state.bankShards - cost;
    persistProgress(
      bankShards,
      state.bankAnchorFragments,
      upgrades,
      state.prestigeUnlocked,
      state.prestigeLevel,
    );
    markTutorialSignal('upgradePurchased');
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
      anchorFragmentEarnedThisRun: false,
      waveIndex: 1,
      wavePhase: 'spawning',
      showWaveClear: false,
    }),
  toggleFluxDriveEnabled: () =>
    set((state) => {
      if (state.upgrades.fluxDrive <= 0) return state;
      const fluxDriveEnabled = !state.fluxDriveEnabled;
      saveFluxDriveEnabled(fluxDriveEnabled);
      markTutorialSignal('fluxDriveToggled');
      return { fluxDriveEnabled };
    }),
  setWaveIndex: (waveIndex) => set({ waveIndex }),
  setWavePhase: (wavePhase) => set({ wavePhase }),
  setShowWaveClear: (showWaveClear) => set({ showWaveClear }),
  persistProgressSnapshot: () => {
    const state = get();
    persistProgress(
      state.bankShards,
      state.bankAnchorFragments,
      state.upgrades,
      state.prestigeUnlocked,
      state.prestigeLevel,
    );
  },
  returnToMainMenu: () => {
    const state = get();
    const inRun = state.gameState === 'PLAYING' || state.gameState === 'PAUSED';
    const bankShards = inRun ? state.bankShards + state.runShards : state.bankShards;

    persistProgress(
      bankShards,
      state.bankAnchorFragments,
      state.upgrades,
      state.prestigeUnlocked,
      state.prestigeLevel,
    );

    set({
      gameState: 'MAIN_MENU',
      bankShards,
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
