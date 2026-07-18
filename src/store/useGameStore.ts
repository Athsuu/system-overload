import { create } from 'zustand';
import { saveGame, type SaveData } from './persistence';
import { loadSettings, saveFluxDriveEnabled } from './settingsPersistence';
import { DEFAULT_PRESTIGE, DEFAULT_CORE_PROTOCOLS, type CoreProtocolId } from './prestigeTypes';
import {
  getCoreProtocolCost,
  getCoreProtocolDefinition,
  getCoreProtocolState,
  RESIDUAL_MEMORY_SHARDS_PER_LEVEL,
} from './coreProtocolCatalog';
import {
  canRecompile,
  computeResidualMemoryStartingShards,
  computeSeedFragmentsGain,
} from './prestigeLogic';
import { isFluxDriveUnlocked, isModuleOwnedForAnchor } from './prestigeUnlocks';
import { skipTutorialsAfterRecompile } from './playerReset';
import {
  ANCHOR_SUPERCHARGE_COST,
  BOSS_VICTORY_SHARD_BONUS,
  DEFAULT_UPGRADES,
  getUpgradeCatalogEntry,
  getUpgradeCost,
  getUpgradeLevel,
  isAnchorSuperchargeEligible,
  isModuleUnlocked,
  isUpgradeMaxed,
  type AnchoredNodes,
  type UpgradeId,
  type UpgradeLevels,
} from './upgradeCatalog';
import { ANCHOR_CYCLES_PER_FRAGMENT } from '../game/anchorSupercharge';
import {
  clampCycleIndex,
  DEFAULT_CYCLE_PROGRESS,
  isCycleCleared,
} from './cycleTypes';
import { getBreachCap } from '../game/runConfig';
import { resetRunElapsedMs } from '../game/runElapsed';
import { getModuleNode } from './moduleTree';
import {
  DEFAULT_BEST_KILLS_BY_CYCLE,
  mergeBestKillsRecord,
  type BestKillsByCycle,
} from './killProgress';
import { markTutorialSignal } from '../tutorial/tutorialSignals';
import { clearRunArchAmbientHeard } from '../tutorial/archAmbientPersistence';
import { resetRunKills } from '../game/horde/killCounter';
import { resetRunOverloadTelemetry } from '../game/runOverloadTelemetry';

export type GameState =
  | 'MAIN_MENU'
  | 'MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'RUN_END'
  | 'UPGRADING'
  | 'SEED_PROTOCOLS'
  | 'GAME_OVER';
export type RunOutcome = 'victory_boss' | 'defeat_breach';
export type RunPhase = 'idle' | 'horde' | 'boss';

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
  seedFragments: number;
  recompileDepth: number;
  coreProtocols: typeof DEFAULT_CORE_PROTOCOLS;
  prestigeUnlocked: boolean;
  prestigeLevel: number;
  highestCycleUnlocked: number;
  selectedCycle: number;
  cyclesCleared: number[];
  cyclesSinceLastAnchor: number;
  anchoredNodes: AnchoredNodes;
  bestKillsByCycle: BestKillsByCycle;
  activeCycle: number;
  runOutcome: RunOutcome | null;
  prestigeUnlockedThisRun: boolean;
  runKills: number;
  runPhase: RunPhase;
  fluxDriveEnabled: boolean;
  seedProtocolsReturnState: Extract<GameState, 'MENU' | 'UPGRADING'>;
  setGameState: (state: GameState) => void;
  pauseRun: () => void;
  resumeRun: () => void;
  abortRun: () => void;
  togglePause: () => void;
  addBreachProgress: (delta: number) => void;
  addRunShards: (amount: number) => void;
  endRun: (outcome: RunOutcome) => void;
  openModuleTree: () => void;
  openSeedProtocols: () => void;
  closeSeedProtocols: () => void;
  purchaseUpgrade: (id: UpgradeId) => boolean;
  purchaseAnchorSupercharge: (id: UpgradeId) => boolean;
  toggleAnchorSupercharge: (id: UpgradeId) => void;
  purchaseCoreProtocol: (id: CoreProtocolId) => boolean;
  recompile: () => boolean;
  startRun: (cycle?: number) => void;
  setSelectedCycle: (cycle: number) => void;
  toggleFluxDriveEnabled: () => void;
  setRunKills: (kills: number) => void;
  setRunPhase: (phase: RunPhase) => void;
  persistProgressSnapshot: () => void;
  returnToMainMenu: () => void;
}

function buildSaveSnapshot(state: {
  bankShards: number;
  bankAnchorFragments: number;
  upgrades: UpgradeLevels;
  seedFragments: number;
  recompileDepth: number;
  coreProtocols: typeof DEFAULT_CORE_PROTOCOLS;
  prestigeUnlocked: boolean;
  prestigeLevel: number;
  highestCycleUnlocked: number;
  selectedCycle: number;
  cyclesCleared: number[];
  cyclesSinceLastAnchor: number;
  anchoredNodes: AnchoredNodes;
  bestKillsByCycle: BestKillsByCycle;
}): SaveData {
  return {
    bankShards: state.bankShards,
    bankAnchorFragments: state.bankAnchorFragments,
    upgrades: state.upgrades,
    seedFragments: state.seedFragments,
    recompileDepth: state.recompileDepth,
    coreProtocols: state.coreProtocols,
    prestigeUnlocked: state.recompileDepth > 0,
    prestigeLevel: state.recompileDepth,
    highestCycleUnlocked: state.highestCycleUnlocked,
    selectedCycle: state.selectedCycle,
    cyclesCleared: state.cyclesCleared,
    cyclesSinceLastAnchor: state.cyclesSinceLastAnchor,
    anchoredNodes: state.anchoredNodes,
    bestKillsByCycle: state.bestKillsByCycle,
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
  seedFragments: DEFAULT_PRESTIGE.seedFragments,
  recompileDepth: DEFAULT_PRESTIGE.recompileDepth,
  coreProtocols: { ...DEFAULT_CORE_PROTOCOLS },
  prestigeUnlocked: DEFAULT_PRESTIGE.prestigeUnlocked,
  prestigeLevel: DEFAULT_PRESTIGE.prestigeLevel,
  highestCycleUnlocked: DEFAULT_CYCLE_PROGRESS.highestCycleUnlocked,
  selectedCycle: DEFAULT_CYCLE_PROGRESS.selectedCycle,
  cyclesCleared: [...DEFAULT_CYCLE_PROGRESS.cyclesCleared],
  cyclesSinceLastAnchor: 0,
  anchoredNodes: {},
  bestKillsByCycle: { ...DEFAULT_BEST_KILLS_BY_CYCLE },
  activeCycle: DEFAULT_CYCLE_PROGRESS.selectedCycle,
  runOutcome: null,
  prestigeUnlockedThisRun: false,
  seedProtocolsReturnState: 'MENU',
  runKills: 0,
  runPhase: 'idle',
  fluxDriveEnabled: persistedSettings.fluxDriveEnabled,
  setGameState: (gameState) => set({ gameState }),
  pauseRun: () => {
    if (get().gameState !== 'PLAYING') return;
    set((state) => {
      const bestKillsByCycle = mergeBestKillsRecord(
        state.bestKillsByCycle,
        state.activeCycle,
        state.runKills,
      );
      const next = { ...state, gameState: 'PAUSED' as const, bestKillsByCycle };
      persistProgress(next);
      return { gameState: 'PAUSED' as const, bestKillsByCycle };
    });
  },
  resumeRun: () => {
    if (get().gameState !== 'PAUSED') return;
    set({ gameState: 'PLAYING' });
  },
  togglePause: () => {
    const state = get();
    if (state.gameState === 'PLAYING') {
      get().pauseRun();
      return;
    }
    if (state.gameState === 'PAUSED') {
      set({ gameState: 'PLAYING' });
    }
  },
  abortRun: () =>
    set((state) => {
      const bestKillsByCycle = mergeBestKillsRecord(
        state.bestKillsByCycle,
        state.activeCycle,
        state.runKills,
      );
      persistProgress({ ...state, bestKillsByCycle });
      return {
        gameState: 'UPGRADING',
        breachProgress: 0,
        runShards: 0,
        runOutcome: null,
        runKills: 0,
        runPhase: 'idle',
        anchorFragmentEarnedThisRun: false,
        activeCycle: state.selectedCycle,
        bestKillsByCycle,
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
      const victoryBonus = outcome === 'victory_boss' ? BOSS_VICTORY_SHARD_BONUS : 0;
      const bankShards = state.bankShards + victoryBonus;
      const lastRunShards = state.runShards + victoryBonus;

      const firstClearThisCycle =
        outcome === 'victory_boss' && !isCycleCleared(state.cyclesCleared, state.activeCycle);

      let cyclesSinceLastAnchor = state.cyclesSinceLastAnchor;
      let anchorGain = 0;
      if (firstClearThisCycle) {
        cyclesSinceLastAnchor += 1;
        if (cyclesSinceLastAnchor >= ANCHOR_CYCLES_PER_FRAGMENT) {
          anchorGain = 1;
          cyclesSinceLastAnchor = 0;
        }
      }
      const bankAnchorFragments = state.bankAnchorFragments + anchorGain;

      let cyclesCleared = state.cyclesCleared;
      let highestCycleUnlocked = state.highestCycleUnlocked;
      if (outcome === 'victory_boss' && firstClearThisCycle) {
        cyclesCleared = [...cyclesCleared, state.activeCycle].sort((a, b) => a - b);
        highestCycleUnlocked = state.activeCycle + 1;
      }

      const selectedCycle = Math.min(state.selectedCycle, highestCycleUnlocked);
      const bestKillsByCycle = mergeBestKillsRecord(
        state.bestKillsByCycle,
        state.activeCycle,
        state.runKills,
      );

      const next = {
        ...state,
        bankShards,
        bankAnchorFragments,
        cyclesCleared,
        cyclesSinceLastAnchor,
        highestCycleUnlocked,
        selectedCycle,
        bestKillsByCycle,
      };
      persistProgress(next);

      return {
        bankShards,
        bankAnchorFragments,
        cyclesCleared,
        cyclesSinceLastAnchor,
        highestCycleUnlocked,
        selectedCycle,
        bestKillsByCycle,
        runShards: 0,
        lastRunShards,
        lastRunAnchorFragments: anchorGain,
        anchorFragmentEarnedThisRun: anchorGain > 0,
        runOutcome: outcome,
        gameState: 'RUN_END' as const,
      };
    }),
  openModuleTree: () => set({ gameState: 'UPGRADING' }),
  openSeedProtocols: () =>
    set((state) => ({
      gameState: 'SEED_PROTOCOLS',
      seedProtocolsReturnState:
        state.gameState === 'MENU' || state.gameState === 'UPGRADING'
          ? state.gameState
          : state.seedProtocolsReturnState,
    })),
  closeSeedProtocols: () =>
    set((state) => ({ gameState: state.seedProtocolsReturnState })),
  purchaseUpgrade: (id) => {
    const state = get();
    const entry = getUpgradeCatalogEntry(id);
    if (!entry) return false;

    const moduleNode = getModuleNode(id);
    const level = getUpgradeLevel(state.upgrades, id);

    if (!isModuleUnlocked(id, state.upgrades, moduleNode.requires)) return false;
    if (isUpgradeMaxed(entry, level)) return false;

    const cost = getUpgradeCost(entry, level);
    if (cost <= 0) return false;
    const currency = entry.currency;

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
  purchaseAnchorSupercharge: (id) => {
    const state = get();
    if (!isAnchorSuperchargeEligible(id)) return false;
    if (!isModuleOwnedForAnchor(id, state.upgrades, state.coreProtocols)) return false;
    if (state.anchoredNodes[id] !== undefined) return false;
    if (state.bankAnchorFragments < ANCHOR_SUPERCHARGE_COST) return false;

    const bankAnchorFragments = state.bankAnchorFragments - ANCHOR_SUPERCHARGE_COST;
    const anchoredNodes = { ...state.anchoredNodes, [id]: true };
    persistProgress({ ...state, bankAnchorFragments, anchoredNodes });
    set({ bankAnchorFragments, anchoredNodes });
    return true;
  },
  toggleAnchorSupercharge: (id) => {
    const state = get();
    if (state.anchoredNodes[id] === undefined) return;
    const anchoredNodes = { ...state.anchoredNodes, [id]: !state.anchoredNodes[id] };
    persistProgress({ ...state, anchoredNodes });
    set({ anchoredNodes });
  },
  purchaseCoreProtocol: (id) => {
    const state = get();
    const definition = getCoreProtocolDefinition(id);
    const level = state.coreProtocols[id];

    const protocolState = getCoreProtocolState(id, state.seedFragments, state.coreProtocols);
    if (protocolState !== 'available') return false;

    const cost = getCoreProtocolCost(definition, level);
    const seedFragments = state.seedFragments - cost;
    const coreProtocols = { ...state.coreProtocols, [id]: level + 1 };
    // Mémoire résiduelle : +200 tout de suite (sinon l’achat post-Recompile n’aide qu’au suivant).
    const bankShards =
      id === 'residualMemory'
        ? state.bankShards + RESIDUAL_MEMORY_SHARDS_PER_LEVEL
        : state.bankShards;
    persistProgress({ ...state, seedFragments, coreProtocols, bankShards });
    set({ seedFragments, coreProtocols, bankShards });
    return true;
  },
  recompile: () => {
    const state = get();
    if (!canRecompile(state.cyclesCleared)) return false;

    const fragmentsGain = computeSeedFragmentsGain(state.cyclesCleared, state.coreProtocols);
    const startingShards = computeResidualMemoryStartingShards(state.coreProtocols);
    const seedFragments = state.seedFragments + fragmentsGain;
    const recompileDepth = state.recompileDepth + 1;
    const upgrades = { ...DEFAULT_UPGRADES, node0Boot: 1 };
    const bankShards = startingShards;
    const bankAnchorFragments = 0;
    const highestCycleUnlocked = DEFAULT_CYCLE_PROGRESS.highestCycleUnlocked;
    const selectedCycle = DEFAULT_CYCLE_PROGRESS.selectedCycle;
    const cyclesCleared = [...DEFAULT_CYCLE_PROGRESS.cyclesCleared];
    const cyclesSinceLastAnchor = 0;
    const anchoredNodes: AnchoredNodes = {};

    skipTutorialsAfterRecompile();

    const next = {
      ...state,
      bankShards,
      bankAnchorFragments,
      upgrades,
      seedFragments,
      recompileDepth,
      highestCycleUnlocked,
      selectedCycle,
      cyclesCleared,
      cyclesSinceLastAnchor,
      anchoredNodes,
      prestigeUnlocked: recompileDepth > 0,
      prestigeLevel: recompileDepth,
    };
    persistProgress(next);

    set({
      bankShards,
      bankAnchorFragments,
      upgrades,
      seedFragments,
      recompileDepth,
      prestigeUnlocked: recompileDepth > 0,
      prestigeLevel: recompileDepth,
      highestCycleUnlocked,
      selectedCycle,
      cyclesCleared,
      cyclesSinceLastAnchor,
      anchoredNodes,
      activeCycle: selectedCycle,
      gameState: 'SEED_PROTOCOLS',
      seedProtocolsReturnState: 'UPGRADING',
    });
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
    resetRunElapsedMs();
    resetRunKills();
    resetRunOverloadTelemetry();
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
      runKills: 0,
      runPhase: 'horde',
    });
  },
  toggleFluxDriveEnabled: () => {
    const state = get();
    if (!isFluxDriveUnlocked(state.coreProtocols)) return;
    const fluxDriveEnabled = !state.fluxDriveEnabled;
    saveFluxDriveEnabled(fluxDriveEnabled);
    markTutorialSignal('fluxDriveToggled');
    set({ fluxDriveEnabled });
  },
  setRunKills: (kills) =>
    set({ runKills: Math.max(0, Math.floor(kills)) }),
  setRunPhase: (runPhase) => set({ runPhase }),
  persistProgressSnapshot: () => {
    const state = get();
    const bestKillsByCycle = mergeBestKillsRecord(
      state.bestKillsByCycle,
      state.activeCycle,
      state.runKills,
    );
    if (bestKillsByCycle !== state.bestKillsByCycle) {
      set({ bestKillsByCycle });
      persistProgress({ ...state, bestKillsByCycle });
      return;
    }
    persistProgress(state);
  },
  returnToMainMenu: () => {
    const state = get();
    const bestKillsByCycle = mergeBestKillsRecord(
      state.bestKillsByCycle,
      state.activeCycle,
      state.runKills,
    );
    persistProgress({ ...state, bestKillsByCycle });
    set({
      gameState: 'MAIN_MENU',
      breachProgress: 0,
      runShards: 0,
      lastRunShards: 0,
      lastRunAnchorFragments: 0,
      runOutcome: null,
      prestigeUnlockedThisRun: false,
      anchorFragmentEarnedThisRun: false,
      runKills: 0,
      runPhase: 'idle',
      activeCycle: state.selectedCycle,
      bestKillsByCycle,
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
    seedFragments: DEFAULT_PRESTIGE.seedFragments,
    recompileDepth: DEFAULT_PRESTIGE.recompileDepth,
    coreProtocols: { ...DEFAULT_CORE_PROTOCOLS },
    prestigeUnlocked: DEFAULT_PRESTIGE.prestigeUnlocked,
    prestigeLevel: DEFAULT_PRESTIGE.prestigeLevel,
    highestCycleUnlocked: DEFAULT_CYCLE_PROGRESS.highestCycleUnlocked,
    selectedCycle: DEFAULT_CYCLE_PROGRESS.selectedCycle,
    cyclesCleared: [...DEFAULT_CYCLE_PROGRESS.cyclesCleared],
    cyclesSinceLastAnchor: 0,
    anchoredNodes: {},
    bestKillsByCycle: { ...DEFAULT_BEST_KILLS_BY_CYCLE },
    activeCycle: DEFAULT_CYCLE_PROGRESS.selectedCycle,
    runOutcome: null,
    prestigeUnlockedThisRun: false,
    runKills: 0,
    runPhase: 'idle',
    fluxDriveEnabled: settings.fluxDriveEnabled,
  });
  useGameStore.getState().persistProgressSnapshot();
}

export function persistCurrentProgress(): void {
  useGameStore.getState().persistProgressSnapshot();
}
