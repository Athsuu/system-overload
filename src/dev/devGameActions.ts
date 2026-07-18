import { clearSave, saveGame } from '../store/persistence';
import { clearAllPlayerData } from '../store/playerReset';
import {
  clampCycleIndex,
  DEFAULT_CYCLE_PROGRESS,
  sanitizeCyclesCleared,
} from '../store/cycleTypes';
import { DEFAULT_PRESTIGE } from '../store/prestigeTypes';
import {
  clampUpgradeLevel,
  DEFAULT_UPGRADES,
  UPGRADE_CATALOG,
  type UpgradeId,
  type UpgradeLevels,
} from '../store/upgradeCatalog';
import { useGameStore } from '../store/useGameStore';

function persist(state: ReturnType<typeof useGameStore.getState>): void {
  saveGame({
    bankShards: state.bankShards,
    bankAnchorFragments: state.bankAnchorFragments,
    upgrades: state.upgrades,
    seedFragments: state.seedFragments,
    recompileDepth: state.recompileDepth,
    coreProtocols: state.coreProtocols,
    prestigeUnlocked: state.prestigeUnlocked,
    prestigeLevel: state.prestigeLevel,
    highestCycleUnlocked: state.highestCycleUnlocked,
    selectedCycle: state.selectedCycle,
    cyclesCleared: state.cyclesCleared,
    cyclesSinceLastAnchor: state.cyclesSinceLastAnchor,
    anchoredNodes: state.anchoredNodes,
    bestKillsByCycle: state.bestKillsByCycle,
  });
}

export function devAddBankShards(amount: number): void {
  const state = useGameStore.getState();
  const bankShards = state.bankShards + amount;
  persist({ ...state, bankShards });
  useGameStore.setState({ bankShards });
}

export function devAddBankAnchorFragments(amount: number): void {
  const state = useGameStore.getState();
  const bankAnchorFragments = Math.max(0, state.bankAnchorFragments + amount);
  persist({ ...state, bankAnchorFragments });
  useGameStore.setState({ bankAnchorFragments });
}

export function devAddSeedFragments(amount: number): void {
  const state = useGameStore.getState();
  const seedFragments = Math.max(0, state.seedFragments + amount);
  persist({ ...state, seedFragments });
  useGameStore.setState({ seedFragments });
}

export function devTogglePrestigeUnlocked(): void {
  const state = useGameStore.getState();
  const prestigeUnlocked = !state.prestigeUnlocked;
  persist({ ...state, prestigeUnlocked });
  useGameStore.setState({ prestigeUnlocked });
}

/** Dev "Max" jumps to this level for Soft Cap (uncapped) modules instead of literal Infinity. */
export const DEV_UNCAPPED_PREVIEW_LEVEL = 20;

export function devMaxAllUpgrades(): void {
  const state = useGameStore.getState();
  const upgrades = { ...DEFAULT_UPGRADES } as UpgradeLevels;

  for (const definition of UPGRADE_CATALOG) {
    upgrades[definition.id] = Number.isFinite(definition.maxLevel)
      ? definition.maxLevel
      : DEV_UNCAPPED_PREVIEW_LEVEL;
  }

  persist({ ...state, upgrades });
  useGameStore.setState({ upgrades });
}

export function devResetUpgrades(): void {
  const state = useGameStore.getState();
  persist({ ...state, upgrades: DEFAULT_UPGRADES });
  useGameStore.setState({ upgrades: { ...DEFAULT_UPGRADES } });
}

export function devSetUpgradeLevel(id: UpgradeId, level: number): void {
  const definition = UPGRADE_CATALOG.find((entry) => entry.id === id);
  if (!definition) return;

  const state = useGameStore.getState();
  const clampedLevel = clampUpgradeLevel(id, level);
  const upgrades = { ...state.upgrades, [id]: clampedLevel };
  persist({ ...state, upgrades });
  useGameStore.setState({ upgrades });
}

function devMarkCycleCleared(cycle: number): void {
  const state = useGameStore.getState();
  const target = clampCycleIndex(cycle);
  const cyclesCleared = sanitizeCyclesCleared([...state.cyclesCleared, target]);
  const highestCycleUnlocked = Math.max(state.highestCycleUnlocked, target + 1);
  persist({ ...state, cyclesCleared, highestCycleUnlocked });
  useGameStore.setState({ cyclesCleared, highestCycleUnlocked });
}

/** Itère et marque comme complétés (cyclesCleared) tous les cycles de 1 à target inclus. */
export function devUnlockCyclesUpTo(target: number): void {
  const boundedTarget = Math.max(1, Math.floor(target));
  for (let cycle = 1; cycle <= boundedTarget; cycle += 1) {
    devMarkCycleCleared(cycle);
  }
}

export function devWipeProgress(): void {
  clearSave();
  useGameStore.setState({
    gameState: 'MENU',
    breachProgress: 0,
    bankShards: 0,
    runShards: 0,
    lastRunShards: 0,
    upgrades: { ...DEFAULT_UPGRADES },
    seedFragments: DEFAULT_PRESTIGE.seedFragments,
    recompileDepth: DEFAULT_PRESTIGE.recompileDepth,
    coreProtocols: { ...DEFAULT_PRESTIGE.coreProtocols },
    prestigeUnlocked: DEFAULT_PRESTIGE.prestigeUnlocked,
    prestigeLevel: DEFAULT_PRESTIGE.prestigeLevel,
    highestCycleUnlocked: DEFAULT_CYCLE_PROGRESS.highestCycleUnlocked,
    selectedCycle: DEFAULT_CYCLE_PROGRESS.selectedCycle,
    cyclesCleared: [...DEFAULT_CYCLE_PROGRESS.cyclesCleared],
    bestKillsByCycle: {},
    activeCycle: DEFAULT_CYCLE_PROGRESS.selectedCycle,
    runOutcome: null,
    prestigeUnlockedThisRun: false,
    runKills: 0,
    runPhase: 'idle',
  });
}

export function devResetToNewPlayer(): void {
  const confirmed = window.confirm(
    'Effacer toute la progression et les réglages ?\n\n' +
      'Comme une première ouverture du jeu : 0 Shards, module tree vide, audio à 50 %.',
  );
  if (!confirmed) return;

  clearAllPlayerData();
  window.location.reload();
}
