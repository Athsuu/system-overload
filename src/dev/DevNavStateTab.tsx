import { useGameStore, type GameState } from '../store/useGameStore';
import {
  devForceEndBreach,
  devForceVictoryBoss,
  devGetMaxWaveIndex,
  devJumpToWave,
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

export function DevNavStateTab() {
  const gameState = useGameStore((state) => state.gameState);
  const waveIndex = useGameStore((state) => state.waveIndex);
  const maxWaveIndex = devGetMaxWaveIndex();

  return (
    <div className="space-y-4">
      <DevSection
        title="Vagues"
        description="Saute à une vague en run (lance une run si besoin). Vide ennemis et loot au saut."
      >
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: maxWaveIndex }, (_, index) => {
            const wave = index + 1;
            const isBoss = wave === maxWaveIndex;
            const isCurrent = waveIndex === wave && (gameState === 'PLAYING' || gameState === 'PAUSED');
            return (
              <DevButton key={wave} onClick={() => devJumpToWave(wave)}>
                {isBoss ? `Boss (${wave})` : `Vague ${wave}`}
                {isCurrent ? ' ✓' : ''}
              </DevButton>
            );
          })}
        </div>
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
