import { useGameStore } from '../../store/useGameStore';
import { copyDevModuleTreePlanToClipboard } from './devModuleTreeExport';
import { copyDevModuleTreeGlobalPlanToClipboard } from './devModuleTreeGlobalExport';
import { clearDevModuleTreeDraft } from './devModuleTreeDraft';
import {
  clearDevModuleTreeGlobalDraft,
  cloneProductionTreeToGlobalDraft,
} from './devModuleTreeGlobalDraft';
import {
  disableDevModuleTreeEditor,
  enableDevModuleTreeEditor,
  formatDevModuleTreeEditorHint,
  setDevModuleTreeEditorMode,
  setDevModuleTreeEditorPendingPlacement,
  setDevModuleTreeEditorTool,
  type DevModuleTreeEditorMode,
} from './devModuleTreeEditor';
import { useDevModuleTreeDraft } from './useDevModuleTreeDraft';
import { useDevModuleTreeGlobalDraft } from './useDevModuleTreeGlobalDraft';
import { useDevModuleTreeEditor } from './useDevModuleTreeEditor';
import { DevButton } from '../DevButton';
import { DevCopyButton, DevPanel, DevSection } from '../devUi';
import { DevUnusedModulesPanel } from './DevUnusedModulesPanel';
import {
  getUnusedGlobalTreeEntries,
  getUnusedLocalPlaceholderEntries,
  type UnusedTreeEntry,
} from './devModuleTreeUnusedCatalog';

export function DevModuleTreeTab() {
  const gameState = useGameStore((state) => state.gameState);
  const editor = useDevModuleTreeEditor();
  const localDrafts = useDevModuleTreeDraft();
  const globalDrafts = useDevModuleTreeGlobalDraft();
  const isOnModuleTree = gameState === 'MENU' || gameState === 'UPGRADING';
  const isGlobal = editor.mode === 'global';
  const unusedGlobalEntries = getUnusedGlobalTreeEntries();
  const unusedLocalEntries = getUnusedLocalPlaceholderEntries();

  const handleToggleEditor = () => {
    if (editor.enabled) {
      disableDevModuleTreeEditor();
      return;
    }
    enableDevModuleTreeEditor();
  };

  const handleModeChange = (mode: DevModuleTreeEditorMode) => {
    setDevModuleTreeEditorMode(mode);
  };

  const handleSelectUnusedEntry = (entry: UnusedTreeEntry) => {
    setDevModuleTreeEditorPendingPlacement({ id: entry.id, kind: entry.kind });
  };

  return (
    <div className="space-y-4">
      <DevSection
        title="Éditeur arbre modules"
        description="Ajouts locaux = placeholders sur l'arbre joueur. Brouillon global = replanification complète. Glisser-déposer + export TS (moduleTree.ts / moduleTreePlaceholders.ts)."
      >
        {!isOnModuleTree && (
          <p className="mb-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[13px] text-amber-100/90">
            Va sur l&apos;<strong>arbre modules</strong> (hub) pour éditer le plan.
          </p>
        )}

        <DevPanel title="Mode">
          <div className="mt-1 flex flex-wrap gap-1.5">
            <DevButton
              variant={editor.mode === 'local' ? 'primary' : 'default'}
              onClick={() => handleModeChange('local')}
            >
              Ajouts locaux
            </DevButton>
            <DevButton
              variant={editor.mode === 'global' ? 'primary' : 'default'}
              onClick={() => handleModeChange('global')}
            >
              Brouillon global
            </DevButton>
          </div>
          <p className="mt-2 text-[12px] text-white/45">
            {isGlobal
              ? 'Seul le plan brouillon est visible. L’arbre joueur reste intact.'
              : 'L’arbre joueur reste visible. Les placeholders gris sont le brouillon local.'}
          </p>
        </DevPanel>

        <DevPanel title="Outil">
          <div className="mt-1 flex flex-wrap gap-1.5">
            <DevButton
              variant={editor.editorTool === 'move' ? 'primary' : 'default'}
              onClick={() => setDevModuleTreeEditorTool('move')}
              disabled={!editor.enabled}
            >
              Déplacer
            </DevButton>
            <DevButton
              variant={editor.editorTool === 'place' ? 'primary' : 'default'}
              onClick={() => setDevModuleTreeEditorTool('place')}
              disabled={!editor.enabled}
            >
              Placer
            </DevButton>
          </div>
          <p className="mt-2 text-[12px] text-white/45">
            {editor.editorTool === 'move'
              ? 'Glisser-déposer les nœuds plan sur la grille (pan/zoom inchangés).'
              : 'Choisir un parent, puis une case libre ou un nœud pour lier.'}
          </p>
        </DevPanel>

        <DevPanel title="Statut">
          <p className="mt-1 text-[13px] text-amber-200/90">
            {formatDevModuleTreeEditorHint(editor, 'panel')}
          </p>
          {editor.lastError && (
            <p className="mt-1 text-[12px] text-red-300/90">{editor.lastError}</p>
          )}
          <p className="mt-1 text-[12px] text-white/40">
            {isGlobal ? `Nœuds plan : ${globalDrafts.length}` : `Placeholders : ${localDrafts.length}`}
          </p>
        </DevPanel>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <DevButton onClick={handleToggleEditor}>
            {editor.enabled ? 'Désactiver éditeur' : 'Activer éditeur'}
          </DevButton>
        </div>

        {isGlobal ? (
          <>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <DevButton
              onClick={() => {
                if (
                  globalDrafts.length > 0 &&
                  !window.confirm('Remplacer le plan global par une copie de l’arbre actuel ?')
                ) {
                  return;
                }
                cloneProductionTreeToGlobalDraft();
              }}
            >
              Importer arbre actuel
            </DevButton>
            <DevCopyButton
              label="Copier export TS global"
              onCopy={copyDevModuleTreeGlobalPlanToClipboard}
              disabled={globalDrafts.length === 0}
            />
            <DevButton
              variant="danger"
              onClick={() => {
                if (!window.confirm('Effacer tout le plan global ?')) return;
                clearDevModuleTreeGlobalDraft();
              }}
              disabled={globalDrafts.length === 0}
            >
              Effacer plan global
            </DevButton>
          </div>
          <p className="mt-2 text-[12px] text-white/40">
            L&apos;export contient le résumé des changements, puis les blocs TS pour{' '}
            <code className="text-cyan-200/80">moduleTree.ts</code> et{' '}
            <code className="text-cyan-200/80">moduleTreePlaceholders.ts</code>, plus une checklist agent.
          </p>
          </>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <DevCopyButton
              label="Copier export placeholders"
              onCopy={copyDevModuleTreePlanToClipboard}
              disabled={localDrafts.length === 0}
            />
            <DevButton
              variant="danger"
              onClick={() => {
                if (!window.confirm('Effacer tous les placeholders locaux ?')) return;
                clearDevModuleTreeDraft();
              }}
              disabled={localDrafts.length === 0}
            >
              Effacer brouillon local
            </DevButton>
          </div>
        )}
      </DevSection>

      {isGlobal ? (
        <DevUnusedModulesPanel
          entries={unusedGlobalEntries}
          title="Modules non placés"
          description="Clique un module, choisis un parent sur l’arbre, puis une case libre."
          emptyMessage="Tous les modules du catalogue sont dans le plan global."
          selectedEntryId={editor.pendingPlacement?.id ?? null}
          onSelectEntry={handleSelectUnusedEntry}
        />
      ) : (
        <DevUnusedModulesPanel
          entries={unusedLocalEntries}
          title="Placeholders non utilisés"
          description="Clique un placeholder, choisis un parent, puis une case libre sur l’arbre joueur."
          emptyMessage="Aucun placeholder prod manquant — utilisez Placer pour ajouter de nouveaux emplacements."
          selectedEntryId={editor.pendingPlacement?.id ?? null}
          onSelectEntry={handleSelectUnusedEntry}
        />
      )}
    </div>
  );
}
