import { getUpgradeBranch, type BranchId } from '../../store/moduleTree';
import { getUpgradeDisplay, type UpgradeId } from '../../store/upgradeCatalog';
import { getBranchLabels } from '../../store/moduleTree';

export interface PlanModuleTooltipContent {
  title: string;
  description: string;
  branchLabel: string;
  branch: BranchId;
}

export function getPlanModuleTooltipContent(moduleId: string): PlanModuleTooltipContent | null {
  const definition = getUpgradeDisplay(moduleId as UpgradeId);
  if (!definition) return null;

  const branch = getUpgradeBranch(moduleId as UpgradeId);
  return {
    title: definition.name,
    description: definition.description,
    branchLabel: getBranchLabels()[branch].label,
    branch,
  };
}
