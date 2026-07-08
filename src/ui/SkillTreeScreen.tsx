import { useRef, useState } from 'react';
import type { GameState } from '../store/useGameStore';
import type { TreeNodeId } from '../store/skillTree';
import { markTutorialSignal } from '../tutorial/tutorialSignals';
import { useGameStrings } from '../i18n/useGameStrings';
import { DARK_HEX } from '../theme/darkHexTerminal';
import { CycleRunLauncher } from './CycleRunLauncher';
import { HubCornerControls } from './HubCornerControls';
import { SkillTreeViewport } from './SkillTreeViewport';
import { TerminalBackdrop } from './TerminalBackdrop';
import { ArchGlitchLine } from './ArchGlitchText';

interface SkillTreeScreenProps {
  mode: Extract<GameState, 'MENU' | 'UPGRADING'>;
}

export function SkillTreeScreen({ mode }: SkillTreeScreenProps) {
  const screenRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<TreeNodeId | null>(null);
  const strings = useGameStrings();
  const isMenu = mode === 'MENU';

  const toggleSkillSelection = (id: TreeNodeId) => {
    markTutorialSignal('skillNodeSelected');
    setSelectedId((current) => (current === id ? null : id));
  };

  const clearSkillSelection = () => {
    setSelectedId(null);
  };

  return (
    <div
      ref={screenRef}
      className="pointer-events-auto absolute inset-0 overflow-hidden"
      style={{ backgroundColor: DARK_HEX.canvasBg }}
    >
      <TerminalBackdrop patternId="hubHexGrid" variant="hub" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center px-6 pt-8">
        <h1
          className="so-font-display so-hub-glitch-title text-xl font-semibold tracking-[0.35em] uppercase"
          style={{ color: '#c5a059' }}
        >
          <ArchGlitchLine
            text={isMenu ? strings.title : strings.hub.upgradesTitle}
            variant="title"
            quote={false}
            glitchChance={0.06}
          />
        </h1>

        {isMenu ? (
          <p className="so-hub-glitch-tagline mt-3 max-w-md text-center text-[10px] tracking-[0.18em] text-white/35">
            <ArchGlitchLine text={strings.tagline} variant="dialogue" quote={false} glitchChance={0.1} />
          </p>
        ) : (
          <p className="mt-2 text-[11px] tracking-[0.3em] text-white/50 uppercase">
            {strings.hub.upgradesSubtitle}
          </p>
        )}

      </div>


      <SkillTreeViewport
        selectedId={selectedId}
        onSelectSkill={toggleSkillSelection}
        onClearSelection={clearSkillSelection}
      />

      <div className="pointer-events-none absolute inset-0 z-10">
        <HubCornerControls />
        <div className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2">
          <CycleRunLauncher />
        </div>
      </div>
    </div>
  );
}
