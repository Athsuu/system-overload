import { memo, useMemo, useState, type PointerEvent } from 'react';
import {
  buildHexGridCells,
  buildHexGridOccupancy,
  getHexGridCellRadius,
  getHexGridHoverInfo,
  HEX_GRID_EDITOR_RING_RADIUS,
  HEX_GRID_RING_RADIUS,
  type HexGridHoverInfo,
} from '../../store/moduleTreeHexGrid';
import {
  getParentAxial,
  type DevModuleTreeDraftEntry,
  type DraftParentId,
} from '../../dev/moduleTreeEditor/devModuleTreeDraft';
import { hexagonPoints } from './moduleTreeGeometry';

const CELL_RADIUS = getHexGridCellRadius();

interface ModuleTreeHexGridOverlayProps {
  editorMode?: boolean;
  selectedParentId?: DraftParentId | null;
  editorLinkMode?: boolean;
  drafts?: readonly DevModuleTreeDraftEntry[];
  onHoverChange: (info: HexGridHoverInfo | null, clientX: number, clientY: number) => void;
  onCellClick?: (q: number, r: number) => void;
}

export const ModuleTreeHexGridOverlay = memo(function ModuleTreeHexGridOverlay({
  editorMode = false,
  selectedParentId = null,
  editorLinkMode = false,
  drafts = [],
  onHoverChange,
  onCellClick,
}: ModuleTreeHexGridOverlayProps) {
  const ringRadius = editorMode ? HEX_GRID_EDITOR_RING_RADIUS : HEX_GRID_RING_RADIUS;
  const cells = useMemo(() => buildHexGridCells(ringRadius), [ringRadius]);
  const { occupied: occupiedKeys, draftCells: draftOccupiedKeys } = useMemo(
    () => buildHexGridOccupancy(drafts),
    [drafts],
  );
  const parentAxial = useMemo(
    () => (selectedParentId ? getParentAxial(selectedParentId) : null),
    [selectedParentId],
  );
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const hoverOptions = useMemo(
    () => ({
      drafts,
      selectedParentId,
      parentAxial,
    }),
    [drafts, parentAxial, selectedParentId],
  );

  const handleHover = (q: number, r: number, active: boolean, event: PointerEvent<SVGPolygonElement>) => {
    const key = `${q},${r}`;
    if (active) {
      if (activeKey !== key) setActiveKey(key);
      onHoverChange(getHexGridHoverInfo(q, r, hoverOptions), event.clientX, event.clientY);
      return;
    }

    if (activeKey === key) {
      setActiveKey(null);
      onHoverChange(null, event.clientX, event.clientY);
    }
  };

  const handleClick = (q: number, r: number, event: PointerEvent<SVGPolygonElement>) => {
    if (!editorMode || !onCellClick) return;
    event.stopPropagation();
    event.preventDefault();
    onCellClick(q, r);
  };

  return (
    <g data-module-hex-grid aria-hidden>
      {cells.map((cell) => {
        const key = `${cell.q},${cell.r}`;
        const isActive = activeKey === key;
        const isOrigin = cell.q === 0 && cell.r === 0;
        const isOccupied = occupiedKeys.has(key);
        const isParentCell =
          parentAxial !== null && parentAxial.q === cell.q && parentAxial.r === cell.r;
        const isLinkTarget = editorLinkMode && draftOccupiedKeys.has(key);
        const isBlocked = isOccupied && !isLinkTarget;

        let fill = 'transparent';
        let stroke = 'rgba(56, 189, 248, 0.22)';

        if (isParentCell) {
          fill = 'rgba(197, 160, 89, 0.18)';
          stroke = 'rgba(197, 160, 89, 0.75)';
        } else if (isLinkTarget) {
          fill = 'rgba(197, 160, 89, 0.1)';
          stroke = 'rgba(197, 160, 89, 0.55)';
        } else if (isOccupied) {
          fill = 'rgba(255, 77, 0, 0.12)';
          stroke = 'rgba(255, 77, 0, 0.45)';
        } else if (isOrigin) {
          fill = 'rgba(197, 160, 89, 0.08)';
        }

        if (isActive) {
          fill = isBlocked && !editorMode ? fill : 'rgba(56, 189, 248, 0.14)';
          stroke = 'rgba(56, 189, 248, 0.85)';
        }

        return (
          <polygon
            key={key}
            points={hexagonPoints(cell.x, cell.y, CELL_RADIUS)}
            fill={fill}
            stroke={stroke}
            strokeWidth={isActive ? 1.5 : 1}
            style={{
              pointerEvents: 'all',
              cursor: editorMode ? (isBlocked ? 'not-allowed' : 'crosshair') : 'crosshair',
            }}
            onPointerEnter={(event) => handleHover(cell.q, cell.r, true, event)}
            onPointerLeave={(event) => handleHover(cell.q, cell.r, false, event)}
            onPointerDown={(event) => handleClick(cell.q, cell.r, event)}
          />
        );
      })}
    </g>
  );
});
