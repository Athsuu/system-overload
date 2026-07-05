export type KernelModuleId =
  | 'damageBoost'
  | 'fireRateBoost'
  | 'heatShieldRun'
  | 'multishot'
  | 'pierce'
  | 'xpMagnet'
  | 'overclockDuration'
  | 'overclockCooldown'
  | 'heatReduction'
  | 'hitRadius'
  | 'shardsBoost'
  | 'homingBoost';

export type KernelModuleLevels = Partial<Record<KernelModuleId, number>>;

export interface KernelModuleDefinition {
  id: KernelModuleId;
  name: string;
  description: string;
  maxLevel: number;
  cycleCost: number;
}

export const KERNEL_MODULE_CATALOG: KernelModuleDefinition[] = [
  {
    id: 'damageBoost',
    name: 'Overdrive',
    description: '+20% bolt damage',
    maxLevel: 5,
    cycleCost: 2,
  },
  {
    id: 'fireRateBoost',
    name: 'Rapid Pulse',
    description: '+15% fire rate',
    maxLevel: 5,
    cycleCost: 2,
  },
  {
    id: 'heatShieldRun',
    name: 'Heat Sink',
    description: '-10% leak heat per level',
    maxLevel: 3,
    cycleCost: 1,
  },
  {
    id: 'multishot',
    name: 'Forked Flux',
    description: '+1 bolt per volley',
    maxLevel: 2,
    cycleCost: 3,
  },
  {
    id: 'pierce',
    name: 'Penetrator',
    description: 'Bolts pierce +1 target',
    maxLevel: 2,
    cycleCost: 3,
  },
  {
    id: 'xpMagnet',
    name: 'Data Harvest',
    description: '+25% XP from kills',
    maxLevel: 3,
    cycleCost: 1,
  },
  {
    id: 'overclockDuration',
    name: 'Extended Overclock',
    description: '+1s overclock duration',
    maxLevel: 3,
    cycleCost: 2,
  },
  {
    id: 'overclockCooldown',
    name: 'Fast Cycle',
    description: '-2s overclock cooldown',
    maxLevel: 3,
    cycleCost: 2,
  },
  {
    id: 'heatReduction',
    name: 'Passive Coolant',
    description: '-12% passive heat gain',
    maxLevel: 3,
    cycleCost: 1,
  },
  {
    id: 'hitRadius',
    name: 'Wide Intercept',
    description: '+4px hit radius',
    maxLevel: 3,
    cycleCost: 1,
  },
  {
    id: 'shardsBoost',
    name: 'Yield Amplifier',
    description: '+30% Shards from kills',
    maxLevel: 3,
    cycleCost: 2,
  },
  {
    id: 'homingBoost',
    name: 'Seeker Lock',
    description: '+40% homing strength',
    maxLevel: 3,
    cycleCost: 2,
  },
];

export const DEFAULT_KERNEL_MODULE_LEVELS: KernelModuleLevels = {};

export function getKernelModuleDefinition(id: KernelModuleId): KernelModuleDefinition {
  const definition = KERNEL_MODULE_CATALOG.find((entry) => entry.id === id);
  if (!definition) throw new Error(`Unknown kernel module: ${id}`);
  return definition;
}

export function getXpToNextLevel(runLevel: number): number {
  return 15 + runLevel * 8;
}

export function getXpRewardForTier(tier: number): number {
  return [8, 14, 22][Math.min(tier, 2)] ?? 8;
}

export function getCyclesForLevelUp(_newLevel: number): number {
  return 1;
}
