import { useGameStore } from '../../store/useGameStore';
import { copyDevModuleTreePlanToClipboard } from './devModuleTreeExport';
import { applyCanonicalDevModuleTreeDraft, clearDevModuleTreeDraft } from './devModuleTreeDraft';
import {
  disableDevModuleTreeEditor,
  enableDevModuleTreeEditor,
  formatDevModuleTreeEditorHint,
} from './devModuleTreeEditor';
import { useDevModuleTreeDraft } from './useDevModuleTreeDraft';
import { useDevModuleTreeEditor } from './useDevModuleTreeEditor';
import { DevButton } from '../DevButton';
import { DevCopyButton, DevDraftPlacementsList, DevPanel, DevSection } from '../devUi';

export function DevModuleTreeTab() {
  const gameState = useGameStore((state) => state.gameState);
  const editor = useDevModuleTreeEditor();
  const drafts = useDevModuleTreeDraft();
  const isOnModuleTree = gameState === 'MENU' || gameState === 'UPGRADING';

  const handleToggleEditor = () => {
    if (editor.enabled) {
      disableDevModuleTreeEditor();
      return;
    }
    enableDevModuleTreeEditor();
  };

  return (
    <div className="space-y-4">
      <DevSection
        title="Éditeur arbre modules"
        description="Clique un parent, puis une case libre. Re-clique un parent puis un placeholder existant pour ajouter un second lien. Bouton × sur l'arbre pour supprimer."
      >
        {!isOnModuleTree && (
          <p className="mb-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[13px] text-amber-100/90">
            Va sur l&apos;<strong>arbre modules</strong> (hub) pour placer des cases.
          </p>
        )}

        <DevPanel title="Statut">
          <p className="mt-1 text-[13px] text-amber-200/90">
            {formatDevModuleTreeEditorHint(editor, 'panel')}
          </p>
          {editor.lastError && (
            <p className="mt-1 text-[12px] text-red-300/90">{editor.lastError}</p>
          )}
          <p className="mt-1 text-[12px] text-white/40">Placeholders : {drafts.length}</p>
        </DevPanel>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <DevButton onClick={handleToggleEditor}>
            {editor.enabled ? 'Désactiver éditeur' : 'Activer éditeur'}
          </DevButton>
          <DevButton
            onClick={() => {
              if (
                drafts.length > 0 &&
                !window.confirm('Remplacer le brouillon actuel par le plan canonique (2 placeholders) ?')
              ) {
                return;
              }
              applyCanonicalDevModuleTreeDraft();
            }}
          >
            Appliquer plan canonique
          </DevButton>
          <DevCopyButton
            label="Copier le plan"
            onCopy={copyDevModuleTreePlanToClipboard}
            disabled={drafts.length === 0}
          />
          <DevButton
            variant="danger"
            onClick={() => {
              if (!window.confirm('Effacer tous les placeholders brouillon ?')) return;
              clearDevModuleTreeDraft();
            }}
            disabled={drafts.length === 0}
          >
            Effacer brouillon
          </DevButton>
        </div>
      </DevSection>

      <DevDraftPlacementsList drafts={drafts} />
    </div>
  );
}
