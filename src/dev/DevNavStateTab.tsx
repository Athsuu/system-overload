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

const GAME_STATES: GameState[] = ['MAIN_MENU', 'MENU', 'PLAYING', 'PAUSED', 'RUN_END', 'UPGRADING', 'GAME_OVER'];

export function DevNavStateTab() {
  const gameState = useGameStore((state) => state.gameState);
  const waveIndex = useGameStore((state) => state.waveIndex);
  const maxWaveIndex = devGetMaxWaveIndex();

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-[14px] tracking-wider text-white/40 uppercase">Manches</p>
        <p className="mb-2 text-[13px] text-white/30">
          Saute à une manche en run (lance une run si besoin). Vide ennemis et loot au saut.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: maxWaveIndex }, (_, index) => {
            const wave = index + 1;
            const isBoss = wave === maxWaveIndex;
            const isCurrent = waveIndex === wave && (gameState === 'PLAYING' || gameState === 'PAUSED');
            return (
              <DevButton key={wave} onClick={() => devJumpToWave(wave)}>
                {isBoss ? `Boss (${wave})` : `Manche ${wave}`}
                {isCurrent ? ' ✓' : ''}
              </DevButton>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[14px] tracking-wider text-white/40 uppercase">Breach</p>
        <div className="flex flex-wrap gap-1.5">
          <DevButton onClick={() => devSetBreachProgress(50)}>50%</DevButton>
          <DevButton onClick={() => devSetBreachProgress(90)}>90%</DevButton>
          <DevButton onClick={() => devForceEndBreach()} variant="danger">
            Meltdown
          </DevButton>
          <DevButton onClick={() => devForceVictoryBoss()}>Victory boss</DevButton>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[14px] tracking-wider text-white/40 uppercase">État jeu</p>
        <div className="flex flex-wrap gap-1.5">
          {GAME_STATES.map((state) => (
            <DevButton key={state} onClick={() => devSetGameState(state)}>
              {state}
            </DevButton>
          ))}
        </div>
      </div>
    </div>
  );
}
