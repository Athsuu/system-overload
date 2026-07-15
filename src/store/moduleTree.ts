import {
  getUpgradeDefinition,
  requireLevel,
  UPGRADE_CATALOG,
  type UpgradeId,
  type UpgradeRequirement,
} from './upgradeCatalog';
import { getGameStrings } from '../i18n';

export type BranchId = 'degats' | 'thermique';

export type ModuleIconBranch = BranchId | 'flux';

/** Per-node glyph on the module tree (branch defaults + dedicated marks). */
export type ModuleGlyphId = ModuleIconBranch | 'shard' | 'magnet' | 'cadence' | 'reach' | 'splash' | 'victory' | 'dissipate' | 'seal' | 'amplify';

export type TreeNodeId = UpgradeId;
export type TreeParentId = 'root' | TreeNodeId;

export const TREE_CANVAS = { width: 2000, height: 1200 };
export const HEX_CELL = 90;
export const NODE_RADIUS = 51;
export const NODE0_HUB_RADIUS = 84;
export const NODE_SIZE = NODE_RADIUS * Math.sqrt(3);

export const NODE0_HUB_POSITION = { x: 1000, y: 600 };

/** Flat-edge hex directions — child centers are parent + offset (scale for 2×, 3×, …). */
export const HEX_FLAT_DIRECTIONS = {
  up: { dx: 0, dy: -200 },
  upRight: { dx: 173, dy: -100 },
  downRight: { dx: 173, dy: 100 },
  down: { dx: 0, dy: 200 },
  downLeft: { dx: -173, dy: 100 },
  upLeft: { dx: -173, dy: -100 },
} as const;

export type HexFlatDirection = keyof typeof HEX_FLAT_DIRECTIONS;

export function positionFromParent(
  parent: { x: number; y: number },
  direction: HexFlatDirection,
  scale = 1,
): { x: number; y: number } {
  const offset = HEX_FLAT_DIRECTIONS[direction];
  return {
    x: parent.x + offset.dx * scale,
    y: parent.y + offset.dy * scale,
  };
}

export function positionFromAxial(
  q: number,
  r: number,
  origin: { x: number; y: number } = NODE0_HUB_POSITION,
): { x: number; y: number } {
  const { dx: diagX, dy: diagY } = HEX_FLAT_DIRECTIONS.upRight;
  const { dy: verticalStep } = HEX_FLAT_DIRECTIONS.up;
  return {
    x: origin.x + diagX * q,
    y: origin.y + diagY * q + verticalStep * r,
  };
}

const BRANCH_COLORS: Record<BranchId, string> = {
  degats: '#ef4444',
  thermique: '#f97316',
};

export function getBranchLabels(): Record<BranchId, { label: string; color: string }> {
  const labels = getGameStrings().branches;
  return {
    degats: { label: labels.degats, color: BRANCH_COLORS.degats },
    thermique: { label: labels.thermique, color: BRANCH_COLORS.thermique },
  };
}

export function getModuleIconBranchMeta(): Record<ModuleIconBranch, { label: string; color: string }> {
  const labels = getGameStrings().branches;
  return {
    ...getBranchLabels(),
    flux: { label: labels.flux, color: '#38bdf8' },
  };
}

const UPGRADE_BRANCH: Record<UpgradeId, BranchId> = {
  node0Boot: 'thermique',
  shardSalvage: 'thermique',
  victoryShardBonus: 'thermique',
  shardMagnet: 'thermique',
  purgeStrike: 'degats',
  purgeCadence: 'degats',
  purgeReach: 'degats',
  purgeSplash: 'degats',
  latencyInjection: 'degats',
  threadCoolant: 'thermique',
  killBreachRelief: 'thermique',
  meltdownThreshold: 'thermique',
  overclock: 'degats',
  fluxDrive: 'thermique',
  breachDissipation: 'thermique',
  leakSealing: 'thermique',
  purgeAmplifier: 'degats',
};

const MODULE_ICON_BRANCH: Partial<Record<UpgradeId, ModuleIconBranch>> = {
  node0Boot: 'flux',
  fluxDrive: 'flux',
};

export function getModuleIconBranch(id: UpgradeId, branch: BranchId): ModuleIconBranch {
  return MODULE_ICON_BRANCH[id] ?? branch;
}

export function getModuleGlyphId(id: UpgradeId, branch: BranchId): ModuleGlyphId | null {
  if (id === 'purgeStrike') return 'degats';
  if (id === 'purgeCadence') return 'cadence';
  if (id === 'purgeReach') return 'reach';
  if (id === 'purgeSplash') return 'splash';
  if (id === 'shardSalvage') return 'shard';
  if (id === 'victoryShardBonus') return 'victory';
  if (id === 'shardMagnet') return 'magnet';
  if (id === 'fluxDrive') return 'flux';
  if (id === 'breachDissipation') return 'dissipate';
  if (id === 'leakSealing') return 'seal';
  if (id === 'purgeAmplifier') return 'amplify';
  return getModuleIconBranch(id, branch);
}

export interface ModuleTreeGraphNode {
  id: UpgradeId;
  kind: 'upgrade';
  parentId: TreeParentId;
  position: { x: number; y: number };
  branch: BranchId;
  requires?: UpgradeRequirement[];
}

export interface ModuleNodeLayout {
  id: UpgradeId;
  maxLevel: number;
  costByLevel: readonly number[];
  branch: BranchId;
  requires?: UpgradeRequirement[];
  position: { x: number; y: number };
  parentId: TreeParentId;
}

export interface ModuleNodeDef extends ModuleNodeLayout {
  name: string;
  description: string;
}

const NODE0_BOOT_POS = NODE0_HUB_POSITION;
const SHARD_SALVAGE_POS = positionFromAxial(-1, 0);
const VICTORY_SHARD_BONUS_POS = positionFromAxial(-1, -1);
const SHARD_MAGNET_POS = positionFromAxial(-2, 1);
const PURGE_STRIKE_POS = positionFromParent(NODE0_BOOT_POS, 'up');
const PURGE_AMPLIFIER_POS = positionFromAxial(0, -2);
const THREAD_COOLANT_POS = positionFromParent(NODE0_BOOT_POS, 'downRight');
const PURGE_CADENCE_POS = positionFromParent(PURGE_STRIKE_POS, 'upLeft');
const PURGE_REACH_POS = positionFromAxial(1, 1);
const PURGE_SPLASH_POS = positionFromAxial(1, 2);
const MELTDOWN_THRESHOLD_POS = positionFromAxial(2, -1);
const KILL_BREACH_RELIEF_POS = positionFromAxial(2, -2);
const LATENCY_INJECTION_POS = positionFromAxial(-1, 3);
const OVERCLOCK_POS = positionFromAxial(1, 0);
const FLUX_DRIVE_POS = positionFromAxial(-1, 1);
const BREACH_DISSIPATION_POS = positionFromAxial(3, -1);
const LEAK_SEALING_POS = positionFromAxial(3, -2);

/** Radial module tree — Node-0 Boot root; branches rebuilt incrementally. */
export const MODULE_TREE_GRAPH: ModuleTreeGraphNode[] = [
  {
    id: 'node0Boot',
    kind: 'upgrade',
    parentId: 'root',
    position: NODE0_BOOT_POS,
    branch: 'thermique',
  },
  {
    id: 'meltdownThreshold',
    kind: 'upgrade',
    parentId: 'node0Boot',
    position: THREAD_COOLANT_POS,
    branch: 'thermique',
    requires: requireLevel('node0Boot', 1),
  },
  {
    id: 'shardSalvage',
    kind: 'upgrade',
    parentId: 'node0Boot',
    position: SHARD_SALVAGE_POS,
    branch: 'thermique',
    requires: requireLevel('node0Boot', 1),
  },
  {
    id: 'victoryShardBonus',
    kind: 'upgrade',
    parentId: 'shardSalvage',
    position: VICTORY_SHARD_BONUS_POS,
    branch: 'thermique',
    requires: requireLevel('shardSalvage', 1),
  },
  {
    id: 'shardMagnet',
    kind: 'upgrade',
    parentId: 'shardSalvage',
    position: SHARD_MAGNET_POS,
    branch: 'thermique',
    requires: requireLevel('shardSalvage', 1),
  },
  {
    id: 'purgeStrike',
    kind: 'upgrade',
    parentId: 'node0Boot',
    position: PURGE_STRIKE_POS,
    branch: 'degats',
    requires: requireLevel('node0Boot', 1),
  },
  {
    id: 'purgeAmplifier',
    kind: 'upgrade',
    parentId: 'purgeStrike',
    position: PURGE_AMPLIFIER_POS,
    branch: 'degats',
    requires: requireLevel('purgeStrike', 5),
  },
  {
    id: 'purgeCadence',
    kind: 'upgrade',
    parentId: 'purgeStrike',
    position: PURGE_CADENCE_POS,
    branch: 'degats',
    requires: requireLevel('purgeStrike', 1),
  },
  {
    id: 'purgeReach',
    kind: 'upgrade',
    parentId: 'purgeStrike',
    position: PURGE_REACH_POS,
    branch: 'degats',
    requires: requireLevel('purgeStrike', 1),
  },
  {
    id: 'purgeSplash',
    kind: 'upgrade',
    parentId: 'purgeReach',
    position: PURGE_SPLASH_POS,
    branch: 'degats',
    requires: requireLevel('purgeReach', 1),
  },
  {
    id: 'latencyInjection',
    kind: 'upgrade',
    parentId: 'purgeCadence',
    position: LATENCY_INJECTION_POS,
    branch: 'degats',
    requires: requireLevel('purgeCadence', 1),
  },
  {
    id: 'threadCoolant',
    kind: 'upgrade',
    parentId: 'meltdownThreshold',
    position: MELTDOWN_THRESHOLD_POS,
    branch: 'thermique',
    requires: requireLevel('meltdownThreshold', 1),
  },
  {
    id: 'killBreachRelief',
    kind: 'upgrade',
    parentId: 'meltdownThreshold',
    position: KILL_BREACH_RELIEF_POS,
    branch: 'thermique',
    requires: requireLevel('meltdownThreshold', 1),
  },
  {
    id: 'breachDissipation',
    kind: 'upgrade',
    parentId: 'threadCoolant',
    position: BREACH_DISSIPATION_POS,
    branch: 'thermique',
    requires: requireLevel('threadCoolant', 3),
  },
  {
    id: 'leakSealing',
    kind: 'upgrade',
    parentId: 'killBreachRelief',
    position: LEAK_SEALING_POS,
    branch: 'thermique',
    requires: requireLevel('killBreachRelief', 2),
  },
  {
    id: 'overclock',
    kind: 'upgrade',
    parentId: 'node0Boot',
    position: OVERCLOCK_POS,
    branch: 'degats',
    requires: requireLevel('node0Boot', 1),
  },
  {
    id: 'fluxDrive',
    kind: 'upgrade',
    parentId: 'node0Boot',
    position: FLUX_DRIVE_POS,
    branch: 'thermique',
    requires: requireLevel('node0Boot', 1),
  },
];

export const MODULE_TREE_NODES: ModuleNodeLayout[] = MODULE_TREE_GRAPH.map((node) => {
  const definition = UPGRADE_CATALOG.find((entry) => entry.id === node.id);
  if (!definition) throw new Error(`Missing catalog entry: ${node.id}`);
  return {
    ...definition,
    branch: UPGRADE_BRANCH[node.id],
    requires: node.requires,
    parentId: node.parentId,
    position: node.position,
  };
});

function getParentLevel(
  parentId: TreeParentId,
  upgrades: import('./upgradeCatalog').UpgradeLevels,
): number {
  if (parentId === 'root') return 1;
  return upgrades[parentId as UpgradeId] ?? 0;
}

export function isNodeRevealed(
  node: ModuleTreeGraphNode,
  upgrades: import('./upgradeCatalog').UpgradeLevels,
): boolean {
  if (node.parentId === 'root') return true;

  const parentNode = MODULE_TREE_GRAPH.find((entry) => entry.id === node.parentId);
  if (!parentNode || !isNodeRevealed(parentNode, upgrades)) return false;

  return getParentLevel(node.parentId, upgrades) >= 1;
}

export function getRevealedGraphNodes(
  upgrades: import('./upgradeCatalog').UpgradeLevels,
): ModuleTreeGraphNode[] {
  return MODULE_TREE_GRAPH.filter((node) => isNodeRevealed(node, upgrades));
}

export function getModuleNode(id: UpgradeId): ModuleNodeDef {
  const node = MODULE_TREE_NODES.find((entry) => entry.id === id);
  if (!node) throw new Error(`Unknown module node: ${id}`);
  const localized = getUpgradeDefinition(id);
  return {
    ...node,
    name: localized.name,
    description: localized.description,
  };
}

export function getNodePosition(id: TreeNodeId | 'core'): { x: number; y: number } {
  if (id === 'core') return NODE0_HUB_POSITION;
  const graphNode = MODULE_TREE_GRAPH.find((entry) => entry.id === id);
  if (!graphNode) throw new Error(`Unknown tree node: ${id}`);
  return graphNode.position;
}

export function getParentRequirementLabel(requirements: UpgradeRequirement[] | undefined): string | null {
  if (!requirements || requirements.length === 0) return null;
  const requirement = requirements[0];
  const parent = getUpgradeDefinition(requirement.id);
  return getGameStrings().ui.maxUpgradeToUnlock.replace('{name}', parent.name);
}

export function getUpgradeBranch(id: UpgradeId): BranchId {
  return UPGRADE_BRANCH[id];
}
