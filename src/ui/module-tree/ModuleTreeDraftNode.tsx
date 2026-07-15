import { NODE_RADIUS } from '../../store/moduleTree';
import { hexagonPoints } from './moduleTreeGeometry';
import { getNodeVisualState } from './moduleTreeTheme';

interface ModuleTreeDraftNodeProps {
  id: string;
  x: number;
  y: number;
  isSelected: boolean;
  isEditorParent?: boolean;
  onEditorPickParent?: (parentId: string) => void;
  onEditorLinkParent?: (draftId: string) => void;
  onDelete?: (draftId: string) => void;
}

export function ModuleTreeDraftNode({
  id,
  x,
  y,
  isSelected,
  isEditorParent = false,
  onEditorPickParent,
  onEditorLinkParent,
  onDelete,
}: ModuleTreeDraftNodeProps) {
  const visual = getNodeVisualState('reserved', isSelected || isEditorParent, 0);
  const label = id.replace('placeholder_', 'P');
  const deleteX = x + NODE_RADIUS * 0.72;
  const deleteY = y - NODE_RADIUS * 0.72;
  const isInteractive = Boolean(onEditorPickParent || onEditorLinkParent);

  return (
    <g data-module-node data-module-draft-node style={{ opacity: visual.opacity }}>
      {visual.glowOpacity > 0 && (
        <polygon
          points={hexagonPoints(x, y, NODE_RADIUS + 8)}
          fill={visual.glowColor}
          opacity={visual.glowOpacity}
          filter="url(#nodeGlow)"
        />
      )}
      <polygon
        points={hexagonPoints(x, y, NODE_RADIUS)}
        fill="#111118"
        stroke={visual.stroke}
        strokeWidth={visual.strokeWidth}
        style={{
          cursor: isInteractive ? 'crosshair' : 'default',
          pointerEvents: 'all',
        }}
        onPointerDown={(event) => {
          if (onEditorLinkParent) {
            event.stopPropagation();
            onEditorLinkParent(id);
            return;
          }
          if (!onEditorPickParent) return;
          event.stopPropagation();
          onEditorPickParent(id);
        }}
      />
      <text
        x={x}
        y={y + 5}
        textAnchor="middle"
        fill={visual.iconFill}
        fontSize={14}
        fontWeight={700}
        fontFamily="Rajdhani, sans-serif"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {label}
      </text>

      {onDelete && (
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
          <title>Supprimer ce placeholder</title>
        </g>
      )}

      <title>{id} (brouillon dev)</title>
    </g>
  );
}
