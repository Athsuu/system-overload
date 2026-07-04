import type { UpgradeDefinition, UpgradeId, UpgradeRequirement } from './upgradeCatalog';
import { UPGRADE_CATALOG } from './upgradeCatalog';

export type BranchId = 'dissipation' | 'thermique' | 'flux' | 'degats' | 'cadence';

export const TREE_CANVAS = { width: 2000, height: 1200 };
export const HEX_CELL = 90;
export const NODE_RADIUS = 34;
export const CORE_RADIUS = 46;
export const NODE_SIZE = NODE_RADIUS * Math.sqrt(3);

export interface SkillNodeDef extends UpgradeDefinition {
  branch: BranchId;
  tier: number;
  icon: string;
  requires?: UpgradeRequirement[];
  position: { x: number; y: number };
  parentId?: UpgradeId | 'core';
}

export const CORE_POSITION = { x: 1000, y: 600 };

export const BRANCH_LABELS: Record<BranchId, { label: string; color: string }> = {
  dissipation: { label: 'Pressure', color: '#9ca3af' },
  thermique: { label: 'Heat', color: '#f97316' },
  flux: { label: 'Weapon', color: '#22d3ee' },
  degats: { label: 'Damage', color: '#ef4444' },
  cadence: { label: 'Overclock', color: '#a78bfa' },
};

const NODE_ICONS: Record<UpgradeId, string> = {
  starterNodes: 'R',
  nodeSpawnRate: 'G',
  nodeCapacity: 'C',
  nodeReach: 'P',
  coolingPower: 'T',
  heatShield: 'B',
  criticalThreshold: 'S',
  fluxThrottle: 'F',
  emissionDampener: 'A',
  accelControl: 'X',
  autoAim: 'V',
  boltDamage: 'D',
  damageAmp: '+',
  fireRate: 'S',
  rapidCycle: 'H',
};

interface AxialCoord {
  q: number;
  r: number;
}

function hexPosition(q: number, r: number): { x: number; y: number } {
  return {
    x: CORE_POSITION.x + HEX_CELL * Math.sqrt(3) * (q + r / 2),
    y: CORE_POSITION.y + HEX_CELL * 1.5 * r,
  };
}

const BRANCH_AXIAL: Record<BranchId, AxialCoord[]> = {
  dissipation: [
    { q: -1, r: 0 },
    { q: -2, r: 0 },
    { q: -3, r: 0 },
    { q: -4, r: 0 },
  ],
  flux: [
    { q: -1, r: 1 },
    { q: -2, r: 2 },
    { q: -3, r: 3 },
    { q: -4, r: 4 },
  ],
  thermique: [
    { q: 1, r: 0 },
    { q: 2, r: 0 },
    { q: 3, r: 0 },
  ],
  degats: [
    { q: 1, r: -1 },
    { q: 2, r: -2 },
  ],
  cadence: [
    { q: 0, r: -1 },
    { q: 0, r: -2 },
  ],
};

function buildNode(
  id: UpgradeId,
  branch: BranchId,
  tier: number,
  requires?: UpgradeRequirement[],
  parentId?: UpgradeId | 'core',
): SkillNodeDef {
  const definition = UPGRADE_CATALOG.find((entry) => entry.id === id);
  if (!definition) throw new Error(`Missing catalog entry: ${id}`);

  const axial = BRANCH_AXIAL[branch][tier];
  if (!axial) throw new Error(`Missing axial slot: ${branch} tier ${tier}`);

  return {
    ...definition,
    branch,
    tier,
    icon: NODE_ICONS[id],
    requires,
    parentId,
    position: hexPosition(axial.q, axial.r),
  };
}

export const SKILL_TREE_NODES: SkillNodeDef[] = [
  buildNode('starterNodes', 'dissipation', 0, undefined, 'core'),
  buildNode(
    'nodeSpawnRate',
    'dissipation',
    1,
    [{ id: 'starterNodes', minLevel: 1 }],
    'starterNodes',
  ),
  buildNode(
    'nodeCapacity',
    'dissipation',
    2,
    [{ id: 'nodeSpawnRate', minLevel: 2 }],
    'nodeSpawnRate',
  ),
  buildNode(
    'nodeReach',
    'dissipation',
    3,
    [{ id: 'nodeCapacity', minLevel: 2 }],
    'nodeCapacity',
  ),
  buildNode('coolingPower', 'thermique', 0, undefined, 'core'),
  buildNode(
    'heatShield',
    'thermique',
    1,
    [{ id: 'coolingPower', minLevel: 1 }],
    'coolingPower',
  ),
  buildNode(
    'criticalThreshold',
    'thermique',
    2,
    [{ id: 'heatShield', minLevel: 1 }],
    'heatShield',
  ),
  buildNode('fluxThrottle', 'flux', 0, undefined, 'core'),
  buildNode(
    'emissionDampener',
    'flux',
    1,
    [{ id: 'fluxThrottle', minLevel: 2 }],
    'fluxThrottle',
  ),
  buildNode(
    'accelControl',
    'flux',
    2,
    [{ id: 'emissionDampener', minLevel: 1 }],
    'emissionDampener',
  ),
  buildNode(
    'autoAim',
    'flux',
    3,
    [{ id: 'accelControl', minLevel: 1 }],
    'accelControl',
  ),
  buildNode('boltDamage', 'degats', 0, undefined, 'core'),
  buildNode(
    'damageAmp',
    'degats',
    1,
    [{ id: 'boltDamage', minLevel: 2 }],
    'boltDamage',
  ),
  buildNode('fireRate', 'cadence', 0, undefined, 'core'),
  buildNode(
    'rapidCycle',
    'cadence',
    1,
    [{ id: 'fireRate', minLevel: 2 }],
    'fireRate',
  ),
];

export function getSkillNode(id: UpgradeId): SkillNodeDef {
  const node = SKILL_TREE_NODES.find((entry) => entry.id === id);
  if (!node) throw new Error(`Unknown skill node: ${id}`);
  return node;
}

export function getNodePosition(id: UpgradeId | 'core'): { x: number; y: number } {
  if (id === 'core') return CORE_POSITION;
  return getSkillNode(id).position;
}
