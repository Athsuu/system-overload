import {
  HEX_FLAT_DIRECTIONS,
  NODE0_HUB_POSITION,
  positionFromAxial,
  MODULE_TREE_GRAPH,
  type HexFlatDirection,
} from './moduleTree';
import { MODULE_TREE_PLACEHOLDERS } from './moduleTreePlaceholders';
import type { UpgradeId } from './upgradeCatalog';

/** Center-to-center step — matches HEX_FLAT_DIRECTIONS.up.dy magnitude. */
export const HEX_GRID_STEP = 200;

export const HEX_GRID_ORIGIN = NODE0_HUB_POSITION;

/** Hex rings drawn around Node-0 when the dev grid is visible. */
export const HEX_GRID_RING_RADIUS = 5;
export const HEX_GRID_EDITOR_RING_RADIUS = 8;

export interface AxialCoord {
  q: number;
  r: number;
}

export interface HexGridCell {
  q: number;
  r: number;
  x: number;
  y: number;
}

const AXIAL_BY_DIRECTION: Record<HexFlatDirection, AxialCoord> = {
  up: { q: 0, r: -1 },
  upRight: { q: 1, r: -1 },
  downRight: { q: 1, r: 0 },
  down: { q: 0, r: 1 },
  downLeft: { q: -1, r: 1 },
  upLeft: { q: -1, r: 0 },
};

const DIRECTION_LABEL_FR: Record<HexFlatDirection, string> = {
  up: 'haut',
  upRight: 'haut-droite',
  downRight: 'bas-droite',
  down: 'bas',
  downLeft: 'bas-gauche',
  upLeft: 'haut-gauche',
};

function axialKey(q: number, r: number): string {
  return `${q},${r}`;
}

function cubeRound(q: number, r: number): AxialCoord {
  const x = q;
  const z = r;
  const y = -x - z;

  let rx = Math.round(x);
  let ry = Math.round(y);
  let rz = Math.round(z);

  const xDiff = Math.abs(rx - x);
  const yDiff = Math.abs(ry - y);
  const zDiff = Math.abs(rz - z);

  if (xDiff > yDiff && xDiff > zDiff) {
    rx = -ry - rz;
  } else if (yDiff > zDiff) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }

  return { q: rx, r: rz };
}

/** Flat-top hex lattice aligned with HEX_FLAT_DIRECTIONS. */
export function axialToPixel(q: number, r: number, origin = HEX_GRID_ORIGIN): { x: number; y: number } {
  return positionFromAxial(q, r, origin);
}

export function pixelToAxial(x: number, y: number, origin = HEX_GRID_ORIGIN): AxialCoord {
  const { dx: diagX, dy: diagY } = HEX_FLAT_DIRECTIONS.upRight;
  const { dy: verticalStep } = HEX_FLAT_DIRECTIONS.up;
  const localX = x - origin.x;
  const localY = y - origin.y;
  const q = localX / diagX;
  const r = (localY - diagY * q) / verticalStep;
  return cubeRound(q, r);
}

export function axialDistance(a: AxialCoord, b: AxialCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.q + a.r - b.q - b.r)) / 2;
}

export function formatHexCoord(q: number, r: number): string {
  const fmt = (value: number) => (value > 0 ? `+${value}` : String(value));
  return `hex (${fmt(q)}, ${fmt(r)})`;
}

function findPathSteps(from: AxialCoord, to: AxialCoord): HexFlatDirection[] | null {
  if (from.q === to.q && from.r === to.r) return [];

  const queue: { q: number; r: number; steps: HexFlatDirection[] }[] = [
    { q: from.q, r: from.r, steps: [] },
  ];
  const visited = new Set<string>([axialKey(from.q, from.r)]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.q === to.q && current.r === to.r) return current.steps;

    for (const [direction, delta] of Object.entries(AXIAL_BY_DIRECTION) as [
      HexFlatDirection,
      AxialCoord,
    ][]) {
      const nextQ = current.q + delta.q;
      const nextR = current.r + delta.r;
      const key = axialKey(nextQ, nextR);
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push({ q: nextQ, r: nextR, steps: [...current.steps, direction] });
    }
  }

  return null;
}

export function formatPathFromNode0(q: number, r: number): string {
  const steps = findPathSteps({ q: 0, r: 0 }, { q, r });
  if (!steps || steps.length === 0) return 'node0';
  return `node0 → ${steps.map((step) => DIRECTION_LABEL_FR[step]).join(' → ')}`;
}

export function formatPathFromModule(
  moduleId: UpgradeId,
  moduleAxial: AxialCoord,
  target: AxialCoord,
): string | null {
  const steps = findPathSteps(moduleAxial, target);
  if (!steps || steps.length === 0) return null;
  return `${moduleId} → ${steps.map((step) => DIRECTION_LABEL_FR[step]).join(' → ')}`;
}

const MODULE_AXIAL_BY_ID = (() => {
  const map = new Map<UpgradeId, AxialCoord>();
  for (const node of MODULE_TREE_GRAPH) {
    const axial = pixelToAxial(node.position.x, node.position.y);
    map.set(node.id, axial);
  }
  return map;
})();

export function getModuleAtAxial(q: number, r: number): UpgradeId | null {
  for (const [id, axial] of MODULE_AXIAL_BY_ID) {
    if (axial.q === q && axial.r === r) return id;
  }
  return null;
}

export function getNearestModulePathLabel(q: number, r: number): string | null {
  const target = { q, r };
  let best: { id: UpgradeId; steps: HexFlatDirection[] } | null = null;

  for (const [id, axial] of MODULE_AXIAL_BY_ID) {
    const steps = findPathSteps(axial, target);
    if (!steps || steps.length === 0) continue;
    if (!best || steps.length < best.steps.length) {
      best = { id, steps };
    }
  }

  if (!best) return null;
  return `${best.id} → ${best.steps.map((step) => DIRECTION_LABEL_FR[step]).join(' → ')}`;
}

export function formatPathFromParentAxial(
  parentAxial: AxialCoord,
  parentLabel: string,
  target: AxialCoord,
): string | null {
  const steps = findPathSteps(parentAxial, target);
  if (!steps || steps.length === 0) return null;
  return `${parentLabel} → ${steps.map((step) => DIRECTION_LABEL_FR[step]).join(' → ')}`;
}

export function getDraftAtAxial(
  q: number,
  r: number,
  drafts: ReadonlyArray<{ id: string; q: number; r: number }>,
): string | null {
  for (const draft of drafts) {
    if (draft.q === q && draft.r === r) return draft.id;
  }
  return null;
}

/** Fast occupancy lookup for hex grid rendering (modules + drafts + Node-0). */
export interface HexGridOccupancy {
  occupied: Set<string>;
  draftCells: Set<string>;
}

export function buildHexGridOccupancy(
  drafts: ReadonlyArray<{ q: number; r: number }> = [],
  includeProductionModules = true,
): HexGridOccupancy {
  const occupied = new Set<string>([axialKey(0, 0)]);
  const draftCells = new Set<string>();

  if (includeProductionModules) {
    for (const axial of MODULE_AXIAL_BY_ID.values()) {
      occupied.add(axialKey(axial.q, axial.r));
    }
    for (const placeholder of MODULE_TREE_PLACEHOLDERS) {
      occupied.add(axialKey(placeholder.q, placeholder.r));
    }
  }

  for (const draft of drafts) {
    const key = axialKey(draft.q, draft.r);
    occupied.add(key);
    draftCells.add(key);
  }

  return { occupied, draftCells };
}

export interface HexGridHoverInfo {
  q: number;
  r: number;
  coordLabel: string;
  pathFromNode0: string;
  pathFromNearestModule: string | null;
  pathFromSelectedParent: string | null;
  occupantId: UpgradeId | null;
  draftOccupantId: string | null;
  isOccupied: boolean;
  isOrigin: boolean;
}

export function getHexGridHoverInfo(
  q: number,
  r: number,
  options?: {
    drafts?: ReadonlyArray<{ id: string; q: number; r: number }>;
    selectedParentId?: string | null;
    parentAxial?: AxialCoord | null;
    includeProductionModules?: boolean;
  },
): HexGridHoverInfo {
  const drafts = options?.drafts ?? [];
  const includeProduction = options?.includeProductionModules ?? true;
  const draftOccupantId = getDraftAtAxial(q, r, drafts);
  const occupantId = includeProduction ? getModuleAtAxial(q, r) : null;
  const isOrigin = q === 0 && r === 0;
  const isOccupied = isOrigin || occupantId !== null || draftOccupantId !== null;

  let pathFromSelectedParent: string | null = null;
  if (options?.selectedParentId && options.parentAxial) {
    pathFromSelectedParent = formatPathFromParentAxial(
      options.parentAxial,
      options.selectedParentId,
      { q, r },
    );
  }

  return {
    q,
    r,
    coordLabel: formatHexCoord(q, r),
    pathFromNode0: formatPathFromNode0(q, r),
    pathFromNearestModule: getNearestModulePathLabel(q, r),
    pathFromSelectedParent,
    occupantId,
    draftOccupantId,
    isOccupied,
    isOrigin,
  };
}

export function buildHexGridCells(ringRadius = HEX_GRID_RING_RADIUS): HexGridCell[] {
  const cells: HexGridCell[] = [];

  for (let q = -ringRadius; q <= ringRadius; q += 1) {
    for (let r = -ringRadius; r <= ringRadius; r += 1) {
      if (axialDistance({ q: 0, r: 0 }, { q, r }) > ringRadius) continue;
      const { x, y } = axialToPixel(q, r);
      cells.push({ q, r, x, y });
    }
  }

  return cells;
}

/** Visual radius — half the flat-edge step so adjacent cells share edges. */
export function getHexGridCellRadius(): number {
  return HEX_GRID_STEP / 2;
}
