import type { CoreProtocolId } from '../../store/prestigeTypes';
import {
  getBranchNodeIds,
  getFundamentalProtocolIds,
  getSkillUnlockIds,
} from '../../store/coreProtocolCatalog';

/** Ordre d'affichage des Fondamentaux (Monolithe historique). */
export const FUNDAMENTAL_PROTOCOL_IDS: CoreProtocolId[] = [
  'bootReinforcement',
  'thermalBaseline',
  'residualMemory',
  'extractionProtocol',
  'seedResonance',
];

/** @deprecated use FUNDAMENTAL_PROTOCOL_IDS — kept for any leftover imports */
export const SEED_PROTOCOL_IDS: CoreProtocolId[] = FUNDAMENTAL_PROTOCOL_IDS;

export function listFundamentalProtocolIds(): CoreProtocolId[] {
  const catalogOrder = getFundamentalProtocolIds();
  return FUNDAMENTAL_PROTOCOL_IDS.filter((id) => catalogOrder.includes(id));
}

export function listSkillUnlockIds(): CoreProtocolId[] {
  return getSkillUnlockIds();
}

export function listBranchNodeIds(unlockId: CoreProtocolId): CoreProtocolId[] {
  return getBranchNodeIds(unlockId);
}
