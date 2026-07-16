import { MODULE_TREE_GRAPH } from '../../store/moduleTree';
import { MODULE_TREE_PLACEHOLDERS } from '../../store/moduleTreePlaceholders';
import { pixelToAxial, type HexGridOccupancy } from '../../store/moduleTreeHexGrid';
import type { DevModuleTreeEditorMode } from './devModuleTreeEditor';
import { getDevModuleTreeDraft } from './devModuleTreeDraft';
import { getDevModuleTreeGlobalDraft } from './devModuleTreeGlobalDraft';

function cellKey(q: number, r: number): string {
  return `${q},${r}`;
}

function buildEditorOccupancy(
  mode: DevModuleTreeEditorMode,
  options?: { excludeId?: string },
): HexGridOccupancy {
  const occupied = new Set<string>([cellKey(0, 0)]);
  const draftCells = new Set<string>();
  const excludeId = options?.excludeId;

  if (mode === 'global') {
    for (const entry of getDevModuleTreeGlobalDraft()) {
      if (entry.id === excludeId) continue;
      const key = cellKey(entry.q, entry.r);
      occupied.add(key);
      if (entry.kind === 'placeholder') draftCells.add(key);
    }
    return { occupied, draftCells };
  }

  for (const node of MODULE_TREE_GRAPH) {
    const axial = pixelToAxial(node.position.x, node.position.y);
    occupied.add(cellKey(axial.q, axial.r));
  }
  for (const placeholder of MODULE_TREE_PLACEHOLDERS) {
    occupied.add(cellKey(placeholder.q, placeholder.r));
  }
  for (const entry of getDevModuleTreeDraft()) {
    if (entry.id === excludeId) continue;
    const key = cellKey(entry.q, entry.r);
    occupied.add(key);
    draftCells.add(key);
  }

  return { occupied, draftCells };
}

export function canPlaceEditorAt(
  mode: DevModuleTreeEditorMode,
  q: number,
  r: number,
  excludeId?: string,
): boolean {
  if (q === 0 && r === 0) return false;
  const { occupied } = buildEditorOccupancy(mode, { excludeId });
  return !occupied.has(cellKey(q, r));
}
