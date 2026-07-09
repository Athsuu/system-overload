import {
  SHARD_MAGNET_COLLECT_RADIUS_BY_LEVEL,
  SHARD_MAGNET_MAGNET_RADIUS_BY_LEVEL,
} from '../../store/upgradeCatalog';
import type { LootPickupRadii } from './types';

export const LOOT_PICKUP_MAGNET_SPEED = 240;
export const LOOT_PICKUP_BOB_AMPLITUDE = 3.5;
export const LOOT_PICKUP_BOB_SPEED = 0.0045;
/** Rayon min / max du spray de loot autour du point de mort (+38 px vs l'ancien max ~12). */
export const LOOT_PICKUP_SCATTER_MIN = 10;
export const LOOT_PICKUP_SCATTER_MAX = 50;
export const LOOT_PICKUP_SCATTER_JITTER = 12;

export const BASE_LOOT_PICKUP_RADII: LootPickupRadii = {
  collectRadius: SHARD_MAGNET_COLLECT_RADIUS_BY_LEVEL[0],
  magnetRadius: SHARD_MAGNET_MAGNET_RADIUS_BY_LEVEL[0],
};

/** Visual base radius per loot kind (before amount scaling). */
export const LOOT_PICKUP_HEX_RADIUS: Record<import('./types').LootKind, number> = {
  hexShard: 9,
};
