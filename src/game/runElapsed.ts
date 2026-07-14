/** Temps de run écoulé (ms) — temps de simulation, inclut Flux Drive / dev speed. */
export const runElapsedMsRef = { value: 0 };

export function resetRunElapsedMs(): void {
  runElapsedMsRef.value = 0;
}

export function addRunElapsedMs(deltaMs: number): void {
  if (deltaMs <= 0) return;
  runElapsedMsRef.value += deltaMs;
}

export function formatRunElapsedMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
