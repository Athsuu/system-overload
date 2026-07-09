import { DEFAULT_PRESTIGE } from './prestigeTypes';
import {
  DEFAULT_CYCLE_PROGRESS,
  sanitizeCyclesCleared,
  clampCycleIndex,
} from './cycleTypes';
import { DEFAULT_UPGRADES, UPGRADE_CATALOG, type UpgradeLevels } from './upgradeCatalog';

const SAVE_KEY = 'system-overload-save';

export interface SaveData {
  bankShards: number;
  bankAnchorFragments: number;
  upgrades: UpgradeLevels;
  prestigeUnlocked: boolean;
  prestigeLevel: number;
  highestCycleUnlocked: number;
  selectedCycle: number;
  cyclesCleared: number[];
  economyV2?: boolean;
  moduleTreeV3?: boolean;
  economyV4?: boolean;
  moduleTreeV4?: boolean;
}

interface LegacySaveData {
  bankShards?: number;
  bankAnchorFragments?: number;
  bankTflops?: number;
  upgrades?: Partial<UpgradeLevels>;
  prestigeUnlocked?: boolean;
  prestigeLevel?: number;
  highestCycleUnlocked?: number;
  selectedCycle?: number;
  cyclesCleared?: unknown;
  economyV2?: boolean;
  moduleTreeV3?: boolean;
  /** @deprecated legacy key — migrated to moduleTreeV3 */
  skillTreeV3?: boolean;
  economyV4?: boolean;
  moduleTreeV4?: boolean;
  /** @deprecated legacy key — migrated to moduleTreeV4 */
  skillTreeV4?: boolean;
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
  const upgrades = { ...DEFAULT_UPGRADES };
  if (!raw) return upgrades;

  for (const definition of UPGRADE_CATALOG) {
    const level = raw[definition.id];
    if (typeof level === 'number' && Number.isFinite(level)) {
      upgrades[definition.id] = Math.max(0, Math.min(definition.maxLevel, Math.floor(level)));
    }
  }

  return upgrades;
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

    const saveData: SaveData = {
      bankShards,
      bankAnchorFragments,
      upgrades,
      prestigeUnlocked: parsed.prestigeUnlocked ?? DEFAULT_PRESTIGE.prestigeUnlocked,
      prestigeLevel: Math.max(0, parsed.prestigeLevel ?? DEFAULT_PRESTIGE.prestigeLevel),
      highestCycleUnlocked,
      selectedCycle,
      cyclesCleared,
      economyV2: true,
      moduleTreeV3: true,
      economyV4: true,
      moduleTreeV4: true,
    };

    if (
      needsEconomyMigration ||
      needsModuleTreeMigration ||
      needsV4Migration ||
      needsKeyRename ||
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
