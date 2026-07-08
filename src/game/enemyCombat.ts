import { useGameStore } from '../store/useGameStore';
import { getKillBreachRelief, getRunConfig, getShardReward } from './runConfig';
import type { DissipationNode } from './types';

export function handleEnemyKill(node: DissipationNode): void {
  const store = useGameStore.getState();
  const config = getRunConfig(store.upgrades);
  store.addRunShards(getShardReward(config, node.waveIndex, node.isBoss ?? false));

  const breachRelief = getKillBreachRelief(store.upgrades, node.waveIndex);
  if (breachRelief > 0) {
    store.addBreachProgress(-breachRelief);
  }
}
