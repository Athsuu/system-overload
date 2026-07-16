import { devSetModuleTreeHexGridVisible, isDevModuleTreeHexGridVisible } from '../devFlags';
import type { DraftParentId } from './devModuleTreeDraft';
import {
  cloneProductionTreeToGlobalDraft,
  hasDevModuleTreeGlobalDraft,
} from './devModuleTreeGlobalDraft';

export const DEV_MODULE_TREE_EDITOR_EVENT = 'dev-module-tree-editor-change';

export type DevModuleTreeEditorStep = 'idle' | 'pickParent' | 'pickCell';

export type DevModuleTreeEditorMode = 'local' | 'global';

export type DevModuleTreeEditorTool = 'move' | 'place';

export interface DevModuleTreePendingPlacement {
  id: string;
  kind: 'module' | 'placeholder';
}

export interface DevModuleTreeEditorState {
  enabled: boolean;
  mode: DevModuleTreeEditorMode;
  editorTool: DevModuleTreeEditorTool;
  pendingPlacement: DevModuleTreePendingPlacement | null;
  selectedParentId: DraftParentId | null;
  step: DevModuleTreeEditorStep;
  lastError: string | null;
}

const state: DevModuleTreeEditorState = {
  enabled: false,
  mode: 'local',
  editorTool: 'move',
  pendingPlacement: null,
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

function editorToolHint(editor: DevModuleTreeEditorState): string {
  return editor.editorTool === 'move'
    ? 'Outil DÉPLACER — glisser un nœud sur la grille'
    : 'Outil PLACER — clique un parent puis une case libre';
}

export function formatDevModuleTreeEditorHint(
  editor: DevModuleTreeEditorState,
  variant: 'banner' | 'panel' = 'banner',
): string {
  if (!editor.enabled) return 'Inactif';

  const modeLabel = editor.mode === 'global' ? 'BROUILLON GLOBAL' : 'AJOUTS LOCAUX';

  if (editor.pendingPlacement) {
    const target = editor.pendingPlacement.id;
    if (editor.step === 'pickCell') {
      const step =
        variant === 'banner'
          ? `placer ${target} — parent ${editor.selectedParentId}, case libre`
          : `placer ${target}, parent ${editor.selectedParentId}, case libre`;
      return `${modeLabel} · ${step}`;
    }
    return `${modeLabel} · placer ${target} — choisis un parent sur l'arbre`;
  }

  const toolHint = editorToolHint(editor);

  if (editor.editorTool === 'place' && editor.step === 'pickCell') {
    const step =
      variant === 'banner'
        ? `parent ${editor.selectedParentId} — case libre ou lien`
        : `parent ${editor.selectedParentId}, case libre ou lien`;
    return `${modeLabel} · ${toolHint} — ${step}`;
  }

  if (variant === 'banner') {
    return `${modeLabel} · ${toolHint}`;
  }
  return `${modeLabel} · ${toolHint}`;
}

export function setDevModuleTreeEditorTool(tool: DevModuleTreeEditorTool): void {
  if (state.editorTool === tool) return;
  state.editorTool = tool;
  state.pendingPlacement = null;
  state.selectedParentId = null;
  state.step = state.enabled ? (tool === 'place' ? 'pickParent' : 'idle') : 'idle';
  state.lastError = null;
  notifyChange();
}

export function setDevModuleTreeEditorMode(mode: DevModuleTreeEditorMode): void {
  if (state.mode === mode) return;
  state.mode = mode;
  state.pendingPlacement = null;
  state.selectedParentId = null;
  state.step = state.enabled ? (state.editorTool === 'place' ? 'pickParent' : 'idle') : 'idle';
  state.lastError = null;

  if (mode === 'global' && !hasDevModuleTreeGlobalDraft()) {
    cloneProductionTreeToGlobalDraft();
  }

  notifyChange();
}

export function enableDevModuleTreeEditor(): void {
  state.enabled = true;
  state.editorTool = 'move';
  state.selectedParentId = null;
  state.step = 'idle';
  state.lastError = null;
  editorOwnsHexGrid = !isDevModuleTreeHexGridVisible();
  devSetModuleTreeHexGridVisible(true);
  notifyChange();
}

export function disableDevModuleTreeEditor(): void {
  state.enabled = false;
  state.pendingPlacement = null;
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

export function clearDevModuleTreeEditorPendingPlacement(): void {
  if (!state.pendingPlacement) return;
  state.pendingPlacement = null;
  state.selectedParentId = null;
  state.step = state.enabled && state.editorTool === 'place' ? 'pickParent' : 'idle';
  state.lastError = null;
  notifyChange();
}

export function setDevModuleTreeEditorPendingPlacement(
  placement: DevModuleTreePendingPlacement | null,
): void {
  if (!placement) {
    clearDevModuleTreeEditorPendingPlacement();
    return;
  }

  if (state.pendingPlacement?.id === placement.id) {
    clearDevModuleTreeEditorPendingPlacement();
    return;
  }

  if (!state.enabled) {
    state.enabled = true;
    editorOwnsHexGrid = !isDevModuleTreeHexGridVisible();
    devSetModuleTreeHexGridVisible(true);
  }

  state.editorTool = 'place';
  state.pendingPlacement = placement;
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
