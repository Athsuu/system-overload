import {
  getUpgradeDefinition,
  requireMax,
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
export const NODE_RADIUS = 34;
export const NODE0_HUB_RADIUS = 56;
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
  fireRate: 'attackSpeed',
  boltDamage: 'degats',
  damageAmp: 'degats',
  coolingPower: 'thermique',
  heatShield: 'thermique',
  fluxThrottle: 'thermique',
  criticalThreshold: 'thermique',
  overclock: 'purgeAoe',
  purgeReach: 'purgeAoe',
  fluxDrive: 'purgeAoe',
  nodeReach: 'purgeAoe',
  killBonus: 'shards',
  shardYield: 'shards',
  starterNodes: 'enemies',
  spawnThrottle: 'enemies',
  containment: 'enemies',
};

const NODE_ICONS: Record<UpgradeId, string> = {
  node0Boot: '0',
  fireRate: 'S',
  boltDamage: 'D',
  damageAmp: '+',
  coolingPower: 'T',
  heatShield: 'B',
  fluxThrottle: 'F',
  criticalThreshold: 'H',
  nodeReach: 'P',
  purgeReach: 'V',
  fluxDrive: 'F',
  killBonus: 'K',
  shardYield: 'Y',
  starterNodes: 'R',
  spawnThrottle: 'W',
  containment: 'C',
  overclock: 'OC',
};

const SKILL_ICON_BRANCH: Partial<Record<UpgradeId, SkillIconBranch>> = {
  fluxDrive: 'flux',
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
const R1 = 118;
const R2 = 228;
const R3 = 338;
const R4 = 448;

function polar(dx: number, dy: number): { x: number; y: number } {
  return { x: CX + dx, y: CY + dy };
}

/** Radial skill tree v4 — single root `node0Boot`, children revealed at parent level >= 1. */
export const SKILL_TREE_GRAPH: SkillTreeGraphNode[] = [
  {
    id: 'node0Boot',
    kind: 'upgrade',
    parentId: 'root',
    position: { x: CX, y: CY },
    branch: 'thermique',
  },
  {
    id: 'fireRate',
    kind: 'upgrade',
    parentId: 'node0Boot',
    position: polar(0, -R1),
    branch: 'attackSpeed',
    requires: requireMax('node0Boot'),
  },
  {
    id: 'boltDamage',
    kind: 'upgrade',
    parentId: 'node0Boot',
    position: polar(R1 * 0.87, -R1 * 0.5),
    branch: 'degats',
    requires: requireMax('node0Boot'),
  },
  {
    id: 'coolingPower',
    kind: 'upgrade',
    parentId: 'node0Boot',
    position: polar(R1 * 0.87, R1 * 0.5),
    branch: 'thermique',
    requires: requireMax('node0Boot'),
  },
  {
    id: 'overclock',
    kind: 'upgrade',
    parentId: 'node0Boot',
    position: polar(-R1 * 0.87, -R1 * 0.5),
    branch: 'purgeAoe',
    requires: requireMax('node0Boot'),
  },
  {
    id: 'killBonus',
    kind: 'upgrade',
    parentId: 'node0Boot',
    position: polar(-R1 * 0.87, R1 * 0.5),
    branch: 'shards',
    requires: requireMax('node0Boot'),
  },
  {
    id: 'starterNodes',
    kind: 'upgrade',
    parentId: 'node0Boot',
    position: polar(0, R1),
    branch: 'enemies',
    requires: requireMax('node0Boot'),
  },
  {
    id: 'damageAmp',
    kind: 'upgrade',
    parentId: 'fireRate',
    position: polar(0, -R2),
    branch: 'degats',
    requires: requireMax('fireRate'),
  },
  {
    id: 'nodeReach',
    kind: 'upgrade',
    parentId: 'boltDamage',
    position: polar(R2 * 0.87, -R2 * 0.5),
    branch: 'purgeAoe',
    requires: requireMax('boltDamage'),
  },
  {
    id: 'heatShield',
    kind: 'upgrade',
    parentId: 'coolingPower',
    position: polar(R2 * 0.87, R2 * 0.5),
    branch: 'thermique',
    requires: requireMax('coolingPower'),
  },
  {
    id: 'purgeReach',
    kind: 'upgrade',
    parentId: 'overclock',
    position: polar(-R2 * 0.87, -R2 * 0.5),
    branch: 'purgeAoe',
    requires: requireMax('overclock'),
  },
  {
    id: 'shardYield',
    kind: 'upgrade',
    parentId: 'killBonus',
    position: polar(-R2 * 0.87, R2 * 0.5),
    branch: 'shards',
    requires: requireMax('killBonus'),
  },
  {
    id: 'spawnThrottle',
    kind: 'upgrade',
    parentId: 'starterNodes',
    position: polar(0, R2),
    branch: 'enemies',
    requires: requireMax('starterNodes'),
  },
  {
    id: 'placeholder_01',
    kind: 'placeholder',
    parentId: 'damageAmp',
    position: polar(60, -R3),
    branch: 'degats',
  },
  {
    id: 'placeholder_02',
    kind: 'placeholder',
    parentId: 'nodeReach',
    position: polar(R3 * 0.87, -R3 * 0.5),
    branch: 'purgeAoe',
  },
  {
    id: 'fluxThrottle',
    kind: 'upgrade',
    parentId: 'heatShield',
    position: polar(R3 * 0.5, R3 * 0.87),
    branch: 'thermique',
    requires: requireMax('heatShield'),
  },
  {
    id: 'fluxDrive',
    kind: 'upgrade',
    parentId: 'purgeReach',
    position: polar(-R3 * 0.87, -R3 * 0.5),
    branch: 'purgeAoe',
    requires: requireMax('purgeReach'),
  },
  {
    id: 'placeholder_03',
    kind: 'placeholder',
    parentId: 'shardYield',
    position: polar(-R3, R3 * 0.3),
    branch: 'shards',
  },
  {
    id: 'containment',
    kind: 'upgrade',
    parentId: 'spawnThrottle',
    position: polar(0, R3),
    branch: 'enemies',
    requires: requireMax('spawnThrottle'),
  },
  {
    id: 'placeholder_04',
    kind: 'placeholder',
    parentId: 'damageAmp',
    position: polar(-50, -R3 + 20),
    branch: 'attackSpeed',
  },
  {
    id: 'placeholder_05',
    kind: 'placeholder',
    parentId: 'fluxThrottle',
    position: polar(R3 * 0.9, R3 * 0.45),
    branch: 'thermique',
  },
  {
    id: 'criticalThreshold',
    kind: 'upgrade',
    parentId: 'fluxThrottle',
    position: polar(R3 * 0.55, R3 * 0.95),
    branch: 'thermique',
    requires: requireMax('fluxThrottle'),
  },
  {
    id: 'placeholder_06',
    kind: 'placeholder',
    parentId: 'fluxDrive',
    position: polar(-R3, -R3 * 0.35),
    branch: 'purgeAoe',
  },
  {
    id: 'placeholder_07',
    kind: 'placeholder',
    parentId: 'containment',
    position: polar(70, R3 + 40),
    branch: 'enemies',
  },
  {
    id: 'placeholder_08',
    kind: 'placeholder',
    parentId: 'containment',
    position: polar(-70, R3 + 40),
    branch: 'enemies',
  },
  {
    id: 'placeholder_09',
    kind: 'placeholder',
    parentId: 'placeholder_01',
    position: polar(120, -R4),
    branch: 'degats',
  },
  {
    id: 'placeholder_10',
    kind: 'placeholder',
    parentId: 'placeholder_02',
    position: polar(R4 * 0.87, -R4 * 0.5),
    branch: 'purgeAoe',
  },
  {
    id: 'placeholder_11',
    kind: 'placeholder',
    parentId: 'placeholder_03',
    position: polar(-R4, R4 * 0.35),
    branch: 'shards',
  },
  {
    id: 'placeholder_12',
    kind: 'placeholder',
    parentId: 'criticalThreshold',
    position: polar(R4 * 0.6, R4 * 0.9),
    branch: 'thermique',
  },
  {
    id: 'placeholder_13',
    kind: 'placeholder',
    parentId: 'placeholder_06',
    position: polar(-R4, -R4 * 0.4),
    branch: 'purgeAoe',
  },
  {
    id: 'placeholder_14',
    kind: 'placeholder',
    parentId: 'placeholder_07',
    position: polar(130, R4),
    branch: 'enemies',
  },
  {
    id: 'placeholder_15',
    kind: 'placeholder',
    parentId: 'placeholder_08',
    position: polar(-130, R4),
    branch: 'enemies',
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
