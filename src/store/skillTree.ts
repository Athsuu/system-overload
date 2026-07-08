import {
  getUpgradeDefinition,
  requireLevel,
  UPGRADE_CATALOG,
  type UpgradeId,
  type UpgradeRequirement,
} from './upgradeCatalog';
import { getGameStrings } from '../i18n';

export type BranchId =
  | 'attackSpeed'
  | 'degats'
  | 'thermique'
  | 'purgeAoe'
  | 'shards'
  | 'enemies';

export type SkillIconBranch = BranchId | 'flux';

export type PlaceholderId =
  | 'placeholder_01'
  | 'placeholder_02'
  | 'placeholder_03'
  | 'placeholder_04'
  | 'placeholder_05'
  | 'placeholder_06'
  | 'placeholder_07'
  | 'placeholder_08'
  | 'placeholder_09'
  | 'placeholder_10'
  | 'placeholder_11'
  | 'placeholder_12'
  | 'placeholder_13'
  | 'placeholder_14'
  | 'placeholder_15';

export type TreeNodeId = UpgradeId | PlaceholderId;
export type TreeParentId = 'root' | TreeNodeId;

export const TREE_CANVAS = { width: 2000, height: 1200 };
export const HEX_CELL = 90;
export const NODE_RADIUS = 51;
export const NODE0_HUB_RADIUS = 84;
export const NODE_SIZE = NODE_RADIUS * Math.sqrt(3);

export const NODE0_HUB_POSITION = { x: 1000, y: 600 };

const BRANCH_COLORS: Record<BranchId, string> = {
  attackSpeed: '#e8b896',
  degats: '#ef4444',
  thermique: '#f97316',
  purgeAoe: '#4ade80',
  shards: '#c5a059',
  enemies: '#9ca3af',
};

export function getBranchLabels(): Record<BranchId, { label: string; color: string }> {
  const labels = getGameStrings().branches;
  return {
    attackSpeed: { label: labels.attackSpeed, color: BRANCH_COLORS.attackSpeed },
    degats: { label: labels.degats, color: BRANCH_COLORS.degats },
    thermique: { label: labels.thermique, color: BRANCH_COLORS.thermique },
    purgeAoe: { label: labels.purgeAoe, color: BRANCH_COLORS.purgeAoe },
    shards: { label: labels.shards, color: BRANCH_COLORS.shards },
    enemies: { label: labels.enemies, color: BRANCH_COLORS.enemies },
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
  threadCoolant: 'thermique',
  killBreachRelief: 'thermique',
};

const NODE_ICONS: Record<UpgradeId, string> = {
  node0Boot: '0',
  purgeStrike: '↑',
  threadCoolant: '◌',
  killBreachRelief: '◇',
};

const SKILL_ICON_BRANCH: Partial<Record<UpgradeId, SkillIconBranch>> = {
  node0Boot: 'flux',
};

export function getSkillIconBranch(id: UpgradeId, branch: BranchId): SkillIconBranch {
  return SKILL_ICON_BRANCH[id] ?? branch;
}

export interface SkillTreeGraphNode {
  id: TreeNodeId;
  kind: 'upgrade' | 'placeholder';
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
  id: PlaceholderId;
  kind: 'placeholder';
  branch: BranchId;
  position: { x: number; y: number };
  parentId: TreeParentId;
}

const CX = NODE0_HUB_POSITION.x;
const CY = NODE0_HUB_POSITION.y;

/** Radial skill tree — Node-0 Boot root; branches rebuilt incrementally. */
export const SKILL_TREE_GRAPH: SkillTreeGraphNode[] = [
  {
    id: 'node0Boot',
    kind: 'upgrade',
    parentId: 'root',
    position: { x: CX, y: CY },
    branch: 'thermique',
  },
  {
    id: 'purgeStrike',
    kind: 'upgrade',
    parentId: 'node0Boot',
    position: { x: CX, y: CY - 200 },
    branch: 'degats',
    requires: requireLevel('node0Boot', 1),
  },
  {
    id: 'threadCoolant',
    kind: 'upgrade',
    parentId: 'node0Boot',
    position: { x: CX + 200, y: CY },
    branch: 'thermique',
    requires: requireLevel('node0Boot', 1),
  },
  {
    id: 'placeholder_01',
    kind: 'placeholder',
    parentId: 'threadCoolant',
    position: { x: CX + 300, y: CY - 100 },
    branch: 'thermique',
  },
  {
    id: 'killBreachRelief',
    kind: 'upgrade',
    parentId: 'threadCoolant',
    position: { x: CX + 300, y: CY + 100 },
    branch: 'thermique',
    requires: requireLevel('threadCoolant', 1),
  },
];

export const SKILL_TREE_NODES: SkillNodeLayout[] = SKILL_TREE_GRAPH.filter(
  (node): node is SkillTreeGraphNode & { id: UpgradeId; kind: 'upgrade' } => node.kind === 'upgrade',
).map((node) => {
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

export const PLACEHOLDER_NODES: PlaceholderNodeDef[] = SKILL_TREE_GRAPH.filter(
  (node): node is SkillTreeGraphNode & { id: PlaceholderId; kind: 'placeholder' } =>
    node.kind === 'placeholder',
).map((node) => ({
  id: node.id,
  kind: 'placeholder',
  branch: node.branch,
  position: node.position,
  parentId: node.parentId,
}));

function getParentLevel(
  parentId: TreeParentId,
  upgrades: import('./upgradeCatalog').UpgradeLevels,
): number {
  if (parentId === 'root') return 1;
  if (parentId.startsWith('placeholder_')) return 0;
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

export function isPlaceholderId(id: TreeNodeId): id is PlaceholderId {
  return id.startsWith('placeholder_');
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

export function getPlaceholderNode(id: PlaceholderId): PlaceholderNodeDef {
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
