export function isDevMenuEnabled(): boolean {
  if (!import.meta.env.DEV) return false;

  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
}
