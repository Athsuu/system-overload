import { useGameStore } from '../../store/useGameStore';
import { getRunConfig, getShardReward } from '../runConfig';
import type { DissipationNode } from '../types';
import { expandHexShardDrops } from './pickups';

import type { LootDrop } from './types';

/** Loot table for a single enemy kill. Add drops here as new currencies appear. */
export function getEnemyLootDrops(node: DissipationNode): LootDrop[] {
  const store = useGameStore.getState();
  const config = getRunConfig(store.upgrades);
  const shardAmount = getShardReward(config, node.waveIndex);

  return expandHexShardDrops(shardAmount);
}
