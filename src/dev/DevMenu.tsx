import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { UPGRADE_CATALOG, type UpgradeId } from '../store/upgradeCatalog';
import { useGameStore, type GameState } from '../store/useGameStore';
import {
  devAddBankShards,
  devAddRunShards,
  devForceEndBreach,
  devForceVictoryBoss,
  devMaxAllUpgrades,
  devResetUpgrades,
  devSetBreachProgress,
  devSetGameState,
  devSetUpgradeLevel,
  devTogglePrestigeUnlocked,
  devWipeProgress,
} from './devActions';

const GAME_STATES: GameState[] = ['MENU', 'PLAYING', 'PAUSED', 'DRAFT', 'RUN_END', 'UPGRADING', 'GAME_OVER'];

const selectClassName =
  'w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white/80 outline-none focus:border-cyan-500/40';

function DevButton({
  children,
  onClick,
  variant = 'default',
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
}) {
  const base =
    'rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40';
  const styles =
    variant === 'danger'
      ? 'border-red-500/30 bg-red-500/10 text-red-300 hover:border-red-400 hover:bg-red-500/20'
      : 'border-white/10 bg-white/5 text-white/80 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200';

  return (
    <button type="button" className={`${base} ${styles}`} onClick={onClick}>
      {children}
    </button>
  );
}

export function DevMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUpgradeId, setSelectedUpgradeId] = useState<UpgradeId>(UPGRADE_CATALOG[0].id);
  const gameState = useGameStore((state) => state.gameState);
  const breachProgress = useGameStore((state) => state.breachProgress);
  const bankShards = useGameStore((state) => state.bankShards);
  const runShards = useGameStore((state) => state.runShards);
  const prestigeUnlocked = useGameStore((state) => state.prestigeUnlocked);
  const upgrades = useGameStore((state) => state.upgrades);

  const selectedDefinition = useMemo(
    () => UPGRADE_CATALOG.find((entry) => entry.id === selectedUpgradeId) ?? UPGRADE_CATALOG[0],
    [selectedUpgradeId],
  );
  const currentLevel = upgrades[selectedUpgradeId];
  const levelOptions = useMemo(
    () => Array.from({ length: selectedDefinition.maxLevel + 1 }, (_, level) => level),
    [selectedDefinition.maxLevel],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === '`' || (event.key === 'd' && event.ctrlKey && event.shiftKey)) {
        event.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="pointer-events-auto fixed bottom-4 left-4 z-50 font-sans">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[10px] font-bold tracking-widest text-amber-400 uppercase backdrop-blur-md hover:bg-amber-500/20"
        >
          DEV
        </button>
      )}

      {isOpen && (
        <div className="w-72 rounded-2xl border border-amber-500/20 bg-black/80 p-4 shadow-2xl backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
              Menu Dev
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-white/40 hover:text-white/70"
            >
              Fermer
            </button>
          </div>

          <div className="mb-4 space-y-1 rounded-lg border border-white/5 bg-white/5 px-3 py-2 font-mono text-[11px] text-white/60">
            <p>État : {gameState}</p>
            <p>Breach : {Math.round(breachProgress)}%</p>
            <p>Vault : {bankShards.toLocaleString()} Shards</p>
            <p>Run : {runShards.toLocaleString()} Shards</p>
            <p>Prestige : {prestigeUnlocked ? 'unlocked' : 'locked'}</p>
          </div>

          <p className="mb-2 text-[10px] tracking-wider text-white/40 uppercase">État jeu</p>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {GAME_STATES.map((state) => (
              <DevButton
                key={state}
                onClick={() => devSetGameState(state)}
                variant={gameState === state ? 'default' : 'default'}
              >
                {state}
              </DevButton>
            ))}
          </div>

          <p className="mb-2 text-[10px] tracking-wider text-white/40 uppercase">Monnaie</p>
          <div className="mb-4 flex flex-wrap gap-1.5">
            <DevButton onClick={() => devAddBankShards(1000)}>+1k vault</DevButton>
            <DevButton onClick={() => devAddBankShards(10000)}>+10k vault</DevButton>
            {gameState === 'PLAYING' && (
              <DevButton onClick={() => devAddRunShards(100)}>+100 run</DevButton>
            )}
          </div>

          <p className="mb-2 text-[10px] tracking-wider text-white/40 uppercase">Breach</p>
          <div className="mb-4 flex flex-wrap gap-1.5">
            <DevButton onClick={() => devSetBreachProgress(50)}>50%</DevButton>
            <DevButton onClick={() => devSetBreachProgress(90)}>90%</DevButton>
            <DevButton onClick={() => devForceEndBreach()} variant="danger">
              Meltdown
            </DevButton>
            <DevButton onClick={() => devForceVictoryBoss()}>Victory boss</DevButton>
          </div>

          <p className="mb-2 text-[10px] tracking-wider text-white/40 uppercase">Progression</p>
          <div className="mb-4 flex flex-wrap gap-1.5">
            <DevButton onClick={() => devMaxAllUpgrades()}>Max upgrades</DevButton>
            <DevButton onClick={() => devTogglePrestigeUnlocked()}>Toggle prestige</DevButton>
            <DevButton onClick={() => devResetUpgrades()}>Reset upgrades</DevButton>
            <DevButton onClick={() => devWipeProgress()} variant="danger">
              Wipe save
            </DevButton>
          </div>

          <p className="mb-2 text-[10px] tracking-wider text-white/40 uppercase">Enhancements</p>
          <div className="mb-4 space-y-2 rounded-lg border border-white/5 bg-white/5 p-2">
            <label className="block space-y-1">
              <span className="text-[10px] text-white/45">Skill</span>
              <select
                className={selectClassName}
                value={selectedUpgradeId}
                onChange={(event) => setSelectedUpgradeId(event.target.value as UpgradeId)}
              >
                {UPGRADE_CATALOG.map((definition) => (
                  <option key={definition.id} value={definition.id}>
                    {definition.name} (LVL {upgrades[definition.id]}/{definition.maxLevel})
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] text-white/45">Niveau</span>
              <select
                className={selectClassName}
                value={currentLevel}
                onChange={(event) =>
                  devSetUpgradeLevel(selectedUpgradeId, Number(event.target.value))
                }
              >
                {levelOptions.map((level) => (
                  <option key={level} value={level}>
                    LVL {level}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-[10px] leading-relaxed text-white/35">{selectedDefinition.description}</p>
          </div>

          <p className="text-[10px] text-white/30">Raccourci : ` ou Ctrl+Shift+D</p>
        </div>
      )}
    </div>
  );
}
