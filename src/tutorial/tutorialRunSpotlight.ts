const listeners = new Set<() => void>();

let active = false;

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function isTutorialRunSpotlightActive(): boolean {
  return active;
}

export function setTutorialRunSpotlightActive(next: boolean): void {
  if (active === next) return;
  active = next;
  notify();
}

export function subscribeTutorialRunSpotlight(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
