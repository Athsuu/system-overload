import { useState } from 'react';
import {
  devResetArchDialogues,
  devResetTutorial,
  devToggleModuleTreeHexGrid,
  devToggleShowEnemyHpBars,
  devToggleSpeed2x,
  isDevModuleTreeHexGridVisible,
  isDevShowEnemyHpBars,
  isDevSpeed2x,
} from './devActions';
import { DevButton } from './DevButton';

interface DevDebugTabProps {
  onCloseMenu: () => void;
}

export function DevDebugTab({ onCloseMenu }: DevDebugTabProps) {
  const [hexGrid, setHexGrid] = useState(isDevModuleTreeHexGridVisible);
  const [enemyHpBars, setEnemyHpBars] = useState(isDevShowEnemyHpBars);
  const [speed2x, setSpeed2x] = useState(isDevSpeed2x);

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-[14px] tracking-wider text-white/40 uppercase">Bascules visuelles</p>
        <div className="flex flex-wrap gap-1.5">
          <DevButton onClick={() => setHexGrid(devToggleModuleTreeHexGrid())}>
            Grille hex {hexGrid ? 'ON' : 'OFF'}
          </DevButton>
          <DevButton onClick={() => setEnemyHpBars(devToggleShowEnemyHpBars())}>
            HP ennemis {enemyHpBars ? 'ON' : 'OFF'}
          </DevButton>
          <DevButton onClick={() => setSpeed2x(devToggleSpeed2x())}>
            Vitesse ×2 {speed2x ? 'ON' : 'OFF'}
          </DevButton>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[14px] tracking-wider text-white/40 uppercase">Tutoriel</p>
        <p className="mb-2 text-[13px] text-white/30">
          Réaffiche les cartes ARCH depuis le début (hub). Ferme ce menu — la carte apparaît derrière.
        </p>
        <div className="flex flex-wrap gap-1.5">
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
      </div>
    </div>
  );
}
