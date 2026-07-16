export type CoreProtocolId =
  | 'residualMemory'
  | 'bootReinforcement'
  | 'thermalBaseline'
  | 'extractionProtocol'
  | 'seedResonance'
  | 'explosivePurge'
  | 'explosivePurgeRadius'
  | 'explosivePurgeDamage'
  | 'explosivePurgeChain';

export type CoreProtocolKind = 'fundamental' | 'skillUnlock' | 'skillBranchNode';

export interface CoreProtocolLevels {
  residualMemory: number;
  bootReinforcement: number;
  thermalBaseline: number;
  extractionProtocol: number;
  seedResonance: number;
  explosivePurge: number;
  explosivePurgeRadius: number;
  explosivePurgeDamage: number;
  explosivePurgeChain: number;
}

export interface PrestigeState {
  seedFragments: number;
  recompileDepth: number;
  coreProtocols: CoreProtocolLevels;
  /** @deprecated legacy save field — use recompileDepth */
  prestigeUnlocked: boolean;
  /** @deprecated legacy save field — use recompileDepth */
  prestigeLevel: number;
}

export const DEFAULT_CORE_PROTOCOLS: CoreProtocolLevels = {
  residualMemory: 0,
  bootReinforcement: 0,
  thermalBaseline: 0,
  extractionProtocol: 0,
  seedResonance: 0,
  explosivePurge: 0,
  explosivePurgeRadius: 0,
  explosivePurgeDamage: 0,
  explosivePurgeChain: 0,
};

export const DEFAULT_PRESTIGE: PrestigeState = {
  seedFragments: 0,
  recompileDepth: 0,
  coreProtocols: { ...DEFAULT_CORE_PROTOCOLS },
  prestigeUnlocked: false,
  prestigeLevel: 0,
};
