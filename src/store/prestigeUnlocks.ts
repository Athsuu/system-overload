import type { CoreProtocolLevels } from './prestigeTypes';
import type { UpgradeId, UpgradeLevels } from './upgradeCatalog';

/** Compétences prestige éligibles au Hardware Supercharge (hors arbre shards). */
export const PRESTIGE_ANCHOR_TOOL_IDS = ['overclock', 'fluxDrive'] as const satisfies readonly UpgradeId[];

export type PrestigeAnchorToolId = (typeof PRESTIGE_ANCHOR_TOOL_IDS)[number];

export function isPrestigeAnchorToolId(id: string): id is PrestigeAnchorToolId {
  return id === 'overclock' || id === 'fluxDrive';
}

export function isOverclockUnlocked(coreProtocols: CoreProtocolLevels): boolean {
  return coreProtocols.overclock >= 1;
}

export function isFluxDriveUnlocked(coreProtocols: CoreProtocolLevels): boolean {
  return coreProtocols.fluxDrive >= 1;
}

/** Possession d’un module pour ancrage — shards ou unlock prestige. */
export function isModuleOwnedForAnchor(
  id: UpgradeId,
  upgrades: UpgradeLevels,
  coreProtocols: CoreProtocolLevels,
): boolean {
  if (id === 'overclock') return isOverclockUnlocked(coreProtocols);
  if (id === 'fluxDrive') return isFluxDriveUnlocked(coreProtocols);
  return (upgrades[id] ?? 0) >= 1;
}
