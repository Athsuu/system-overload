import type { UpgradeLevels } from '../store/upgradeCatalog';

export function isVaultShardsUnlocked(bankShards: number, upgrades: UpgradeLevels): boolean {
  if (bankShards > 0) return true;
  return Object.values(upgrades).some((level) => level > 0);
}

/** Hub badge — visible only after the player has at least one Anchor Fragment in the vault. */
export function isAnchorFragmentsUnlocked(bankAnchorFragments: number): boolean {
  return bankAnchorFragments > 0;
}
