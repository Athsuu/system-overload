import { devSetModuleTreeHexGridVisible, isDevModuleTreeHexGridVisible } from '../devFlags';
import type { DraftParentId } from './devModuleTreeDraft';

export const DEV_MODULE_TREE_EDITOR_EVENT = 'dev-module-tree-editor-change';

export type DevModuleTreeEditorStep = 'idle' | 'pickParent' | 'pickCell';

export interface DevModuleTreeEditorState {
  enabled: boolean;
  selectedParentId: DraftParentId | null;
  step: DevModuleTreeEditorStep;
  lastError: string | null;
}

const state: DevModuleTreeEditorState = {
  enabled: false,
  selectedParentId: null,
  step: 'idle',
  lastError: null,
};

/** True si l'éditeur a activé la grille hex (à couper au disable). */
let editorOwnsHexGrid = false;

function notifyChange(): void {
  window.dispatchEvent(new CustomEvent(DEV_MODULE_TREE_EDITOR_EVENT));
}

export function getDevModuleTreeEditorState(): DevModuleTreeEditorState {
  return { ...state };
}

export function isDevModuleTreeEditorEnabled(): boolean {
  return state.enabled;
}

export function formatDevModuleTreeEditorHint(
  editor: DevModuleTreeEditorState,
  variant: 'banner' | 'panel' = 'banner',
): string {
  if (!editor.enabled) return 'Inactif';
  if (editor.step === 'pickCell') {
    return variant === 'banner'
      ? `Parent : ${editor.selectedParentId} — clique une case libre ou un placeholder existant`
      : `Actif — parent ${editor.selectedParentId}, case libre ou lien placeholder`;
  }
  return variant === 'banner'
    ? 'Mode éditeur — clique un module ou placeholder parent'
    : "Actif — clique un parent sur l'arbre";
}

export function enableDevModuleTreeEditor(): void {
  state.enabled = true;
  state.selectedParentId = null;
  state.step = 'pickParent';
  state.lastError = null;
  editorOwnsHexGrid = !isDevModuleTreeHexGridVisible();
  devSetModuleTreeHexGridVisible(true);
  notifyChange();
}

export function disableDevModuleTreeEditor(): void {
  state.enabled = false;
  state.selectedParentId = null;
  state.step = 'idle';
  state.lastError = null;
  if (editorOwnsHexGrid) {
    devSetModuleTreeHexGridVisible(false);
    editorOwnsHexGrid = false;
  }
  notifyChange();
}

export function setDevModuleTreeEditorParent(parentId: DraftParentId): void {
  if (!state.enabled) return;
  state.selectedParentId = parentId;
  state.step = 'pickCell';
  state.lastError = null;
  notifyChange();
}

export function clearDevModuleTreeEditorParent(): void {
  if (!state.enabled) return;
  state.selectedParentId = null;
  state.step = 'pickParent';
  state.lastError = null;
  notifyChange();
}

export function setDevModuleTreeEditorError(message: string | null): void {
  state.lastError = message;
  notifyChange();
}

export function clearDevModuleTreeEditorError(): void {
  if (!state.lastError) return;
  state.lastError = null;
  notifyChange();
}
