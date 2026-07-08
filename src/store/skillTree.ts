import {
  getUpgradeDefinition,
  requireLevel,
  UPGRADE_CATALOG,
  type UpgradeId,
  type UpgradeRequirement,
} from './upgradeCatalog';
import { getGameStrings } from '../i18n';

export type BranchId = 'degats' | 'thermique';

export type SkillIconBranch = BranchId | 'flux';

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

export function getSkillIconBranchMeta(): Record<SkillIconBranch, { label: string; color: string }> {
  const labels = getGameStrings().branches;
  return {
    ...getBranchLabels(),
    flux: { label: labels.flux, color: '#38bdf8' },
  };
}

const UPGRADE_BRANCH: Record<UpgradeId, BranchId> = {
  node0Boot: 'thermique',
  purgeStrike: 'degats',
  purgeCadence: 'degats',
  purgeReach: 'degats',
  threadCoolant: 'thermique',
  killBreachRelief: 'thermique',
  meltdownThreshold: 'thermique',
};

const NODE_ICONS: Record<UpgradeId, string> = {
  node0Boot: '0',
  purgeStrike: '↑',
  purgeCadence: '»',
  purgeReach: '◎',
  threadCoolant: '◌',
  killBreachRelief: '◇',
  meltdownThreshold: '▲',
};

const SKILL_ICON_BRANCH: Partial<Record<UpgradeId, SkillIconBranch>> = {
  node0Boot: 'flux',
};

export function getSkillIconBranch(id: UpgradeId, branch: BranchId): SkillIconBranch {
  return SKILL_ICON_BRANCH[id] ?? branch;
}

export interface SkillTreeGraphNode {
  id: UpgradeId;
  kind: 'upgrade';
  parentId: TreeParentId;
  position: { x: number; y: number };
  branch: BranchId;
  requires?: UpgradeRequirement[];
}

export interface SkillNodeLayout {
  id: UpgradeId;
  maxLevel: number;
  costByLevel: readonly number[];
  branch: BranchId;
  icon: string;
  requires?: UpgradeRequirement[];
  position: { x: number; y: number };
  parentId: TreeParentId;
}

export interface SkillNodeDef extends SkillNodeLayout {
  name: string;
  description: string;
}

export interface PlaceholderNodeDef {
  id: string;
  kind: 'placeholder';
  branch: BranchId;
  position: { x: number; y: number };
  parentId: TreeParentId;
}

const NODE0_BOOT_POS = NODE0_HUB_POSITION;
const PURGE_STRIKE_POS = positionFromParent(NODE0_BOOT_POS, 'up');
const THREAD_COOLANT_POS = positionFromParent(NODE0_BOOT_POS, 'downRight');
const PURGE_CADENCE_POS = positionFromParent(PURGE_STRIKE_POS, 'upLeft');
const PURGE_REACH_POS = positionFromAxial(1, 1);
const MELTDOWN_THRESHOLD_POS = positionFromAxial(2, -1);
const KILL_BREACH_RELIEF_POS = positionFromParent(THREAD_COOLANT_POS, 'downRight');

/** Radial skill tree — Node-0 Boot root; branches rebuilt incrementally. */
export const SKILL_TREE_GRAPH: SkillTreeGraphNode[] = [
  {
    id: 'node0Boot',
    kind: 'upgrade',
    parentId: 'root',
    position: NODE0_BOOT_POS,
    branch: 'thermique',
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
    id: 'threadCoolant',
    kind: 'upgrade',
    parentId: 'node0Boot',
    position: THREAD_COOLANT_POS,
    branch: 'thermique',
    requires: requireLevel('node0Boot', 1),
  },
  {
    id: 'meltdownThreshold',
    kind: 'upgrade',
    parentId: 'threadCoolant',
    position: MELTDOWN_THRESHOLD_POS,
    branch: 'thermique',
    requires: requireLevel('threadCoolant', 1),
  },
  {
    id: 'killBreachRelief',
    kind: 'upgrade',
    parentId: 'threadCoolant',
    position: KILL_BREACH_RELIEF_POS,
    branch: 'thermique',
    requires: requireLevel('threadCoolant', 1),
  },
];

export const SKILL_TREE_NODES: SkillNodeLayout[] = SKILL_TREE_GRAPH.map((node) => {
  const definition = UPGRADE_CATALOG.find((entry) => entry.id === node.id);
  if (!definition) throw new Error(`Missing catalog entry: ${node.id}`);
  return {
    ...definition,
    branch: UPGRADE_BRANCH[node.id],
    icon: NODE_ICONS[node.id],
    requires: node.requires,
    parentId: node.parentId,
    position: node.position,
  };
});

export const PLACEHOLDER_NODES: PlaceholderNodeDef[] = [];

function getParentLevel(
  parentId: TreeParentId,
  upgrades: import('./upgradeCatalog').UpgradeLevels,
): number {
  if (parentId === 'root') return 1;
  return upgrades[parentId as UpgradeId] ?? 0;
}

export function isNodeRevealed(
  node: SkillTreeGraphNode,
  upgrades: import('./upgradeCatalog').UpgradeLevels,
): boolean {
  if (node.parentId === 'root') return true;
  return getParentLevel(node.parentId, upgrades) >= 1;
}

export function getRevealedGraphNodes(
  upgrades: import('./upgradeCatalog').UpgradeLevels,
): SkillTreeGraphNode[] {
  return SKILL_TREE_GRAPH.filter((node) => isNodeRevealed(node, upgrades));
}

export function isPlaceholderId(_id: TreeNodeId): _id is never {
  return false;
}

export function getSkillNode(id: UpgradeId): SkillNodeDef {
  const node = SKILL_TREE_NODES.find((entry) => entry.id === id);
  if (!node) throw new Error(`Unknown skill node: ${id}`);
  const localized = getUpgradeDefinition(id);
  return {
    ...node,
    name: localized.name,
    description: localized.description,
  };
}

export function getPlaceholderNode(id: string): PlaceholderNodeDef {
  const node = PLACEHOLDER_NODES.find((entry) => entry.id === id);
  if (!node) throw new Error(`Unknown placeholder: ${id}`);
  return node;
}

export function getNodePosition(id: TreeNodeId | 'core'): { x: number; y: number } {
  if (id === 'core') return NODE0_HUB_POSITION;
  const graphNode = SKILL_TREE_GRAPH.find((entry) => entry.id === id);
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
