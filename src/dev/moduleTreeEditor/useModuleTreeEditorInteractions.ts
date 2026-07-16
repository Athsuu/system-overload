import { useCallback } from 'react';
import {
  addDevModuleTreeDraftEntry,
  addDevModuleTreeDraftEntryWithId,
  addDraftParentLink,
  countDraftCascadeDelete,
  getDraftAtCell,
  removeDevModuleTreeDraftEntry,
  type DraftParentId,
} from './devModuleTreeDraft';
import {
  addGlobalParentLink,
  addGlobalPlaceholderEntry,
  addGlobalTreeEntry,
  countGlobalCascadeDelete,
  getGlobalEntryAtCell,
  removeGlobalDraftEntry,
} from './devModuleTreeGlobalDraft';
import {
  clearDevModuleTreeEditorError,
  clearDevModuleTreeEditorParent,
  clearDevModuleTreeEditorPendingPlacement,
  setDevModuleTreeEditorError,
  setDevModuleTreeEditorParent,
  type DevModuleTreeEditorState,
} from './devModuleTreeEditor';

export function useModuleTreeEditorInteractions(
  editor: DevModuleTreeEditorState,
  onClearSelection: () => void,
) {
  const isGlobal = editor.mode === 'global';

  const completeStep = useCallback(() => {
    clearDevModuleTreeEditorError();
    clearDevModuleTreeEditorPendingPlacement();
    clearDevModuleTreeEditorParent();
  }, []);

  const pickParent = useCallback(
    (parentId: DraftParentId) => {
      setDevModuleTreeEditorParent(parentId);
      clearDevModuleTreeEditorError();
      onClearSelection();
    },
    [onClearSelection],
  );

  const linkParent = useCallback(
    (entryId: string) => {
      if (!editor.enabled || !editor.selectedParentId) return;

      const linked = isGlobal
        ? addGlobalParentLink(entryId, editor.selectedParentId)
        : addDraftParentLink(entryId, editor.selectedParentId);

      if (!linked) {
        setDevModuleTreeEditorError('Parent déjà lié ou invalide.');
        return;
      }
      completeStep();
    },
    [completeStep, editor.enabled, editor.selectedParentId, isGlobal],
  );

  const cellClick = useCallback(
    (q: number, r: number) => {
      if (!editor.enabled || !editor.selectedParentId) return;

      const pending = editor.pendingPlacement;
      const existing = isGlobal ? getGlobalEntryAtCell(q, r) : getDraftAtCell(q, r);

      if (pending) {
        if (existing) {
          setDevModuleTreeEditorError('Case occupée — choisis une case libre.');
          return;
        }

        const entry = isGlobal
          ? addGlobalTreeEntry(pending.id, pending.kind, editor.selectedParentId, q, r)
          : addDevModuleTreeDraftEntryWithId(pending.id, editor.selectedParentId, q, r);

        if (!entry) {
          setDevModuleTreeEditorError('Cellule occupée ou invalide (Node-0 interdit).');
          return;
        }
        completeStep();
        return;
      }

      if (existing) {
        linkParent(existing.id);
        return;
      }

      const entry = isGlobal
        ? addGlobalPlaceholderEntry(editor.selectedParentId, q, r)
        : addDevModuleTreeDraftEntry(editor.selectedParentId, q, r);

      if (!entry) {
        setDevModuleTreeEditorError('Cellule occupée ou invalide (Node-0 interdit).');
        return;
      }
      completeStep();
    },
    [completeStep, editor.enabled, editor.pendingPlacement, editor.selectedParentId, isGlobal, linkParent],
  );

  const deleteDraft = useCallback(
    (entryId: string) => {
      if (entryId === 'node0Boot') return;

      const cascadeCount = isGlobal
        ? countGlobalCascadeDelete(entryId)
        : countDraftCascadeDelete(entryId);

      const message =
        cascadeCount > 1
          ? `Supprimer ${entryId} et ${cascadeCount - 1} enfant(s) brouillon ?`
          : `Supprimer ${entryId} ?`;
      if (!window.confirm(message)) return;

      if (isGlobal) {
        removeGlobalDraftEntry(entryId);
      } else {
        removeDevModuleTreeDraftEntry(entryId);
      }

      clearDevModuleTreeEditorError();
      if (editor.selectedParentId === entryId) {
        clearDevModuleTreeEditorParent();
      }
    },
    [editor.selectedParentId, isGlobal],
  );

  const isPickParentMode =
    editor.enabled && editor.editorTool === 'place' && editor.step === 'pickParent';

  const isLinkParentMode =
    editor.enabled &&
    editor.editorTool === 'place' &&
    editor.step === 'pickCell' &&
    !editor.pendingPlacement;

  return {
    pickParent,
    linkParent,
    cellClick,
    deleteDraft,
    isPickParentMode,
    isLinkParentMode,
    isEditorActive: editor.enabled,
    isGlobalMode: isGlobal,
  };
}
