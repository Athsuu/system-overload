import { clearSave, saveGame } from '../store/persistence';
import { DEFAULT_PRESTIGE } from '../store/prestigeTypes';
import {
  DEFAULT_KERNEL_MODULE_LEVELS,
  KERNEL_MODULE_CATALOG,
  type KernelModuleId,
} from '../store/kernelModuleCatalog';
import {
  DEFAULT_UPGRADES,
  UPGRADE_CATALOG,
  type UpgradeId,
  type UpgradeLevels,
} from '../store/upgradeCatalog';
import { useGameStore, type GameState } from '../store/useGameStore';

function persist(state: ReturnType<typeof useGameStore.getState>): void {
  saveGame({
    bankShards: state.bankShards,
    upgrades: state.upgrades,
    prestigeUnlocked: state.prestigeUnlocked,
    prestigeLevel: state.prestigeLevel,
  });
}

export function devAddBankShards(amount: number): void {
  const state = useGameStore.getState();
  const bankShards = state.bankShards + amount;
  persist({ ...state, bankShards });
  useGameStore.setState({ bankShards });
}

export function devSetBankShards(amount: number): void {
  const state = useGameStore.getState();
  const bankShards = Math.max(0, amount);
  persist({ ...state, bankShards });
  useGameStore.setState({ bankShards });
}

export function devAddRunShards(amount: number): void {
  const state = useGameStore.getState();
  useGameStore.setState({ runShards: state.runShards + amount });
}

export function devSetBreachProgress(percent: number): void {
  const breachProgress = Math.min(110, Math.max(0, percent));
  useGameStore.setState({ breachProgress });
}

export function devForceEndBreach(): void {
  const state = useGameStore.getState();
  if (state.gameState !== 'PLAYING' && state.gameState !== 'MODULE_BAY') return;
  state.endRun('defeat_breach');
}

export function devForceVictoryBoss(): void {
  const state = useGameStore.getState();
  if (state.gameState !== 'PLAYING' && state.gameState !== 'MODULE_BAY') return;
  state.endRun('victory_boss');
}

export function devSetGameState(gameState: GameState): void {
  useGameStore.setState({ gameState });
}

export function devTogglePrestigeUnlocked(): void {
  const state = useGameStore.getState();
  const prestigeUnlocked = !state.prestigeUnlocked;
  persist({ ...state, prestigeUnlocked });
  useGameStore.setState({ prestigeUnlocked });
}

export function devMaxAllUpgrades(): void {
  const state = useGameStore.getState();
  const upgrades = { ...DEFAULT_UPGRADES } as UpgradeLevels;

  for (const definition of UPGRADE_CATALOG) {
    upgrades[definition.id] = definition.maxLevel;
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
  const clampedLevel = Math.max(0, Math.min(definition.maxLevel, Math.floor(level)));
  const upgrades = { ...state.upgrades, [id]: clampedLevel };
  persist({ ...state, upgrades });
  useGameStore.setState({ upgrades });
}

export function devSetModuleLevel(id: KernelModuleId, level: number): void {
  const definition = KERNEL_MODULE_CATALOG.find((entry) => entry.id === id);
  if (!definition) return;

  const state = useGameStore.getState();
  const clampedLevel = Math.max(0, Math.min(definition.maxLevel, Math.floor(level)));
  const runModuleLevels = { ...state.runModuleLevels };

  if (clampedLevel === 0) {
    delete runModuleLevels[id];
  } else {
    runModuleLevels[id] = clampedLevel;
  }

  useGameStore.setState({ runModuleLevels });
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
    prestigeUnlocked: DEFAULT_PRESTIGE.prestigeUnlocked,
    prestigeLevel: DEFAULT_PRESTIGE.prestigeLevel,
    runOutcome: null,
    prestigeUnlockedThisRun: false,
    runModuleLevels: { ...DEFAULT_KERNEL_MODULE_LEVELS },
  });
}
