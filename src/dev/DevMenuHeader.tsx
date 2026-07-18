import { useEffect, useState } from 'react';
import { hordeAliveCountRef } from '../game/horde';
import { useGameStore } from '../store/useGameStore';
import { devKillAllEnemies, devToggleInvincible } from './devActions';
import { DevButton } from './DevButton';
import { useFpsMeter } from './useFpsMeter';

interface DevMenuHeaderProps {
  invincible: boolean;
  measureFps?: boolean;
  onInvincibleChange: (enabled: boolean) => void;
}

/** Bandeau toujours visible, peu importe l'onglet actif — état vital + actions d'urgence. */
export function DevMenuHeader({
  invincible,
  measureFps = true,
  onInvincibleChange,
}: DevMenuHeaderProps) {
  const gameState = useGameStore((state) => state.gameState);
  const breachProgress = useGameStore((state) => state.breachProgress);
  const bankShards = useGameStore((state) => state.bankShards);
  const bankAnchorFragments = useGameStore((state) => state.bankAnchorFragments);
  const seedFragments = useGameStore((state) => state.seedFragments);
  const runKills = useGameStore((state) => state.runKills);
  const fps = useFpsMeter(measureFps);
  const [aliveCount, setAliveCount] = useState(0);

  useEffect(() => {
    if (gameState !== 'PLAYING' && gameState !== 'PAUSED') {
      setAliveCount(0);
      return;
    }
    const id = window.setInterval(() => {
      setAliveCount(hordeAliveCountRef.current);
    }, 250);
    return () => window.clearInterval(id);
  }, [gameState]);

  return (
    <div className="shrink-0 space-y-2 border-b border-white/8 px-4 py-3">
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[13px] text-white/60">
        <span>
          État : <span className="text-white/85">{gameState}</span>
        </span>
        <span>
          FPS :{' '}
          <span className={fps > 0 && fps < 50 ? 'text-red-300' : 'text-white/85'}>
            {measureFps && fps > 0 ? fps : '—'}
          </span>
        </span>
        <span>Breach : {Math.round(breachProgress)}%</span>
        <span>
          Kills : {runKills} · Alive : {aliveCount}
        </span>
        <span>Hex Shards : {bankShards.toLocaleString()}</span>
        <span>Anchor : {bankAnchorFragments.toLocaleString()}</span>
        <span className="col-span-2">Seed : {seedFragments.toLocaleString()}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <DevButton onClick={() => devKillAllEnemies()} variant="danger">
          Tuer tout
        </DevButton>
        <DevButton onClick={() => onInvincibleChange(devToggleInvincible())}>
          Invincible {invincible ? 'ON' : 'OFF'}
        </DevButton>
      </div>
    </div>
  );
}
