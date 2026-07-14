import { useEffect, useState } from 'react';

const SAMPLE_INTERVAL_MS = 500;

/** Compteur FPS indépendant de PixiJS — mesure le rythme de rendu du navigateur via rAF. */
export function useFpsMeter(enabled: boolean): number {
  const [fps, setFps] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let frameCount = 0;
    let lastSampleTime = performance.now();
    let rafId = 0;

    const tick = () => {
      frameCount += 1;
      const now = performance.now();
      const elapsed = now - lastSampleTime;
      if (elapsed >= SAMPLE_INTERVAL_MS) {
        setFps(Math.round((frameCount * 1000) / elapsed));
        frameCount = 0;
        lastSampleTime = now;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [enabled]);

  return fps;
}
