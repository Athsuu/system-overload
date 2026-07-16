import { getModuleNode, type TreeNodeId } from '../../store/moduleTree';
import { getUpgradeDisplay, type UpgradeId, type UpgradeLevels } from '../../store/upgradeCatalog';
import { MODULE_POPOVER_WIDTH } from './moduleTreePopoverPlacement';
import { getUpgradeTooltipLines } from './upgradeTooltipStats';
import { getModuleTreeTooltipHeight, MODULE_TREE_TOOLTIP_TITLE_ID } from './ModuleTreeTooltip';

export interface ModuleTreePopoverConfig {
  canvasX: number;
  canvasY: number;
  nodeId: TreeNodeId;
  width: number;
  height: number;
  titleId: string;
  upgradeId: UpgradeId;
}

export function resolveModuleTreePopoverConfig(
  selectedId: TreeNodeId | null,
  upgrades: UpgradeLevels,
): ModuleTreePopoverConfig | null {
  if (!selectedId || !getUpgradeDisplay(selectedId)) return null;

  const node = getModuleNode(selectedId);
  const statLines = getUpgradeTooltipLines(selectedId, upgrades);

  return {
    canvasX: node.position.x,
    canvasY: node.position.y,
    nodeId: selectedId,
    width: MODULE_POPOVER_WIDTH,
    height: getModuleTreeTooltipHeight(statLines.length),
    titleId: MODULE_TREE_TOOLTIP_TITLE_ID,
    upgradeId: selectedId,
  };
}
