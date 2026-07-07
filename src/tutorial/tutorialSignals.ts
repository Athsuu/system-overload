export type TutorialSignalKey =
  | 'runsStarted'
  | 'skillNodeSelected'
  | 'upgradePurchased'
  | 'fluxDriveToggled';

export interface TutorialSignals {
  runsStarted: number;
  skillNodeSelected: boolean;
  upgradePurchased: boolean;
  fluxDriveToggled: boolean;
}

const DEFAULT_SIGNALS: TutorialSignals = {
  runsStarted: 0,
  skillNodeSelected: false,
  upgradePurchased: false,
  fluxDriveToggled: false,
};

let signals: TutorialSignals = { ...DEFAULT_SIGNALS };
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function getTutorialSignals(): TutorialSignals {
  return signals;
}

export function markTutorialSignal(key: TutorialSignalKey): void {
  if (key === 'runsStarted') {
    signals = { ...signals, runsStarted: signals.runsStarted + 1 };
    notify();
    return;
  }

  if (signals[key]) return;
  signals = { ...signals, [key]: true };
  notify();
}

export function subscribeTutorialSignals(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetTutorialSignals(): void {
  signals = { ...DEFAULT_SIGNALS };
  notify();
}
