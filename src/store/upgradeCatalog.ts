export type UpgradeId =
  | 'starterNodes'
  | 'nodeSpawnRate'
  | 'nodeCapacity'
  | 'nodeReach'
  | 'coolingPower'
  | 'heatShield'
  | 'criticalThreshold'
  | 'fluxThrottle'
  | 'emissionDampener'
  | 'accelControl'
  | 'autoAim'
  | 'boltDamage'
  | 'damageAmp'
  | 'fireRate'
  | 'rapidCycle';

export type SkillState = 'locked' | 'available' | 'unaffordable' | 'maxed';

export interface UpgradeLevels {
  starterNodes: number;
  nodeSpawnRate: number;
  nodeCapacity: number;
  nodeReach: number;
  coolingPower: number;
  heatShield: number;
  criticalThreshold: number;
  fluxThrottle: number;
  emissionDampener: number;
  accelControl: number;
  autoAim: number;
  boltDamage: number;
  damageAmp: number;
  fireRate: number;
  rapidCycle: number;
}

export interface UpgradeRequirement {
  id: UpgradeId;
  minLevel: number;
}

export interface UpgradeDefinition {
  id: UpgradeId;
  name: string;
  description: string;
  baseCost: number;
  maxLevel: number;
}

export const DEFAULT_UPGRADES: UpgradeLevels = {
  starterNodes: 0,
  nodeSpawnRate: 0,
  nodeCapacity: 0,
  nodeReach: 0,
  coolingPower: 0,
  heatShield: 0,
  criticalThreshold: 0,
  fluxThrottle: 0,
  emissionDampener: 0,
  accelControl: 0,
  autoAim: 0,
  boltDamage: 0,
  damageAmp: 0,
  fireRate: 0,
  rapidCycle: 0,
};

export const UPGRADE_CATALOG: UpgradeDefinition[] = [
  {
    id: 'starterNodes',
    name: 'Initial Relay',
    description: '+1 enemy at wave 1 start',
    baseCost: 30,
    maxLevel: 2,
  },
  {
    id: 'nodeSpawnRate',
    name: 'Wave Suppression',
    description: '-8% enemy HP per level',
    baseCost: 20,
    maxLevel: 5,
  },
  {
    id: 'nodeCapacity',
    name: 'Pressure Buffer',
    description: 'Legacy capacity bonus (wave mode)',
    baseCost: 15,
    maxLevel: 5,
  },
  {
    id: 'nodeReach',
    name: 'Dissipation Reach',
    description: '+3px interception radius',
    baseCost: 35,
    maxLevel: 3,
  },
  {
    id: 'coolingPower',
    name: 'Stabilizer',
    description: '-0.15%/s passive heat per level',
    baseCost: 25,
    maxLevel: 3,
  },
  {
    id: 'heatShield',
    name: 'Heat Shield',
    description: 'Reduces leak and miss heat gain',
    baseCost: 30,
    maxLevel: 2,
  },
  {
    id: 'criticalThreshold',
    name: 'Heat Capacity',
    description: '+10 meltdown threshold (110% cap)',
    baseCost: 50,
    maxLevel: 1,
  },
  {
    id: 'fluxThrottle',
    name: 'Overclock Tuning',
    description: '-5% overclock cooldown per level',
    baseCost: 20,
    maxLevel: 5,
  },
  {
    id: 'emissionDampener',
    name: 'Emission Dampener',
    description: '-1 heat on missed shot per level',
    baseCost: 35,
    maxLevel: 2,
  },
  {
    id: 'accelControl',
    name: 'Acceleration Control',
    description: 'Slows fire rate ramp during long fights',
    baseCost: 28,
    maxLevel: 3,
  },
  {
    id: 'autoAim',
    name: 'Target Acquisition',
    description: '+15% auto-fire targeting range per level',
    baseCost: 45,
    maxLevel: 1,
  },
  {
    id: 'boltDamage',
    name: 'Bolt Power',
    description: '+1 damage per hit',
    baseCost: 25,
    maxLevel: 5,
  },
  {
    id: 'damageAmp',
    name: 'Damage Amplifier',
    description: '+10% damage per level',
    baseCost: 40,
    maxLevel: 3,
  },
  {
    id: 'fireRate',
    name: 'Fire Rate',
    description: 'Fire rate 8% faster per level',
    baseCost: 22,
    maxLevel: 5,
  },
  {
    id: 'rapidCycle',
    name: 'Rapid Cycle',
    description: '+0.2s overclock duration per level',
    baseCost: 35,
    maxLevel: 3,
  },
];

export function getUpgradeDefinition(id: UpgradeId): UpgradeDefinition {
  const definition = UPGRADE_CATALOG.find((entry) => entry.id === id);
  if (!definition) throw new Error(`Unknown upgrade: ${id}`);
  return definition;
}

export function getUpgradeCost(baseCost: number, level: number): number {
  return Math.floor(baseCost * 1.6 ** level);
}

export function isSkillUnlocked(
  _id: UpgradeId,
  upgrades: UpgradeLevels,
  requirements: UpgradeRequirement[] | undefined,
): boolean {
  if (!requirements || requirements.length === 0) return true;

  return requirements.every((requirement) => upgrades[requirement.id] >= requirement.minLevel);
}

export function getSkillState(
  id: UpgradeId,
  bankShards: number,
  upgrades: UpgradeLevels,
  requirements: UpgradeRequirement[] | undefined,
): SkillState {
  const definition = getUpgradeDefinition(id);
  const level = upgrades[id];

  if (!isSkillUnlocked(id, upgrades, requirements)) return 'locked';
  if (level >= definition.maxLevel) return 'maxed';

  const cost = getUpgradeCost(definition.baseCost, level);
  return bankShards >= cost ? 'available' : 'unaffordable';
}
