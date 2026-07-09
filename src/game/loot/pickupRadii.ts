import {
  SHARD_MAGNET_COLLECT_RADIUS_BY_LEVEL,
  SHARD_MAGNET_MAGNET_RADIUS_BY_LEVEL,
  type UpgradeLevels,
} from '../../store/upgradeCatalog';
import type { LootKind, LootPickupRadii } from './types';

function getShardMagnetLevelIndex(level: number): number {
  return Math.max(0, Math.min(level, SHARD_MAGNET_COLLECT_RADIUS_BY_LEVEL.length - 1));
}

export function getShardMagnetCollectRadius(level: number): number {
  return SHARD_MAGNET_COLLECT_RADIUS_BY_LEVEL[getShardMagnetLevelIndex(level)];
}

export function getShardMagnetMagnetRadius(level: number): number {
  return SHARD_MAGNET_MAGNET_RADIUS_BY_LEVEL[getShardMagnetLevelIndex(level)];
}

/** Per-kind pickup reach — add cases when new loot kinds get their own magnet upgrades. */
export function getLootPickupRadii(upgrades: UpgradeLevels, kind: LootKind): LootPickupRadii {
  switch (kind) {
    case 'hexShard':
      return {
        collectRadius: getShardMagnetCollectRadius(upgrades.shardMagnet),
        magnetRadius: getShardMagnetMagnetRadius(upgrades.shardMagnet),
      };
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

/** Widest radii across active kinds — used when one pointer collects every pickup type. */
export function getLootPickupRadiiForTick(upgrades: UpgradeLevels): LootPickupRadii {
  return getLootPickupRadii(upgrades, 'hexShard');
}
