import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import { NODE0_HUB_POSITION } from '../../store/moduleTree';

const VIEWPORT_STORAGE_KEY = 'system-overload-tree-viewport';

const MIN_SCALE = 0.45;
const MAX_SCALE = 2;
const DEFAULT_SCALE = 1;
const ZOOM_STEP = 0.12;
/** Déplacement min avant d’engager le pan (évite de voler les clics). */
const PAN_THRESHOLD_PX = 4;

export interface ModuleTreeViewportTransform {
  x: number;
  y: number;
  scale: number;
}

export function clearModuleTreeViewport(): void {
  sessionStorage.removeItem(VIEWPORT_STORAGE_KEY);
}

function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function loadViewportTransform(): ModuleTreeViewportTransform | null {
  try {
    const raw = sessionStorage.getItem(VIEWPORT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ModuleTreeViewportTransform>;
    if (
      typeof parsed.x !== 'number' ||
      typeof parsed.y !== 'number' ||
      typeof parsed.scale !== 'number'
    ) {
      return null;
    }
    return { x: parsed.x, y: parsed.y, scale: clampScale(parsed.scale) };
  } catch {
    return null;
  }
}

function saveViewportTransform(transform: ModuleTreeViewportTransform): void {
  sessionStorage.setItem(VIEWPORT_STORAGE_KEY, JSON.stringify(transform));
}

function getCoreCenteredTransform(
  viewport: HTMLDivElement,
  scale: number = DEFAULT_SCALE,
): ModuleTreeViewportTransform {
  const fitScale = clampScale(scale);
  return {
    x: viewport.clientWidth / 2 - NODE0_HUB_POSITION.x * fitScale,
    y: viewport.clientHeight / 2 - NODE0_HUB_POSITION.y * fitScale,
    scale: fitScale,
  };
}

function isInteractivePanTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('[data-module-node], [data-module-tooltip], button'));
}

/**
 * Pan / zoom du viewport module tree.
 *
 * Contrôle : maintenir clic gauche pour déplacer, lâcher pour arrêter.
 * Le suivi move/up se fait sur `window` (pas de setPointerCapture) pour éviter
 * le bug « reste collé après lâcher » sous capture pointer.
 *
 * @param isBlockedRef — si true (drag éditeur), n’engage pas de nouveau pan.
 */
export function useModuleTreePan(
  viewportRef: RefObject<HTMLDivElement | null>,
  isBlockedRef?: RefObject<boolean>,
) {
  const [transform, setTransform] = useState<ModuleTreeViewportTransform>({
    x: 0,
    y: 0,
    scale: DEFAULT_SCALE,
  });
  const [isGrabbing, setIsGrabbing] = useState(false);

  const transformRef = useRef(transform);
  transformRef.current = transform;

  const isPanningRef = useRef(false);
  const pendingPanRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const startPointerRef = useRef({ x: 0, y: 0 });
  const startTransformRef = useRef<ModuleTreeViewportTransform>({
    x: 0,
    y: 0,
    scale: DEFAULT_SCALE,
  });
  const isBlockedRefInternal = useRef(isBlockedRef);
  isBlockedRefInternal.current = isBlockedRef;

  const applyTransform = useCallback((next: ModuleTreeViewportTransform) => {
    transformRef.current = next;
    setTransform(next);
  }, []);

  const endGesture = useCallback(() => {
    if (!isPanningRef.current && !pendingPanRef.current) return;

    const wasPanning = isPanningRef.current;
    isPanningRef.current = false;
    pendingPanRef.current = false;
    activePointerIdRef.current = null;
    setIsGrabbing(false);

    if (wasPanning) {
      saveViewportTransform(transformRef.current);
    }
  }, []);

  const centerOnCore = useCallback(
    (scale?: number) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const saved = loadViewportTransform();
      applyTransform(saved ?? getCoreCenteredTransform(viewport, scale));
    },
    [applyTransform, viewportRef],
  );

  useEffect(() => {
    centerOnCore();

    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(() => {
      if (loadViewportTransform()) return;
      setTransform((current) => getCoreCenteredTransform(viewport, current.scale));
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
        const next: ModuleTreeViewportTransform = {
          scale: nextScale,
          x: pointerX - treeX * nextScale,
          y: pointerY - treeY * nextScale,
        };
        transformRef.current = next;
        saveViewportTransform(next);
        return next;
      });
    },
    [viewportRef],
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomAtPoint(event.clientX, event.clientY, (event.deltaY > 0 ? -1 : 1) * ZOOM_STEP);
    };

    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', onWheel);
  }, [viewportRef, zoomAtPoint]);

  /** Listeners window actifs uniquement pendant un geste (pending ou pan). */
  useEffect(() => {
    const onWindowPointerMove = (event: PointerEvent) => {
      if (activePointerIdRef.current !== event.pointerId) return;

      if (isBlockedRefInternal.current?.current || (event.buttons & 1) === 0) {
        endGesture();
        return;
      }

      const deltaX = event.clientX - startPointerRef.current.x;
      const deltaY = event.clientY - startPointerRef.current.y;

      if (!isPanningRef.current) {
        if (!pendingPanRef.current) return;
        if (Math.hypot(deltaX, deltaY) < PAN_THRESHOLD_PX) return;
        isPanningRef.current = true;
        setIsGrabbing(true);
      }

      applyTransform({
        ...startTransformRef.current,
        x: startTransformRef.current.x + deltaX,
        y: startTransformRef.current.y + deltaY,
      });
    };

    const onWindowPointerUp = (event: PointerEvent) => {
      if (activePointerIdRef.current !== event.pointerId) return;
      endGesture();
    };

    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onWindowPointerUp, true);
    window.addEventListener('pointercancel', onWindowPointerUp, true);

    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp, true);
      window.removeEventListener('pointercancel', onWindowPointerUp, true);
    };
  }, [applyTransform, endGesture]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (isBlockedRef?.current) return;
      if (event.button !== 0) return;
      if (isInteractivePanTarget(event.target)) return;

      // Nouveau geste : annule tout résidu éventuel.
      endGesture();

      pendingPanRef.current = true;
      activePointerIdRef.current = event.pointerId;
      startPointerRef.current = { x: event.clientX, y: event.clientY };
      startTransformRef.current = { ...transformRef.current };
    },
    [endGesture, isBlockedRef],
  );

  const zoomFromViewportCenter = useCallback(
    (scaleDelta: number) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const rect = viewport.getBoundingClientRect();
      zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, scaleDelta);
    },
    [viewportRef, zoomAtPoint],
  );

  const zoomIn = useCallback(() => zoomFromViewportCenter(ZOOM_STEP), [zoomFromViewportCenter]);
  const zoomOut = useCallback(() => zoomFromViewportCenter(-ZOOM_STEP), [zoomFromViewportCenter]);

  const resetView = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const next = getCoreCenteredTransform(viewport, DEFAULT_SCALE);
    applyTransform(next);
    saveViewportTransform(next);
  }, [applyTransform, viewportRef]);

  return {
    transform,
    isGrabbing,
    onPointerDown,
    zoomIn,
    zoomOut,
    resetView,
  };
}
