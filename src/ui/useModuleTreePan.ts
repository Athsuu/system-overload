import { useCallback, useEffect, useRef, useState } from 'react';
import { NODE0_HUB_POSITION } from '../store/moduleTree';

const VIEWPORT_STORAGE_KEY = 'system-overload-tree-viewport';

export function clearModuleTreeViewport(): void {
  sessionStorage.removeItem(VIEWPORT_STORAGE_KEY);
}

const MIN_SCALE = 0.45;
const MAX_SCALE = 2;
const DEFAULT_SCALE = 1;
const ZOOM_STEP = 0.12;
const PAN_THRESHOLD_PX = 4;

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

function getCoreCenteredTransform(
  viewport: HTMLDivElement,
  scale: number = DEFAULT_SCALE,
): ViewportTransform {
  const fitScale = clampScale(scale);
  return {
    x: viewport.clientWidth / 2 - NODE0_HUB_POSITION.x * fitScale,
    y: viewport.clientHeight / 2 - NODE0_HUB_POSITION.y * fitScale,
    scale: fitScale,
  };
}

function isPanBlockedTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('[data-module-node], [data-module-tooltip], button'));
}

export function useModuleTreePan(viewportRef: React.RefObject<HTMLDivElement | null>) {
  const [transform, setTransform] = useState<ViewportTransform>({ x: 0, y: 0, scale: 1 });
  const [isGrabbing, setIsGrabbing] = useState(false);
  const transformRef = useRef(transform);
  transformRef.current = transform;

  const isPanningRef = useRef(false);
  const pendingPanRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const startPointerRef = useRef({ x: 0, y: 0 });
  const startTransformRef = useRef<ViewportTransform>({ x: 0, y: 0, scale: 1 });

  const persistTransform = useCallback((next: ViewportTransform) => {
    saveViewportTransform(next);
  }, []);

  const applyTransform = useCallback((next: ViewportTransform) => {
    transformRef.current = next;
    setTransform(next);
  }, []);

  const centerOnCore = useCallback(
    (scale?: number) => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const saved = loadViewportTransform();
      if (saved) {
        applyTransform(saved);
        return;
      }

      applyTransform(getCoreCenteredTransform(viewport, scale));
    },
    [applyTransform, viewportRef],
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
        transformRef.current = next;
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

  const endPan = useCallback(() => {
    if (!isPanningRef.current && !pendingPanRef.current) return;

    isPanningRef.current = false;
    pendingPanRef.current = false;
    activePointerIdRef.current = null;
    setIsGrabbing(false);
    persistTransform(transformRef.current);
  }, [persistTransform]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      if (isPanBlockedTarget(event.target)) return;

      pendingPanRef.current = true;
      activePointerIdRef.current = event.pointerId;
      startPointerRef.current = { x: event.clientX, y: event.clientY };
      startTransformRef.current = { ...transformRef.current };
    },
    [],
  );

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== event.pointerId) return;

    const deltaX = event.clientX - startPointerRef.current.x;
    const deltaY = event.clientY - startPointerRef.current.y;

    if (!isPanningRef.current) {
      if (!pendingPanRef.current) return;
      if (Math.hypot(deltaX, deltaY) < PAN_THRESHOLD_PX) return;

      isPanningRef.current = true;
      setIsGrabbing(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    const next = {
      ...startTransformRef.current,
      x: startTransformRef.current.x + deltaX,
      y: startTransformRef.current.y + deltaY,
    };
    applyTransform(next);
  }, [applyTransform]);

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (activePointerIdRef.current !== event.pointerId) return;

      if (isPanningRef.current) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      endPan();
    },
    [endPan],
  );

  useEffect(() => {
    const onWindowPointerUp = () => endPan();
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerUp);
    return () => {
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointercancel', onWindowPointerUp);
    };
  }, [endPan]);

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
    const next = getCoreCenteredTransform(viewport, DEFAULT_SCALE);
    applyTransform(next);
    persistTransform(next);
  }, [applyTransform, persistTransform, viewportRef]);

  return {
    transform,
    isGrabbing,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    zoomIn,
    zoomOut,
    resetView,
  };
}
