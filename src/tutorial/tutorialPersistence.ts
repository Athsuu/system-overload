import type { TutorialGroupId } from './tutorialCatalog';
import { getTutorialGroupSteps } from './tutorialCatalog';
import { clearTutorialGroupFocus } from './tutorialNavigation';

const TUTORIAL_KEY = 'system-overload-tutorial';

const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeTutorialProgress(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export interface TutorialProgress {
  dismissedStepIds: string[];
}

export function loadTutorialProgress(): TutorialProgress {
  try {
    const raw = localStorage.getItem(TUTORIAL_KEY);
    if (!raw) return { dismissedStepIds: [] };

    const parsed = JSON.parse(raw) as Partial<TutorialProgress>;
    const dismissedStepIds = Array.isArray(parsed.dismissedStepIds)
      ? parsed.dismissedStepIds
          .filter((id): id is string => typeof id === 'string')
          .map((id) => (id === 'kernel_role' ? 'node0_role' : id))
      : [];

    return { dismissedStepIds };
  } catch {
    return { dismissedStepIds: [] };
  }
}

export function saveTutorialProgress(progress: TutorialProgress): void {
  localStorage.setItem(TUTORIAL_KEY, JSON.stringify(progress));
}

export function isStepDismissed(stepId: string): boolean {
  return loadTutorialProgress().dismissedStepIds.includes(stepId);
}

export function dismissSteps(stepIds: string[]): void {
  const progress = loadTutorialProgress();
  const dismissedStepIds = [...new Set([...progress.dismissedStepIds, ...stepIds])];
  saveTutorialProgress({ dismissedStepIds });
  notify();
}

export function dismissStep(stepId: string): void {
  dismissSteps([stepId]);
}

export function dismissTutorialGroup(groupId: TutorialGroupId): void {
  const stepIds = getTutorialGroupSteps(groupId).map((step) => step.id);
  dismissSteps(stepIds);
  clearTutorialGroupFocus();
}

export function clearTutorialProgress(): void {
  localStorage.removeItem(TUTORIAL_KEY);
  clearTutorialGroupFocus();
  notify();
}
