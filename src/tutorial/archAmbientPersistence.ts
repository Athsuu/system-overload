const ARCH_AMBIENT_KEY = 'system-overload-arch-ambient';
const LEGACY_ARCH_AMBIENT_KEY = 'system-overload-trace-ambient';

export type ArchAmbientPersistScope = 'run' | 'profile';

const listeners = new Set<() => void>();

let heardThisRun = new Set<string>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeArchAmbient(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readHeardIdsFromKey(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { heardIds?: unknown };
    if (!Array.isArray(parsed.heardIds)) return [];
    return parsed.heardIds.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

function migrateLegacyAmbientIfNeeded(): void {
  const current = readHeardIdsFromKey(ARCH_AMBIENT_KEY);
  if (current.length > 0) return;
  const legacy = readHeardIdsFromKey(LEGACY_ARCH_AMBIENT_KEY);
  if (legacy.length === 0) return;
  localStorage.setItem(ARCH_AMBIENT_KEY, JSON.stringify({ heardIds: legacy }));
}

export function loadHeardArchAmbientProfileIds(): string[] {
  migrateLegacyAmbientIfNeeded();
  return readHeardIdsFromKey(ARCH_AMBIENT_KEY);
}

export function isArchAmbientHeard(id: string, scope: ArchAmbientPersistScope): boolean {
  if (scope === 'run') return heardThisRun.has(id);
  return loadHeardArchAmbientProfileIds().includes(id);
}

export function markArchAmbientHeard(id: string, scope: ArchAmbientPersistScope): void {
  if (scope === 'run') {
    if (heardThisRun.has(id)) return;
    heardThisRun = new Set([...heardThisRun, id]);
    notify();
    return;
  }

  const heardIds = loadHeardArchAmbientProfileIds();
  if (heardIds.includes(id)) return;
  localStorage.setItem(ARCH_AMBIENT_KEY, JSON.stringify({ heardIds: [...heardIds, id] }));
  notify();
}

/** Called at each new run — run dialogues can replay every run. */
export function clearRunArchAmbientHeard(): void {
  if (heardThisRun.size === 0) return;
  heardThisRun = new Set();
  notify();
}

export function clearArchAmbientHeard(): void {
  heardThisRun = new Set();
  localStorage.removeItem(ARCH_AMBIENT_KEY);
  localStorage.removeItem(LEGACY_ARCH_AMBIENT_KEY);
  notify();
}

/** @deprecated Use loadHeardArchAmbientProfileIds — profile scope only. */
export function loadHeardArchAmbientIds(): string[] {
  return loadHeardArchAmbientProfileIds();
}
