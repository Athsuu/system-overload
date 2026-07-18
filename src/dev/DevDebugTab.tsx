import { useState } from 'react';
import {
  devResetArchDialogues,
  devResetTutorial,
  devToggleModuleTreeHexGrid,
  devToggleShowEnemyDebugOverlay,
  devToggleSpeed2x,
  isDevShowEnemyDebugOverlay,
  isDevSpeed2x,
} from './devActions';
import { useDevModuleTreeEditor } from './moduleTreeEditor/useDevModuleTreeEditor';
import { DevBalanceTrackerPanel } from './DevBalanceTrackerPanel';
import { DevButton } from './DevButton';
import { DevPanel, DevSection, DevToggleButton } from './devUi';
import { useDevModuleTreeHexGrid } from './useDevModuleTreeHexGrid';

interface DevDebugTabProps {
  onCloseMenu: () => void;
}

export function DevDebugTab({ onCloseMenu }: DevDebugTabProps) {
  const hexGrid = useDevModuleTreeHexGrid();
  const editor = useDevModuleTreeEditor();
  const [debugOverlay, setDebugOverlay] = useState(isDevShowEnemyDebugOverlay);
  const [speed2x, setSpeed2x] = useState(isDevSpeed2x);

  return (
    <div className="space-y-4">
      <DevSection title="Bascules visuelles">
        {editor.enabled && (
          <p className="mb-2 text-[13px] text-amber-200/80">
            La grille hex est gérée par l&apos;éditeur arbre. Désactive-le dans l&apos;onglet Arbre
            pour la couper.
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          <DevToggleButton
            label="Grille hex"
            active={hexGrid}
            onToggle={() => {
              devToggleModuleTreeHexGrid();
            }}
          />
          <DevToggleButton
            label="Debug processus"
            active={debugOverlay}
            onToggle={() => {
              setDebugOverlay(devToggleShowEnemyDebugOverlay());
            }}
          />
          <DevToggleButton
            label="Vitesse ×2"
            active={speed2x}
            onToggle={() => {
              setSpeed2x(devToggleSpeed2x());
            }}
          />
        </div>
      </DevSection>

      <DevSection
        title="Tutoriel & dialogues"
        description="Réaffiche les cartes ARCH depuis le début (hub). Ferme ce menu, la carte apparaît derrière."
      >
        <DevPanel>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <DevButton
              onClick={() => {
                devResetTutorial();
                onCloseMenu();
              }}
            >
              Reset tutoriel
            </DevButton>
            <DevButton onClick={() => devResetArchDialogues()}>Reset dialogues run</DevButton>
          </div>
        </DevPanel>
      </DevSection>

      <DevBalanceTrackerPanel />
    </div>
  );
}
