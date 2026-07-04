import { useCallback, useEffect, useRef, useState } from 'react';
import { CORE_POSITION, TREE_CANVAS } from '../store/skillTree';

const VIEWPORT_STORAGE_KEY = 'system-overload-tree-viewport';

const MIN_SCALE = 0.45;
const MAX_SCALE = 2;
const ZOOM_STEP = 0.12;

interface ViewportTransform {
  x: number;
  y: number;
  scale: number;
}

function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function loadViewportTransform(): ViewportTransform | null {
  try {
    const raw = sessionStorage.getItem(VIEWPORT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ViewportTransform>;
    if (
      typeof parsed.x === 'number' &&
      typeof parsed.y === 'number' &&
      typeof parsed.scale === 'number'
    ) {
      return {
        x: parsed.x,
        y: parsed.y,
        scale: clampScale(parsed.scale),
      };
    }
    return null;
  } catch {
    return null;
  }
}

function saveViewportTransform(transform: ViewportTransform): void {
  sessionStorage.setItem(VIEWPORT_STORAGE_KEY, JSON.stringify(transform));
}

function getFitScale(viewport: HTMLDivElement): number {
  const scaleX = viewport.clientWidth / TREE_CANVAS.width;
  const scaleY = viewport.clientHeight / TREE_CANVAS.height;
  return clampScale(Math.min(scaleX, scaleY) * 0.92);
}

function getCoreCenteredTransform(
  viewport: HTMLDivElement,
  scale?: number,
): ViewportTransform {
  const fitScale = scale ?? getFitScale(viewport);
  return {
    x: viewport.clientWidth / 2 - CORE_POSITION.x * fitScale,
    y: viewport.clientHeight / 2 - CORE_POSITION.y * fitScale,
    scale: fitScale,
  };
}

export function useSkillTreePan(viewportRef: React.RefObject<HTMLDivElement | null>) {
  const [transform, setTransform] = useState<ViewportTransform>({ x: 0, y: 0, scale: 1 });
  const isPanningRef = useRef(false);
  const startPointerRef = useRef({ x: 0, y: 0 });
  const startTransformRef = useRef<ViewportTransform>({ x: 0, y: 0, scale: 1 });

  const persistTransform = useCallback((next: ViewportTransform) => {
    saveViewportTransform(next);
  }, []);

  const centerOnCore = useCallback(
    (scale?: number) => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const saved = loadViewportTransform();
      if (saved) {
        setTransform(saved);
        return;
      }

      setTransform(getCoreCenteredTransform(viewport, scale));
    },
    [viewportRef],
  );

  useEffect(() => {
    centerOnCore();

    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(() => {
      if (!loadViewportTransform()) {
        setTransform((current) => getCoreCenteredTransform(viewport, current.scale));
      }
    });
    observer.observe(viewport);

    return () => observer.disconnect();
  }, [centerOnCore, viewportRef]);

  const zoomAtPoint = useCallback(
    (clientX: number, clientY: number, scaleDelta: number) => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const rect = viewport.getBoundingClientRect();
      const pointerX = clientX - rect.left;
      const pointerY = clientY - rect.top;

      setTransform((current) => {
        const nextScale = clampScale(current.scale + scaleDelta);
        if (nextScale === current.scale) return current;

        const treeX = (pointerX - current.x) / current.scale;
        const treeY = (pointerY - current.y) / current.scale;
        const next: ViewportTransform = {
          scale: nextScale,
          x: pointerX - treeX * nextScale,
          y: pointerY - treeY * nextScale,
        };
        persistTransform(next);
        return next;
      });
    },
    [persistTransform, viewportRef],
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const direction = event.deltaY > 0 ? -1 : 1;
      zoomAtPoint(event.clientX, event.clientY, direction * ZOOM_STEP);
    };

    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', onWheel);
  }, [viewportRef, zoomAtPoint]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      isPanningRef.current = true;
      startPointerRef.current = { x: event.clientX, y: event.clientY };
      startTransformRef.current = { ...transform };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [transform],
  );

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanningRef.current) return;

    const deltaX = event.clientX - startPointerRef.current.x;
    const deltaY = event.clientY - startPointerRef.current.y;
    const next = {
      ...startTransformRef.current,
      x: startTransformRef.current.x + deltaX,
      y: startTransformRef.current.y + deltaY,
    };
    setTransform(next);
  }, []);

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isPanningRef.current) return;
      isPanningRef.current = false;
      event.currentTarget.releasePointerCapture(event.pointerId);

      setTransform((current) => {
        persistTransform(current);
        return current;
      });
    },
    [persistTransform],
  );

  const zoomIn = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, ZOOM_STEP);
  }, [viewportRef, zoomAtPoint]);

  const zoomOut = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, -ZOOM_STEP);
  }, [viewportRef, zoomAtPoint]);

  const resetView = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const next = getCoreCenteredTransform(viewport);
    setTransform(next);
    persistTransform(next);
  }, [persistTransform, viewportRef]);

  return {
    transform,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    zoomIn,
    zoomOut,
    resetView,
  };
}
