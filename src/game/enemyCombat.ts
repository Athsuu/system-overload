import { useGameStore } from '../store/useGameStore';
import { registerEnemyKill } from './horde/killCounter';
import { getEnemyLootDrops } from './loot/enemyLoot';
import { spawnLootDrops, type LootPickup } from './loot';
import { getKillBreachRelief } from './runConfig';
import type { DissipationNode } from './types';

export function handleEnemyKill(node: DissipationNode, pickups: LootPickup[]): void {
  spawnLootDrops(pickups, node.x, node.y, getEnemyLootDrops(node));
  registerEnemyKill();

  const store = useGameStore.getState();
  const breachRelief = getKillBreachRelief(store.upgrades);
  if (breachRelief > 0) {
    store.addBreachProgress(-breachRelief);
  }
}
