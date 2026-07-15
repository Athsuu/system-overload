import { useCallback } from 'react';
import {
  addDevModuleTreeDraftEntry,
  addDraftParentLink,
  countDraftCascadeDelete,
  getDraftAtCell,
  removeDevModuleTreeDraftEntry,
  type DraftParentId,
} from './devModuleTreeDraft';
import {
  clearDevModuleTreeEditorError,
  clearDevModuleTreeEditorParent,
  setDevModuleTreeEditorError,
  setDevModuleTreeEditorParent,
  type DevModuleTreeEditorState,
} from './devModuleTreeEditor';

export function useModuleTreeEditorInteractions(
  editor: DevModuleTreeEditorState,
  onClearSelection: () => void,
) {
  const completeStep = useCallback(() => {
    clearDevModuleTreeEditorError();
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
    (draftId: string) => {
      if (!editor.enabled || !editor.selectedParentId) return;

      const linked = addDraftParentLink(draftId, editor.selectedParentId);
      if (!linked) {
        setDevModuleTreeEditorError('Parent déjà lié ou invalide.');
        return;
      }
      completeStep();
    },
    [completeStep, editor.enabled, editor.selectedParentId],
  );

  const cellClick = useCallback(
    (q: number, r: number) => {
      if (!editor.enabled || !editor.selectedParentId) return;

      const existingDraft = getDraftAtCell(q, r);
      if (existingDraft) {
        linkParent(existingDraft.id);
        return;
      }

      const entry = addDevModuleTreeDraftEntry(editor.selectedParentId, q, r);
      if (!entry) {
        setDevModuleTreeEditorError('Cellule occupée ou invalide (Node-0 interdit).');
        return;
      }
      completeStep();
    },
    [completeStep, editor.enabled, editor.selectedParentId, linkParent],
  );

  const deleteDraft = useCallback(
    (draftId: string) => {
      const cascadeCount = countDraftCascadeDelete(draftId);
      const message =
        cascadeCount > 1
          ? `Supprimer ${draftId} et ${cascadeCount - 1} enfant(s) brouillon ?`
          : `Supprimer ${draftId} ?`;
      if (!window.confirm(message)) return;

      removeDevModuleTreeDraftEntry(draftId);
      clearDevModuleTreeEditorError();
      if (editor.selectedParentId === draftId) {
        clearDevModuleTreeEditorParent();
      }
    },
    [editor.selectedParentId],
  );

  const isPickParentMode = editor.enabled && editor.step === 'pickParent';

  return {
    pickParent,
    linkParent,
    cellClick,
    deleteDraft,
    isPickParentMode,
    isEditorActive: editor.enabled,
  };
}
