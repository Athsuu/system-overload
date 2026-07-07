import { DEFAULT_PRESTIGE } from './prestigeTypes';
import { DEFAULT_UPGRADES, UPGRADE_CATALOG, type UpgradeLevels } from './upgradeCatalog';

const SAVE_KEY = 'system-overload-save';

export interface SaveData {
  bankShards: number;
  bankAnchorFragments: number;
  upgrades: UpgradeLevels;
  prestigeUnlocked: boolean;
  prestigeLevel: number;
  economyV2?: boolean;
  skillTreeV3?: boolean;
  economyV4?: boolean;
  skillTreeV4?: boolean;
}

interface LegacySaveData {
  bankShards?: number;
  bankAnchorFragments?: number;
  bankTflops?: number;
  upgrades?: Partial<UpgradeLevels> & {
    autoAim?: number;
    accelControl?: number;
    nodeCapacity?: number;
    emissionDampener?: number;
    nodeSpawnRate?: number;
  };
  prestigeUnlocked?: boolean;
  prestigeLevel?: number;
  economyV2?: boolean;
  skillTreeV3?: boolean;
  economyV4?: boolean;
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

function migrateSkillTreeV3(parsed: LegacySaveData): UpgradeLevels {
  if (parsed.skillTreeV3) {
    return sanitizeUpgrades(parsed.upgrades);
  }
  return { ...DEFAULT_UPGRADES };
}

function migrateLoreV07Upgrades(upgrades: UpgradeLevels, raw: LegacySaveData['upgrades']): UpgradeLevels {
  if (!raw) return upgrades;
  const legacy = raw as { kernelBoot?: number };
  if (typeof legacy.kernelBoot !== 'number') return upgrades;
  const migrated = Math.max(0, Math.min(1, Math.floor(legacy.kernelBoot)));
  if (migrated > upgrades.node0Boot) {
    return { ...upgrades, node0Boot: migrated };
  }
  return upgrades;
}

function migrateSkillTreeV4(upgrades: UpgradeLevels): UpgradeLevels {
  const totalLevels = Object.values(upgrades).reduce((sum, level) => sum + level, 0);
  if (totalLevels > 0 && upgrades.node0Boot < 1) {
    return { ...upgrades, node0Boot: 1 };
  }
  return upgrades;
}

export function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as LegacySaveData;
    const rawBankShards = readBankShards(parsed);
    if (rawBankShards === null) return null;

    const needsEconomyMigration = !parsed.economyV2;
    const needsSkillTreeMigration = !parsed.skillTreeV3;
    const needsV4Migration = !parsed.economyV4 || !parsed.skillTreeV4;

    let bankShards = migrateEconomyV2(rawBankShards, parsed);
    let upgrades = migrateSkillTreeV3(parsed);
    upgrades = migrateLoreV07Upgrades(upgrades, parsed.upgrades);
    if (needsV4Migration) {
      upgrades = migrateSkillTreeV4(upgrades);
    }

    const bankAnchorFragments =
      typeof parsed.bankAnchorFragments === 'number'
        ? Math.max(0, parsed.bankAnchorFragments)
        : 0;

    const saveData: SaveData = {
      bankShards,
      bankAnchorFragments,
      upgrades,
      prestigeUnlocked: parsed.prestigeUnlocked ?? DEFAULT_PRESTIGE.prestigeUnlocked,
      prestigeLevel: Math.max(0, parsed.prestigeLevel ?? DEFAULT_PRESTIGE.prestigeLevel),
      economyV2: true,
      skillTreeV3: true,
      economyV4: true,
      skillTreeV4: true,
    };

    if (needsEconomyMigration || needsSkillTreeMigration || needsV4Migration) {
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
      skillTreeV3: true,
      economyV4: true,
      skillTreeV4: true,
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
  return Object.values(save.upgrades).some((level) => level > 0);
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
