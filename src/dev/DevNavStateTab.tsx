import { BOSS_KILL_THRESHOLD } from '../game/horde';
import { useGameStore, type GameState } from '../store/useGameStore';
import {
  devForceBossSpawn,
  devForceEndBreach,
  devForceVictoryBoss,
  devJumpToKills,
  devSetBreachProgress,
  devSetGameState,
} from './devActions';
import { DevButton } from './DevButton';
import { DevPanel, DevSection } from './devUi';

const GAME_STATES: GameState[] = ['MAIN_MENU', 'MENU', 'PLAYING', 'PAUSED', 'RUN_END', 'UPGRADING', 'GAME_OVER'];

const GAME_STATE_HINT: Partial<Record<GameState, string>> = {
  MAIN_MENU: 'Écran titre',
  MENU: 'Hub / arbre modules',
  PLAYING: 'Run en cours',
  PAUSED: 'Pause run',
  RUN_END: 'Fin de run',
  UPGRADING: 'Module tree (achats)',
  GAME_OVER: 'Game over',
};

const KILL_JUMPS = [0, 25, 37, 50, 75];

export function DevNavStateTab() {
  const gameState = useGameStore((state) => state.gameState);
  const runKills = useGameStore((state) => state.runKills);
  const runPhase = useGameStore((state) => state.runPhase);

  return (
    <div className="space-y-4">
      <DevSection
        title="Horde / kills"
        description={`Boss à ${BOSS_KILL_THRESHOLD} kills. Force boss stoppe le spawn horde.`}
      >
        <div className="flex flex-wrap gap-1.5">
          {KILL_JUMPS.map((kills) => {
            const isCurrent =
              runKills === kills && (gameState === 'PLAYING' || gameState === 'PAUSED');
            return (
              <DevButton key={kills} onClick={() => devJumpToKills(kills)}>
                {kills} kills
                {isCurrent ? ' ✓' : ''}
              </DevButton>
            );
          })}
          <DevButton onClick={() => devForceBossSpawn()}>
            Force boss
            {runPhase === 'boss' ? ' ✓' : ''}
          </DevButton>
        </div>
        <p className="mt-2 text-[12px] text-white/35">
          Kills : {runKills}/{BOSS_KILL_THRESHOLD} · Phase : {runPhase}
        </p>
      </DevSection>

      <DevSection title="Breach">
        <DevPanel>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <DevButton onClick={() => devSetBreachProgress(50)}>50%</DevButton>
            <DevButton onClick={() => devSetBreachProgress(90)}>90%</DevButton>
            <DevButton onClick={() => devForceEndBreach()} variant="danger">
              Meltdown
            </DevButton>
            <DevButton onClick={() => devForceVictoryBoss()}>Victoire boss</DevButton>
          </div>
        </DevPanel>
      </DevSection>

      <DevSection title="Écran jeu" description="Force un écran sans sauvegarder la progression.">
        <div className="flex flex-wrap gap-1.5">
          {GAME_STATES.map((state) => (
            <DevButton key={state} onClick={() => devSetGameState(state)}>
              {state}
              {gameState === state ? ' ✓' : ''}
            </DevButton>
          ))}
        </div>
        <p className="mt-2 text-[12px] text-white/35">
          Actuel : {gameState}
          {GAME_STATE_HINT[gameState] ? ` — ${GAME_STATE_HINT[gameState]}` : ''}
        </p>
      </DevSection>
    </div>
  );
}
