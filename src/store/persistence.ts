import { DEFAULT_PRESTIGE } from './prestigeTypes';
import { DEFAULT_UPGRADES, type UpgradeLevels } from './upgradeCatalog';

const SAVE_KEY = 'system-overload-save';

export interface SaveData {
  bankShards: number;
  upgrades: UpgradeLevels;
  prestigeUnlocked: boolean;
  prestigeLevel: number;
}

interface LegacySaveData extends Partial<SaveData> {
  bankTflops?: number;
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

export function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as LegacySaveData;
    const bankShards = readBankShards(parsed);
    if (bankShards === null || !parsed.upgrades) return null;

    return {
      bankShards,
      upgrades: { ...DEFAULT_UPGRADES, ...parsed.upgrades },
      prestigeUnlocked: parsed.prestigeUnlocked ?? DEFAULT_PRESTIGE.prestigeUnlocked,
      prestigeLevel: Math.max(0, parsed.prestigeLevel ?? DEFAULT_PRESTIGE.prestigeLevel),
    };
  } catch {
    return null;
  }
}

export function saveGame(data: SaveData): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
