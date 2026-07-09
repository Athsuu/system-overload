import {
  SHARD_MAGNET_COLLECT_RADIUS_BY_LEVEL,
  SHARD_MAGNET_MAGNET_RADIUS_BY_LEVEL,
} from '../../store/upgradeCatalog';
import type { LootPickupRadii } from './types';

export const LOOT_PICKUP_MAGNET_SPEED = 240;
export const LOOT_PICKUP_BOB_AMPLITUDE = 3.5;
export const LOOT_PICKUP_BOB_SPEED = 0.0045;
export const LOOT_PICKUP_SCATTER_RADIUS = 12;

export const BASE_LOOT_PICKUP_RADII: LootPickupRadii = {
  collectRadius: SHARD_MAGNET_COLLECT_RADIUS_BY_LEVEL[0],
  magnetRadius: SHARD_MAGNET_MAGNET_RADIUS_BY_LEVEL[0],
};

/** Visual base radius per loot kind (before amount scaling). */
export const LOOT_PICKUP_HEX_RADIUS: Record<import('./types').LootKind, number> = {
  hexShard: 9,
};
