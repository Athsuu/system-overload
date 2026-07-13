import {
  devRequestWaveJump,
  devSetInvincible,
  devSetShowEnemyHpBars,
  devSetSpeed2x,
  devToggleInvincible,
  devToggleShowEnemyHpBars,
  devToggleSpeed2x,
  devToggleModuleTreeHexGrid,
  isDevInvincible,
  isDevShowEnemyHpBars,
  isDevModuleTreeHexGridVisible,
  isDevSpeed2x,
} from './devFlags';
import { clearSave, saveGame } from '../store/persistence';
import { clearAllPlayerData } from '../store/playerReset';
import {
  clampCycleIndex,
  DEFAULT_CYCLE_PROGRESS,
  MAX_CYCLES,
  sanitizeCyclesCleared,
} from '../store/cycleTypes';
import { clearTutorialProgress } from '../tutorial/tutorialPersistence';
import { clearArchAmbientHeard } from '../tutorial/archAmbientPersistence';
import { clearMeltdownArchRotation } from '../ui/meltdownArchRotation';
import { clearVictoryArchRotation } from '../ui/victoryArchRotation';
import { setTutorialRunSpotlightActive } from '../tutorial/tutorialRunSpotlight';
import { resetTutorialSignals } from '../tutorial/tutorialSignals';
import { useSettingsStore } from '../store/useSettingsStore';
import { DEFAULT_PRESTIGE } from '../store/prestigeTypes';
import {
  DEFAULT_UPGRADES,
  UPGRADE_CATALOG,
  type UpgradeId,
  type UpgradeLevels,
} from '../store/upgradeCatalog';
import { getWaveDefinition, WAVE_DEFINITIONS } from '../game/waveConfig';
import { useGameStore, type GameState } from '../store/useGameStore';

const DEV_MAX_WAVE_INDEX = WAVE_DEFINITIONS[WAVE_DEFINITIONS.length - 1]?.wave ?? 11;

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
  });
}

export {
  devToggleInvincible,
  devSetInvincible,
  isDevInvincible,
  devToggleShowEnemyHpBars,
  devSetShowEnemyHpBars,
  isDevShowEnemyHpBars,
  devToggleSpeed2x,
  devSetSpeed2x,
  isDevSpeed2x,
  devToggleModuleTreeHexGrid,
  isDevModuleTreeHexGridVisible,
};

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
  useGameStore.getState().addRunShards(amount);
}

export function devSetBreachProgress(percent: number): void {
  const breachProgress = Math.min(110, Math.max(0, percent));
  useGameStore.setState({ breachProgress });
}

export function devForceEndBreach(): void {
  const state = useGameStore.getState();
  if (state.gameState !== 'PLAYING') return;
  state.endRun('defeat_breach');
}

export function devForceVictoryBoss(): void {
  const state = useGameStore.getState();
  if (state.gameState !== 'PLAYING') return;
  state.endRun('victory_boss');
}

export function devJumpToWave(waveIndex: number): void {
  const targetWave = Math.max(1, Math.min(DEV_MAX_WAVE_INDEX, Math.floor(waveIndex)));
  if (!getWaveDefinition(targetWave)) return;

  const state = useGameStore.getState();
  if (state.gameState !== 'PLAYING' && state.gameState !== 'PAUSED') {
    state.startRun();
  }
  if (useGameStore.getState().gameState === 'PAUSED') {
    useGameStore.setState({ gameState: 'PLAYING' });
  }

  devRequestWaveJump(targetWave);
}

export function devGetMaxWaveIndex(): number {
  return DEV_MAX_WAVE_INDEX;
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

export function devUnlockCycle(cycle: number): void {
  const state = useGameStore.getState();
  const target = clampCycleIndex(cycle);
  const highestCycleUnlocked = Math.max(state.highestCycleUnlocked, target);
  const selectedCycle = Math.min(state.selectedCycle, highestCycleUnlocked);
  persist({ ...state, highestCycleUnlocked, selectedCycle });
  useGameStore.setState({ highestCycleUnlocked, selectedCycle });
}

export function devClearCycleFlags(): void {
  const state = useGameStore.getState();
  const highestCycleUnlocked = DEFAULT_CYCLE_PROGRESS.highestCycleUnlocked;
  const selectedCycle = DEFAULT_CYCLE_PROGRESS.selectedCycle;
  const cyclesCleared: number[] = [];
  persist({ ...state, highestCycleUnlocked, selectedCycle, cyclesCleared });
  useGameStore.setState({ highestCycleUnlocked, selectedCycle, cyclesCleared });
}

export function devMarkCycleCleared(cycle: number): void {
  const state = useGameStore.getState();
  const target = clampCycleIndex(cycle);
  const cyclesCleared = sanitizeCyclesCleared([...state.cyclesCleared, target]);
  const highestCycleUnlocked = Math.min(MAX_CYCLES, Math.max(state.highestCycleUnlocked, target + 1));
  persist({ ...state, cyclesCleared, highestCycleUnlocked });
  useGameStore.setState({ cyclesCleared, highestCycleUnlocked });
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
    activeCycle: DEFAULT_CYCLE_PROGRESS.selectedCycle,
    runOutcome: null,
    prestigeUnlockedThisRun: false,
    waveIndex: 0,
    wavePhase: 'idle',
    showWaveClear: false,
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

export function devResetArchDialogues(): void {
  clearArchAmbientHeard();
}

export function devResetTutorial(): void {
  // Signals first — if progress is cleared while moduleNodeSelected / upgradePurchased
  // are still true, useTutorialCoach auto-completes and instantly re-dismisses steps.
  resetTutorialSignals();
  clearTutorialProgress();
  clearArchAmbientHeard();
  clearMeltdownArchRotation();
  clearVictoryArchRotation();
  setTutorialRunSpotlightActive(false);

  useSettingsStore.getState().closeSettings();
  if (useGameStore.getState().gameState !== 'MENU') {
    useGameStore.setState({ gameState: 'MENU' });
  }
}
