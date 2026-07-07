const ARCH_AMBIENT_KEY = 'system-overload-arch-ambient';
const LEGACY_TRACE_AMBIENT_KEY = 'system-overload-trace-ambient';

const listeners = new Set<() => void>();

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
  const legacy = readHeardIdsFromKey(LEGACY_TRACE_AMBIENT_KEY);
  if (legacy.length === 0) return;
  localStorage.setItem(ARCH_AMBIENT_KEY, JSON.stringify({ heardIds: legacy }));
}

export function loadHeardArchAmbientIds(): string[] {
  migrateLegacyAmbientIfNeeded();
  return readHeardIdsFromKey(ARCH_AMBIENT_KEY);
}

export function markArchAmbientHeard(id: string): void {
  const heardIds = loadHeardArchAmbientIds();
  if (heardIds.includes(id)) return;
  localStorage.setItem(ARCH_AMBIENT_KEY, JSON.stringify({ heardIds: [...heardIds, id] }));
  notify();
}

export function clearArchAmbientHeard(): void {
  localStorage.removeItem(ARCH_AMBIENT_KEY);
  localStorage.removeItem(LEGACY_TRACE_AMBIENT_KEY);
  notify();
}
