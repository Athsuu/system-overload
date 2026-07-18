import { DEFAULT_PRESTIGE, type CoreProtocolLevels } from './prestigeTypes';
import { sanitizeCoreProtocols } from './coreProtocolCatalog';
import {
  DEFAULT_CYCLE_PROGRESS,
  sanitizeCyclesCleared,
  clampCycleIndex,
} from './cycleTypes';
import {
  migrateBestWaveToKills,
  sanitizeBestKillsByCycle,
  type BestKillsByCycle,
} from './killProgress';
import {
  DEFAULT_UPGRADES,
  UPGRADE_CATALOG,
  sanitizeUpgradeLevels,
  type AnchoredNodes,
  type UpgradeId,
  type UpgradeLevels,
} from './upgradeCatalog';

const SAVE_KEY = 'system-overload-save';

export interface SaveData {
  bankShards: number;
  bankAnchorFragments: number;
  upgrades: UpgradeLevels;
  seedFragments: number;
  recompileDepth: number;
  coreProtocols: CoreProtocolLevels;
  /** @deprecated legacy — migrated to recompileDepth */
  prestigeUnlocked: boolean;
  /** @deprecated legacy — migrated to recompileDepth */
  prestigeLevel: number;
  highestCycleUnlocked: number;
  selectedCycle: number;
  cyclesCleared: number[];
  cyclesSinceLastAnchor: number;
  anchoredNodes: AnchoredNodes;
  /** Meilleur score de kills par cycle — persisté pour équilibrage / snapshot dev. */
  bestKillsByCycle: BestKillsByCycle;
  economyV2?: boolean;
  moduleTreeV3?: boolean;
  economyV4?: boolean;
  moduleTreeV4?: boolean;
  /** Migration scaling ennemi continu + retrait modules elite. */
  enemyScalingV1?: boolean;
  /** Migration Overclock / Flux Drive → Protocoles de la Graine. */
  prestigeToolsV1?: boolean;
}

interface LegacySaveData {
  bankShards?: number;
  bankAnchorFragments?: number;
  bankTflops?: number;
  upgrades?: Partial<UpgradeLevels>;
  seedFragments?: number;
  recompileDepth?: number;
  coreProtocols?: Partial<CoreProtocolLevels>;
  prestigeUnlocked?: boolean;
  prestigeLevel?: number;
  highestCycleUnlocked?: number;
  selectedCycle?: number;
  cyclesCleared?: unknown;
  cyclesSinceLastAnchor?: number;
  anchoredNodes?: Partial<Record<string, boolean>>;
  bestKillsByCycle?: unknown;
  /** @deprecated migrated to bestKillsByCycle */
  bestWaveByCycle?: unknown;
  economyV2?: boolean;
  moduleTreeV3?: boolean;
  /** @deprecated legacy key — migrated to moduleTreeV3 */
  skillTreeV3?: boolean;
  economyV4?: boolean;
  moduleTreeV4?: boolean;
  /** @deprecated legacy key — migrated to moduleTreeV4 */
  skillTreeV4?: boolean;
  enemyScalingV1?: boolean;
  prestigeToolsV1?: boolean;
}

function sanitizeAnchoredNodes(raw: LegacySaveData['anchoredNodes']): AnchoredNodes {
  const anchoredNodes: AnchoredNodes = {};
  if (!raw) return anchoredNodes;

  for (const definition of UPGRADE_CATALOG) {
    const value = raw[definition.id];
    if (typeof value === 'boolean') {
      anchoredNodes[definition.id as UpgradeId] = value;
    }
  }

  for (const id of ['overclock', 'fluxDrive'] as const) {
    const value = raw[id];
    if (typeof value === 'boolean') {
      anchoredNodes[id] = value;
    }
  }

  return anchoredNodes;
}

function readBankShards(parsed: LegacySaveData): number | null {
  if (typeof parsed.bankShards === 'number') {
    return Math.max(0, parsed.bankShards);
  }
  if (typeof parsed.bankTflops === 'number') {
    return Math.max(0, parsed.bankTflops);
  }
  return null;
}

function migrateEconomyV2(bankShards: number, parsed: LegacySaveData): number {
  if (parsed.economyV2) return bankShards;
  return Math.floor(bankShards / 5);
}

function sanitizeUpgrades(raw: LegacySaveData['upgrades']): UpgradeLevels {
  return sanitizeUpgradeLevels(raw ?? undefined);
}

function hasModuleTreeV3(parsed: LegacySaveData): boolean {
  return Boolean(parsed.moduleTreeV3 ?? parsed.skillTreeV3);
}

function hasModuleTreeV4(parsed: LegacySaveData): boolean {
  return Boolean(parsed.moduleTreeV4 ?? parsed.skillTreeV4);
}

function migrateModuleTreeV3(parsed: LegacySaveData): UpgradeLevels {
  if (hasModuleTreeV3(parsed)) {
    return sanitizeUpgrades(parsed.upgrades);
  }
  return { ...DEFAULT_UPGRADES };
}

function migrateLegacyNode0Boot(upgrades: UpgradeLevels, raw: LegacySaveData['upgrades']): UpgradeLevels {
  if (!raw) return upgrades;
  const legacyBoot = (raw as { kernelBoot?: number }).kernelBoot;
  if (typeof legacyBoot !== 'number') return upgrades;
  const migrated = Math.max(0, Math.min(1, Math.floor(legacyBoot)));
  if (migrated > upgrades.node0Boot) {
    return { ...upgrades, node0Boot: migrated };
  }
  return upgrades;
}

function migrateModuleTreeV4(upgrades: UpgradeLevels): UpgradeLevels {
  const totalLevels = Object.values(upgrades).reduce((sum, level) => sum + level, 0);
  if (totalLevels > 0 && upgrades.node0Boot < 1) {
    return { ...upgrades, node0Boot: 1 };
  }
  return upgrades;
}

/** Node-0 Boot is a free baseline — always granted at level 1. */
function ensureNode0BootBaseline(upgrades: UpgradeLevels): UpgradeLevels {
  if (upgrades.node0Boot >= 1) return upgrades;
  return { ...upgrades, node0Boot: 1 };
}

type LegacyEliteUpgradeId = 'eliteBreaker' | 'eliteShardScavenger';

/** Coûts historiques au moment du retrait (remboursement migration). */
const LEGACY_ELITE_MODULE_COSTS: Record<LegacyEliteUpgradeId, readonly number[]> = {
  eliteBreaker: [150, 250, 400],
  eliteShardScavenger: [130, 220, 350],
};

function sumLegacyUpgradePurchaseCosts(id: LegacyEliteUpgradeId, level: number): number {
  const costs = LEGACY_ELITE_MODULE_COSTS[id];
  const safeLevel = Math.max(0, Math.floor(level));
  let total = 0;
  for (let index = 0; index < Math.min(safeLevel, costs.length); index++) {
    total += costs[index] ?? 0;
  }
  return total;
}

function migrateRemovedEliteModules(
  parsed: LegacySaveData,
  bankShards: number,
): { bankShards: number; needsMigration: boolean } {
  if (parsed.enemyScalingV1) {
    return { bankShards, needsMigration: false };
  }

  const raw = parsed.upgrades as Partial<Record<LegacyEliteUpgradeId, unknown>> | undefined;
  if (!raw) {
    return { bankShards, needsMigration: true };
  }

  let refund = 0;
  for (const id of ['eliteBreaker', 'eliteShardScavenger'] as const) {
    const level = raw[id];
    if (typeof level === 'number' && Number.isFinite(level) && level > 0) {
      refund += sumLegacyUpgradePurchaseCosts(id, level);
    }
  }

  return {
    bankShards: bankShards + refund,
    needsMigration: true,
  };
}

function migratePrestigeToolsV1(
  upgrades: UpgradeLevels,
  coreProtocols: CoreProtocolLevels,
  parsed: LegacySaveData,
): { upgrades: UpgradeLevels; coreProtocols: CoreProtocolLevels; needsMigration: boolean } {
  if (parsed.prestigeToolsV1) {
    return { upgrades, coreProtocols, needsMigration: false };
  }

  let nextUpgrades = { ...upgrades };
  let nextProtocols = { ...coreProtocols };
  let migrated = false;

  if (nextUpgrades.overclock >= 1) {
    nextProtocols.overclock = Math.max(nextProtocols.overclock, 1);
    nextUpgrades.overclock = 0;
    migrated = true;
  }
  if (nextUpgrades.fluxDrive >= 1) {
    nextProtocols.fluxDrive = Math.max(nextProtocols.fluxDrive, 1);
    nextUpgrades.fluxDrive = 0;
    migrated = true;
  }

  return { upgrades: nextUpgrades, coreProtocols: nextProtocols, needsMigration: migrated };
}

export function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as LegacySaveData;
    const rawBankShards = readBankShards(parsed);
    if (rawBankShards === null) return null;

    const needsEconomyMigration = !parsed.economyV2;
    const needsModuleTreeMigration = !hasModuleTreeV3(parsed);
    const needsV4Migration = !parsed.economyV4 || !hasModuleTreeV4(parsed);
    const needsKeyRename =
      parsed.skillTreeV3 !== undefined ||
      parsed.skillTreeV4 !== undefined ||
      parsed.moduleTreeV3 === undefined ||
      parsed.moduleTreeV4 === undefined;

    let bankShards = migrateEconomyV2(rawBankShards, parsed);
    const eliteMigration = migrateRemovedEliteModules(parsed, bankShards);
    bankShards = eliteMigration.bankShards;
    let upgrades = migrateModuleTreeV3(parsed);
    upgrades = migrateLegacyNode0Boot(upgrades, parsed.upgrades);
    if (needsV4Migration) {
      upgrades = migrateModuleTreeV4(upgrades);
    }
    const upgradesBeforeBaseline = upgrades;
    upgrades = ensureNode0BootBaseline(upgrades);

    const bankAnchorFragments =
      typeof parsed.bankAnchorFragments === 'number'
        ? Math.max(0, parsed.bankAnchorFragments)
        : 0;

    const highestCycleUnlocked =
      typeof parsed.highestCycleUnlocked === 'number'
        ? clampCycleIndex(parsed.highestCycleUnlocked)
        : DEFAULT_CYCLE_PROGRESS.highestCycleUnlocked;
    const selectedCycle =
      typeof parsed.selectedCycle === 'number'
        ? clampCycleIndex(Math.min(parsed.selectedCycle, highestCycleUnlocked))
        : Math.min(DEFAULT_CYCLE_PROGRESS.selectedCycle, highestCycleUnlocked);
    const cyclesCleared = sanitizeCyclesCleared(parsed.cyclesCleared);
    const cyclesSinceLastAnchor =
      typeof parsed.cyclesSinceLastAnchor === 'number'
        ? Math.max(0, Math.floor(parsed.cyclesSinceLastAnchor))
        : 0;
    const anchoredNodes = sanitizeAnchoredNodes(parsed.anchoredNodes);
    const bestKillsByCycle =
      parsed.bestKillsByCycle !== undefined
        ? sanitizeBestKillsByCycle(parsed.bestKillsByCycle)
        : migrateBestWaveToKills(parsed.bestWaveByCycle);

    const recompileDepth = Math.max(
      0,
      parsed.recompileDepth ?? parsed.prestigeLevel ?? DEFAULT_PRESTIGE.recompileDepth,
    );
    const seedFragments =
      typeof parsed.seedFragments === 'number'
        ? Math.max(0, parsed.seedFragments)
        : DEFAULT_PRESTIGE.seedFragments;
    const coreProtocolsBefore = sanitizeCoreProtocols(parsed.coreProtocols);
    const prestigeToolsMigration = migratePrestigeToolsV1(upgrades, coreProtocolsBefore, parsed);
    upgrades = prestigeToolsMigration.upgrades;
    const coreProtocols = prestigeToolsMigration.coreProtocols;

    const saveData: SaveData = {
      bankShards,
      bankAnchorFragments,
      upgrades,
      seedFragments,
      recompileDepth,
      coreProtocols,
      prestigeUnlocked: parsed.prestigeUnlocked ?? recompileDepth > 0,
      prestigeLevel: recompileDepth,
      highestCycleUnlocked,
      selectedCycle,
      cyclesCleared,
      cyclesSinceLastAnchor,
      anchoredNodes,
      bestKillsByCycle,
      economyV2: true,
      moduleTreeV3: true,
      economyV4: true,
      moduleTreeV4: true,
      enemyScalingV1: true,
      prestigeToolsV1: true,
    };

    if (
      needsEconomyMigration ||
      needsModuleTreeMigration ||
      needsV4Migration ||
      needsKeyRename ||
      eliteMigration.needsMigration ||
      prestigeToolsMigration.needsMigration ||
      upgradesBeforeBaseline !== upgrades
    ) {
      saveGame(saveData);
    }

    return saveData;
  } catch {
    return null;
  }
}

export function saveGame(data: SaveData): void {
  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({
      ...data,
      economyV2: true,
      moduleTreeV3: true,
      economyV4: true,
      moduleTreeV4: true,
      enemyScalingV1: true,
      prestigeToolsV1: true,
    }),
  );
}

export function hasSave(): boolean {
  return loadSave() !== null;
}

export function hasProgressToErase(): boolean {
  const save = loadSave();
  if (!save) return false;
  if (save.bankShards > 0) return true;
  if (save.bankAnchorFragments > 0) return true;
  if (save.seedFragments > 0) return true;
  if (save.recompileDepth > 0) return true;
  if (save.prestigeUnlocked || save.prestigeLevel > 0) return true;
  if (save.highestCycleUnlocked > 1) return true;
  if (save.cyclesCleared.length > 0) return true;
  const earnedUpgrades = { ...save.upgrades };
  delete (earnedUpgrades as Partial<UpgradeLevels>).node0Boot;
  return Object.values(earnedUpgrades).some((level) => (level as number) > 0);
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
