import { type ReactNode, useEffect, useState } from 'react';
import { useGameStore, type GameState } from '../store/useGameStore';
import {
  devAddBankShards,
  devAddRunShards,
  devClearCycleFlags,
  devForceEndBreach,
  devForceVictoryBoss,
  devMarkCycleCleared,
  devMaxAllUpgrades,
  devResetToNewPlayer,
  devResetArchDialogues,
  devResetTutorial,
  devResetUpgrades,
  devSetBreachProgress,
  devSetGameState,
  devToggleInvincible,
  devTogglePrestigeUnlocked,
  devToggleShowEnemyHpBars,
  devToggleSkillTreeHexGrid,
  devToggleSpeed2x,
  devUnlockCycle,
  devWipeProgress,
} from './devActions';
import { DevUpgradePanel } from './DevUpgradePanel';
import { DevRunSimPanel } from './DevRunSimPanel';

const GAME_STATES: GameState[] = ['MAIN_MENU', 'MENU', 'PLAYING', 'PAUSED', 'RUN_END', 'UPGRADING', 'GAME_OVER'];

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
  const [invincible, setInvincible] = useState(false);
  const [enemyHpBars, setEnemyHpBars] = useState(false);
  const [speed2x, setSpeed2x] = useState(false);
  const [hexGrid, setHexGrid] = useState(false);
  const gameState = useGameStore((state) => state.gameState);
  const breachProgress = useGameStore((state) => state.breachProgress);
  const bankShards = useGameStore((state) => state.bankShards);
  const runShards = useGameStore((state) => state.runShards);
  const prestigeUnlocked = useGameStore((state) => state.prestigeUnlocked);
  const highestCycleUnlocked = useGameStore((state) => state.highestCycleUnlocked);
  const selectedCycle = useGameStore((state) => state.selectedCycle);
  const activeCycle = useGameStore((state) => state.activeCycle);
  const cyclesCleared = useGameStore((state) => state.cyclesCleared);

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
    <div className="pointer-events-auto fixed right-4 bottom-4 z-50 flex flex-col items-end font-sans">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[14px] font-bold tracking-widest text-amber-400 uppercase backdrop-blur-md hover:bg-amber-500/20"
        >
          DEV
        </button>
      )}

      {isOpen && (
        <div className="flex max-h-[calc(100dvh-2rem)] w-80 flex-col overflow-hidden rounded-2xl border border-amber-500/20 bg-black/80 shadow-2xl backdrop-blur-md">
          <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-4 py-3">
            <span className="text-[14px] font-bold tracking-widest text-amber-400 uppercase">
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

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          <div className="mb-4 space-y-1 rounded-lg border border-white/5 bg-white/5 px-3 py-2 font-mono text-[15px] text-white/60">
            <p>État : {gameState}</p>
            <p>Breach : {Math.round(breachProgress)}%</p>
            <p>Vault : {bankShards.toLocaleString()} Shards</p>
            <p>Run : {runShards.toLocaleString()} Shards</p>
            <p>Prestige : {prestigeUnlocked ? 'unlocked' : 'locked'}</p>
            <p>
              Cycles : {selectedCycle}/{highestCycleUnlocked} (run {activeCycle}) · cleared [
              {cyclesCleared.join(', ') || '—'}]
            </p>
            <p>Invincible : {invincible ? 'ON' : 'OFF'}</p>
            <p>Enemy HP : {enemyHpBars ? 'ON' : 'OFF'}</p>
            <p>Vitesse : {speed2x ? '×2' : '×1'}</p>
            <p>Grille hex : {hexGrid ? 'ON' : 'OFF'}</p>
          </div>

          <p className="mb-2 text-[14px] tracking-wider text-white/40 uppercase">Run debug</p>
          <div className="mb-4 flex flex-wrap gap-1.5">
            <DevButton onClick={() => setInvincible(devToggleInvincible())}>
              Invincible {invincible ? 'ON' : 'OFF'}
            </DevButton>
            <DevButton onClick={() => setEnemyHpBars(devToggleShowEnemyHpBars())}>
              Enemy HP {enemyHpBars ? 'ON' : 'OFF'}
            </DevButton>
            <DevButton onClick={() => setSpeed2x(devToggleSpeed2x())}>
              Vitesse ×2 {speed2x ? 'ON' : 'OFF'}
            </DevButton>
          </div>

          <p className="mb-2 text-[14px] tracking-wider text-white/40 uppercase">État jeu</p>
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

          <p className="mb-2 text-[14px] tracking-wider text-white/40 uppercase">Monnaie</p>
          <div className="mb-4 flex flex-wrap gap-1.5">
            <DevButton onClick={() => devAddBankShards(1000)}>+1k vault</DevButton>
            <DevButton onClick={() => devAddBankShards(10000)}>+10k vault</DevButton>
            {gameState === 'PLAYING' && (
              <DevButton onClick={() => devAddRunShards(100)}>+100 run</DevButton>
            )}
          </div>

          <p className="mb-2 text-[14px] tracking-wider text-white/40 uppercase">Breach</p>
          <div className="mb-4 flex flex-wrap gap-1.5">
            <DevButton onClick={() => devSetBreachProgress(50)}>50%</DevButton>
            <DevButton onClick={() => devSetBreachProgress(90)}>90%</DevButton>
            <DevButton onClick={() => devForceEndBreach()} variant="danger">
              Meltdown
            </DevButton>
            <DevButton onClick={() => devForceVictoryBoss()}>Victory boss</DevButton>
          </div>

          <p className="mb-2 text-[14px] tracking-wider text-white/40 uppercase">Tutoriel</p>
          <p className="mb-2 text-[14px] text-white/30">
            Réaffiche les cartes ARCH depuis le début (hub). Ferme ce menu — la carte apparaît derrière.
          </p>
          <div className="mb-4 flex flex-wrap gap-1.5">
            <DevButton
              onClick={() => {
                devResetTutorial();
                setIsOpen(false);
              }}
            >
              Reset tutoriel
            </DevButton>
            <DevButton onClick={() => devResetArchDialogues()}>Reset dialogues run</DevButton>
          </div>

          <p className="mb-2 text-[14px] tracking-wider text-white/40 uppercase">Cycles</p>
          <div className="mb-4 flex flex-wrap gap-1.5">
            <DevButton onClick={() => devUnlockCycle(2)}>Unlock C2</DevButton>
            <DevButton onClick={() => devUnlockCycle(3)}>Unlock C3</DevButton>
            <DevButton onClick={() => devMarkCycleCleared(selectedCycle)}>Mark cleared</DevButton>
            <DevButton onClick={() => devClearCycleFlags()}>Clear cycle flags</DevButton>
          </div>

          <p className="mb-2 text-[14px] tracking-wider text-white/40 uppercase">Progression</p>
          <p className="mb-2 text-[14px] text-white/30">
            « Reset nouveau joueur » efface tout (Shards, skill tree, audio 50 %, vue skill tree).
          </p>
          <div className="mb-4 flex flex-wrap gap-1.5">
            <DevButton onClick={() => devMaxAllUpgrades()}>Max upgrades</DevButton>
            <DevButton onClick={() => devTogglePrestigeUnlocked()}>Toggle prestige</DevButton>
            <DevButton onClick={() => devResetUpgrades()}>Reset upgrades</DevButton>
            <DevButton onClick={() => devWipeProgress()} variant="danger">
              Wipe save
            </DevButton>
            <DevButton onClick={() => devResetToNewPlayer()} variant="danger">
              Reset nouveau joueur
            </DevButton>
          </div>

          <p className="mb-2 text-[14px] tracking-wider text-white/40 uppercase">Simulation run</p>
          <div className="mb-4">
            <DevRunSimPanel />
          </div>

          <p className="mb-2 text-[14px] tracking-wider text-white/40 uppercase">Skill Tree</p>
          <p className="mb-2 text-[14px] text-white/30">
            Grille hex alignée sur node0 — survole une case pour lire sa coordonnée et le chemin
            (ex. threadCoolant → bas-droite).
          </p>
          <div className="mb-4 flex flex-wrap gap-1.5">
            <DevButton onClick={() => setHexGrid(devToggleSkillTreeHexGrid())}>
              Grille hex {hexGrid ? 'ON' : 'OFF'}
            </DevButton>
          </div>
          <p className="mb-2 text-[14px] text-white/30">Permanent upgrades (Initial Relay, Bolt Power, etc.)</p>
          <div className="mb-4">
            <DevUpgradePanel />
          </div>
          </div>

          <div className="shrink-0 border-t border-white/8 px-4 py-2">
            <p className="text-[14px] text-white/30">Raccourci : ` ou Ctrl+Shift+D</p>
          </div>
        </div>
      )}
    </div>
  );
}
