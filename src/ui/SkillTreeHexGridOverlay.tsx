import { useMemo, useState, type PointerEvent } from 'react';
import {
  buildHexGridCells,
  getHexGridCellRadius,
  getHexGridHoverInfo,
  type HexGridHoverInfo,
} from '../store/skillTreeHexGrid';
import { hexagonPoints } from './skillTreeGeometry';

const CELL_RADIUS = getHexGridCellRadius();

interface SkillTreeHexGridOverlayProps {
  onHoverChange: (info: HexGridHoverInfo | null, clientX: number, clientY: number) => void;
}

export function SkillTreeHexGridOverlay({ onHoverChange }: SkillTreeHexGridOverlayProps) {
  const cells = useMemo(() => buildHexGridCells(), []);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const handleHover = (q: number, r: number, active: boolean, event: PointerEvent<SVGPolygonElement>) => {
    const key = `${q},${r}`;
    if (active) {
      setActiveKey(key);
      onHoverChange(getHexGridHoverInfo(q, r), event.clientX, event.clientY);
      return;
    }

    if (activeKey === key) {
      setActiveKey(null);
      onHoverChange(null, event.clientX, event.clientY);
    }
  };

  return (
    <g data-skill-hex-grid aria-hidden>
      {cells.map((cell) => {
        const key = `${cell.q},${cell.r}`;
        const isActive = activeKey === key;
        const isOrigin = cell.q === 0 && cell.r === 0;

        return (
          <polygon
            key={key}
            points={hexagonPoints(cell.x, cell.y, CELL_RADIUS)}
            fill={isActive ? 'rgba(56, 189, 248, 0.14)' : isOrigin ? 'rgba(197, 160, 89, 0.08)' : 'transparent'}
            stroke={isActive ? 'rgba(56, 189, 248, 0.75)' : 'rgba(56, 189, 248, 0.22)'}
            strokeWidth={isActive ? 1.5 : 1}
            style={{ pointerEvents: 'all', cursor: 'crosshair' }}
            onPointerEnter={(event) => handleHover(cell.q, cell.r, true, event)}
            onPointerMove={(event) => handleHover(cell.q, cell.r, true, event)}
            onPointerLeave={(event) => handleHover(cell.q, cell.r, false, event)}
          />
        );
      })}
    </g>
  );
}
