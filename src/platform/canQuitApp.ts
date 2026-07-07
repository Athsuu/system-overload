declare global {
  interface Window {
    electron?: {
      quit?: () => void;
    };
  }
}

export function canQuitApp(): boolean {
  return typeof window.electron?.quit === 'function';
}

export function quitApp(): void {
  if (canQuitApp()) {
    window.electron?.quit?.();
  }
}
