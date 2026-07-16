import type { PointerEvent as ReactPointerEvent } from 'react';
import { NODE_RADIUS } from '../../store/moduleTree';
import { hexagonPoints } from './moduleTreeGeometry';
import { getNodeVisualState } from './moduleTreeTheme';

const PLAN_MODULE_STROKE = '#38bdf8';
const PLAN_MODULE_GLOW = 'rgba(56, 189, 248, 0.35)';
const PLAN_MODULE_HIT_RADIUS = NODE_RADIUS + 10;
const DROP_VALID_STROKE = '#22c55e';
const DROP_INVALID_STROKE = '#ef4444';

interface ModuleTreeDraftNodeProps {
  id: string;
  x: number;
  y: number;
  isSelected: boolean;
  kind?: 'placeholder' | 'module';
  /** Conservé pour la taille de police ; le libellé placeholder est toujours P01/P02… */
  displayMode?: 'draft' | 'player';
  isEditorParent?: boolean;
  isDragSource?: boolean;
  isDragGhost?: boolean;
  dropValid?: boolean;
  draggable?: boolean;
  onEditorPickParent?: (parentId: string) => void;
  onEditorLinkParent?: (draftId: string) => void;
  onDelete?: (draftId: string) => void;
  onDragPointerDown?: (id: string, event: ReactPointerEvent) => void;
  planModuleHover?: boolean;
  onPlanModuleHover?: (clientX: number, clientY: number) => void;
  onPlanModuleHoverMove?: (clientX: number, clientY: number) => void;
  onPlanModuleHoverEnd?: () => void;
}

function formatPlanLabel(id: string, kind: 'placeholder' | 'module', _displayMode: 'draft' | 'player'): string {
  // Toujours P01/P02… pour identifier la case (édition + joueur).
  if (kind === 'placeholder') return id.replace('placeholder_', 'P');
  if (id === 'node0Boot') return 'BOOT';
  return id.length > 10 ? `${id.slice(0, 9)}…` : id;
}

export function ModuleTreeDraftNode({
  id,
  x,
  y,
  isSelected,
  kind = 'placeholder',
  displayMode = 'draft',
  isEditorParent = false,
  isDragSource = false,
  isDragGhost = false,
  dropValid = true,
  draggable = false,
  onEditorPickParent,
  onEditorLinkParent,
  onDelete,
  onDragPointerDown,
  planModuleHover = false,
  onPlanModuleHover,
  onPlanModuleHoverMove,
  onPlanModuleHoverEnd,
}: ModuleTreeDraftNodeProps) {
  const isPlanModule = kind === 'module';
  const visual = isPlanModule
    ? {
        ...getNodeVisualState('available', isSelected || isEditorParent, 0),
        stroke: isSelected || isEditorParent ? PLAN_MODULE_STROKE : 'rgba(56, 189, 248, 0.55)',
        strokeWidth: isSelected || isEditorParent ? 2.5 : 1.75,
        glowColor: PLAN_MODULE_GLOW,
        glowOpacity: isSelected || isEditorParent ? 0.45 : 0.2,
        iconFill: '#7dd3fc',
        opacity: 0.95,
      }
    : getNodeVisualState('reserved', isSelected || isEditorParent, 0);

  const label = formatPlanLabel(id, kind, displayMode);
  const deleteX = x + NODE_RADIUS * 0.72;
  const deleteY = y - NODE_RADIUS * 0.72;
  const canDrag = draggable && !isDragGhost;
  const isInteractive = Boolean(onEditorPickParent || onEditorLinkParent || canDrag);
  const showPlanHover = planModuleHover && isPlanModule && !isDragGhost && !isDragSource;
  const needsHitTarget = !isDragGhost && (showPlanHover || isInteractive || canDrag);
  const hitRadius = showPlanHover ? PLAN_MODULE_HIT_RADIUS : NODE_RADIUS;

  const handlePlanHoverPointer = showPlanHover
    ? (event: ReactPointerEvent<SVGPolygonElement>) => {
        onPlanModuleHover?.(event.clientX, event.clientY);
      }
    : undefined;

  const handlePlanHoverMove = showPlanHover
    ? (event: ReactPointerEvent<SVGPolygonElement>) => {
        onPlanModuleHoverMove?.(event.clientX, event.clientY);
      }
    : undefined;

  const handlePointerDown = (event: ReactPointerEvent<SVGPolygonElement>) => {
    if (canDrag && onDragPointerDown) {
      event.stopPropagation();
      onDragPointerDown(id, event);
      return;
    }
    if (onEditorLinkParent) {
      event.stopPropagation();
      onEditorLinkParent(id);
      return;
    }
    if (onEditorPickParent) {
      event.stopPropagation();
      onEditorPickParent(id);
    }
  };

  const ghostStroke = dropValid ? DROP_VALID_STROKE : DROP_INVALID_STROKE;
  const nodeOpacity = isDragGhost ? 0.92 : isDragSource ? 0.3 : visual.opacity;
  const hitCursor = canDrag ? 'grab' : showPlanHover ? 'help' : isInteractive ? 'crosshair' : 'default';

  return (
    <g
      data-module-node
      data-module-draft-node
      data-module-drag-handle={canDrag ? 'true' : undefined}
      style={{ opacity: nodeOpacity, pointerEvents: isDragGhost ? 'none' : undefined }}
    >
      {visual.glowOpacity > 0 && !isDragGhost && (
        <polygon
          points={hexagonPoints(x, y, NODE_RADIUS + 8)}
          fill={visual.glowColor}
          opacity={visual.glowOpacity}
          filter="url(#nodeGlow)"
          style={{ pointerEvents: 'none' }}
        />
      )}

      <polygon
        points={hexagonPoints(x, y, NODE_RADIUS)}
        fill={isPlanModule ? '#0c141c' : '#111118'}
        stroke={isDragGhost ? ghostStroke : visual.stroke}
        strokeWidth={isDragGhost ? 2.5 : visual.strokeWidth}
        strokeDasharray={isDragGhost ? '6 4' : undefined}
        style={{ pointerEvents: 'none' }}
      />

      {needsHitTarget && (
        <polygon
          data-module-plan-hit={showPlanHover ? 'true' : undefined}
          points={hexagonPoints(x, y, hitRadius)}
          fill="transparent"
          stroke="transparent"
          style={{ pointerEvents: 'all', cursor: hitCursor }}
          onPointerEnter={handlePlanHoverPointer}
          onPointerMove={handlePlanHoverMove}
          onPointerLeave={showPlanHover ? () => onPlanModuleHoverEnd?.() : undefined}
          onPointerDown={handlePointerDown}
        />
      )}

      <text
        x={x}
        y={y + (isPlanModule ? 4 : 5)}
        textAnchor="middle"
        fill={isDragGhost ? ghostStroke : visual.iconFill}
        fontSize={isPlanModule ? 11 : displayMode === 'player' ? 11 : 14}
        fontWeight={700}
        fontFamily="Rajdhani, sans-serif"
        letterSpacing={isPlanModule || displayMode === 'player' ? '0.08em' : undefined}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {label}
      </text>

      {onDelete && !isDragGhost && (
        <g
          data-module-draft-delete
          style={{ cursor: 'pointer', pointerEvents: 'all' }}
          onPointerDown={(event) => {
            event.stopPropagation();
            event.preventDefault();
            onDelete(id);
          }}
        >
          <circle cx={deleteX} cy={deleteY} r={11} fill="#1a0a0a" stroke="#ff5533" strokeWidth={1.25} />
          <text
            x={deleteX}
            y={deleteY + 4}
            textAnchor="middle"
            fill="#ff8066"
            fontSize={13}
            fontWeight={700}
            fontFamily="Rajdhani, sans-serif"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            ×
          </text>
          <title>Supprimer ce nœud plan</title>
        </g>
      )}
    </g>
  );
}
