import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';import { pixelToAxial } from '../../store/moduleTreeHexGrid';
import { moveDevModuleTreeDraftEntry } from './devModuleTreeDraft';
import { moveGlobalDraftEntry } from './devModuleTreeGlobalDraft';
import { canPlaceEditorAt } from './moduleTreeEditorOccupancy';
import type { DevModuleTreeEditorMode } from './devModuleTreeEditor';
import {
  clearDevModuleTreeEditorError,
  setDevModuleTreeEditorError,
} from './devModuleTreeEditor';
import type { ModuleTreeEditorDragHover } from './types';

const DRAG_THRESHOLD_PX = 4;

interface PanTransform {
  x: number;
  y: number;
  scale: number;
}

interface DragSession {
  pointerId: number;
  startClientX: number;
  startClientY: number;
}

function clientToAxial(
  clientX: number,
  clientY: number,
  viewportRef: RefObject<HTMLDivElement | null>,
  transform: PanTransform,
): { q: number; r: number } {
  const viewport = viewportRef.current;
  if (!viewport) return { q: 0, r: 0 };

  const rect = viewport.getBoundingClientRect();
  const localX = clientX - rect.left;
  const localY = clientY - rect.top;
  const canvasX = (localX - transform.x) / transform.scale;
  const canvasY = (localY - transform.y) / transform.scale;

  return pixelToAxial(canvasX, canvasY);
}

export function useModuleTreeEditorPointer(
  enabled: boolean,
  mode: DevModuleTreeEditorMode,
  viewportRef: RefObject<HTMLDivElement | null>,
  transform: PanTransform,
) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragHover, setDragHover] = useState<ModuleTreeEditorDragHover | null>(null);

  const transformRef = useRef(transform);
  transformRef.current = transform;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const sessionRef = useRef<DragSession | null>(null);
  const captureElementRef = useRef<Element | null>(null);

  const resetDrag = useCallback(() => {
    setPendingId(null);
    setDraggingId(null);
    setDragHover(null);
    sessionRef.current = null;
    captureElementRef.current = null;
  }, []);

  const startDrag = useCallback(
    (id: string, event: ReactPointerEvent) => {
      if (!enabled || id === 'node0Boot') return;
      event.stopPropagation();
      event.preventDefault();

      const axial = clientToAxial(event.clientX, event.clientY, viewportRef, transformRef.current);
      sessionRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
      };
      captureElementRef.current = event.currentTarget;
      (event.currentTarget as Element).setPointerCapture(event.pointerId);

      setPendingId(id);
      setDraggingId(null);
      setDragHover({
        q: axial.q,
        r: axial.r,
        valid: canPlaceEditorAt(modeRef.current, axial.q, axial.r, id),
      });
      clearDevModuleTreeEditorError();
    },
    [enabled, viewportRef],
  );

  useEffect(() => {
    if (!pendingId && !draggingId) return;

    const activeId = draggingId ?? pendingId;
    if (!activeId || !sessionRef.current) return;

    const onWindowPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== sessionRef.current?.pointerId) return;

      const session = sessionRef.current;
      const moved = Math.hypot(
        event.clientX - session.startClientX,
        event.clientY - session.startClientY,
      );

      if (!draggingId && pendingId && moved >= DRAG_THRESHOLD_PX) {
        setDraggingId(pendingId);
        setPendingId(null);
      }

      const axial = clientToAxial(event.clientX, event.clientY, viewportRef, transformRef.current);
      setDragHover({
        q: axial.q,
        r: axial.r,
        valid: canPlaceEditorAt(modeRef.current, axial.q, axial.r, activeId),
      });
    };

    const finishDrag = (event: PointerEvent) => {
      if (event.pointerId !== sessionRef.current?.pointerId) return;

      const session = sessionRef.current;
      const moved = Math.hypot(
        event.clientX - session.startClientX,
        event.clientY - session.startClientY,
      );
      const id = draggingId ?? pendingId;

      if (id && draggingId) {
        const axial = clientToAxial(event.clientX, event.clientY, viewportRef, transformRef.current);
        const movedOk =
          modeRef.current === 'global'
            ? moveGlobalDraftEntry(id, axial.q, axial.r)
            : moveDevModuleTreeDraftEntry(id, axial.q, axial.r);

        if (!movedOk) {
          setDevModuleTreeEditorError('Case occupée ou Node-0 interdit.');
        } else {
          clearDevModuleTreeEditorError();
        }
      } else if (id && pendingId && moved < DRAG_THRESHOLD_PX) {
        clearDevModuleTreeEditorError();
      }

      try {
        captureElementRef.current?.releasePointerCapture(event.pointerId);
      } catch {
        /* capture may already be released */
      }

      resetDrag();
    };

    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', finishDrag);

    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', finishDrag);
      window.removeEventListener('pointercancel', finishDrag);
    };
  }, [draggingId, pendingId, resetDrag, viewportRef]);

  useEffect(() => {
    if (enabled) return;
    resetDrag();
  }, [enabled, resetDrag]);

  const isPanBlocked = Boolean(pendingId || draggingId);

  return {
    draggingId,
    dragHover: draggingId ? dragHover : null,
    startDrag,
    isDragging: draggingId !== null,
    isPanBlocked,
  };
}
