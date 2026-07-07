import type { TutorialStepId } from './tutorialCatalog';

let groupFocusStepId: TutorialStepId | null = null;

const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function getTutorialGroupFocus(): TutorialStepId | null {
  return groupFocusStepId;
}

export function setTutorialGroupFocus(stepId: TutorialStepId | null): void {
  groupFocusStepId = stepId;
  notify();
}

export function subscribeTutorialGroupFocus(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function clearTutorialGroupFocus(): void {
  groupFocusStepId = null;
  notify();
}
