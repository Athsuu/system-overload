import { useGameStore } from '../store/useGameStore';
import { devKillAllEnemies, devToggleInvincible } from './devActions';
import { DevButton } from './DevButton';
import { useFpsMeter } from './useFpsMeter';

interface DevMenuHeaderProps {
  invincible: boolean;
  onInvincibleChange: (enabled: boolean) => void;
}

/** Bandeau toujours visible, peu importe l'onglet actif — état vital + actions d'urgence. */
export function DevMenuHeader({ invincible, onInvincibleChange }: DevMenuHeaderProps) {
  const gameState = useGameStore((state) => state.gameState);
  const breachProgress = useGameStore((state) => state.breachProgress);
  const bankShards = useGameStore((state) => state.bankShards);
  const bankAnchorFragments = useGameStore((state) => state.bankAnchorFragments);
  const seedFragments = useGameStore((state) => state.seedFragments);
  const waveIndex = useGameStore((state) => state.waveIndex);
  const fps = useFpsMeter(true);

  return (
    <div className="shrink-0 space-y-2 border-b border-white/8 px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[13px] text-white/60">
        <span>
          État : <span className="text-white/85">{gameState}</span>
        </span>
        <span>
          FPS : <span className={fps > 0 && fps < 50 ? 'text-red-300' : 'text-white/85'}>{fps || '—'}</span>
        </span>
        <span>Breach : {Math.round(breachProgress)}%</span>
        <span>Manche : {waveIndex > 0 ? waveIndex : '—'}</span>
        <span>Vault : {bankShards.toLocaleString()}</span>
        <span>Anchor : {bankAnchorFragments.toLocaleString()}</span>
        <span>Seed : {seedFragments.toLocaleString()}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <DevButton onClick={() => devKillAllEnemies()} variant="danger">
          Kill All
        </DevButton>
        <DevButton onClick={() => onInvincibleChange(devToggleInvincible())}>
          Invincible {invincible ? 'ON' : 'OFF'}
        </DevButton>
      </div>
    </div>
  );
}
