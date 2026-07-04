import { useState } from 'react';
import type { GameState } from '../store/useGameStore';
import type { UpgradeId } from '../store/upgradeCatalog';
import { CurrencyBadge } from './CurrencyBadge';
import { GAME_NARRATIVE } from './gameNarrative';
import { PlayRunButton } from './PlayRunButton';
import { SkillTreeViewport } from './SkillTreeViewport';

interface SkillTreeScreenProps {
  mode: Extract<GameState, 'MENU' | 'UPGRADING'>;
}

export function SkillTreeScreen({ mode }: SkillTreeScreenProps) {
  const [selectedId, setSelectedId] = useState<UpgradeId | null>(null);
  const isMenu = mode === 'MENU';

  const toggleSkillSelection = (id: UpgradeId) => {
    setSelectedId((current) => (current === id ? null : id));
  };

  const clearSkillSelection = () => {
    setSelectedId(null);
  };

  return (
    <div className="pointer-events-auto absolute inset-0 overflow-hidden bg-[#0a0a0f]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center px-6 pt-8">
        <h1
          className="text-xl font-normal tracking-[0.35em] uppercase"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: '#c5a059' }}
        >
          {isMenu ? GAME_NARRATIVE.title : GAME_NARRATIVE.hub.upgradesTitle}
        </h1>

        {isMenu ? (
          <>
            <p className="mt-3 max-w-md text-center text-[11px] leading-relaxed tracking-[0.12em] text-white/50">
              {GAME_NARRATIVE.tagline}
            </p>
            <p className="mt-2 text-[10px] tracking-[0.22em] text-white/40 uppercase">
              {GAME_NARRATIVE.role}
            </p>
            <p className="mt-3 max-w-lg text-center text-[10px] leading-relaxed text-white/30">
              {GAME_NARRATIVE.objective}
            </p>
          </>
        ) : (
          <p className="mt-2 text-[11px] tracking-[0.3em] text-white/50 uppercase">
            {GAME_NARRATIVE.hub.upgradesSubtitle}
          </p>
        )}

        <div className="pointer-events-auto mt-5">
          <CurrencyBadge />
        </div>
      </div>

      <SkillTreeViewport
        selectedId={selectedId}
        onSelectSkill={toggleSkillSelection}
        onClearSelection={clearSkillSelection}
      />

      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="pointer-events-auto absolute right-8 bottom-8">
          <PlayRunButton />
        </div>
      </div>
    </div>
  );
}
