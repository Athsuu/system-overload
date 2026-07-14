import {
  SHARD_MAGNET_COLLECT_RADIUS_BY_LEVEL,
  SHARD_MAGNET_MAGNET_RADIUS_BY_LEVEL,
  type AnchoredNodes,
  type UpgradeLevels,
} from '../../store/upgradeCatalog';
import { getAnchorMultiplier } from '../anchorSupercharge';
import type { LootKind, LootPickupRadii } from './types';

const NO_ANCHORED_NODES: AnchoredNodes = {};

function getShardMagnetLevelIndex(level: number): number {
  return Math.max(0, Math.min(level, SHARD_MAGNET_COLLECT_RADIUS_BY_LEVEL.length - 1));
}

export function getShardMagnetCollectRadius(level: number, anchorMultiplier = 1): number {
  return SHARD_MAGNET_COLLECT_RADIUS_BY_LEVEL[getShardMagnetLevelIndex(level)] * anchorMultiplier;
}

export function getShardMagnetMagnetRadius(level: number, anchorMultiplier = 1): number {
  return SHARD_MAGNET_MAGNET_RADIUS_BY_LEVEL[getShardMagnetLevelIndex(level)] * anchorMultiplier;
}

/** Per-kind pickup reach — add cases when new loot kinds get their own magnet upgrades. */
export function getLootPickupRadii(
  upgrades: UpgradeLevels,
  kind: LootKind,
  anchoredNodes: AnchoredNodes = NO_ANCHORED_NODES,
): LootPickupRadii {
  switch (kind) {
    case 'hexShard': {
      const anchorMultiplier = getAnchorMultiplier(anchoredNodes, 'shardMagnet');
      return {
        collectRadius: getShardMagnetCollectRadius(upgrades.shardMagnet, anchorMultiplier),
        magnetRadius: getShardMagnetMagnetRadius(upgrades.shardMagnet, anchorMultiplier),
      };
    }
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

/** Widest radii across active kinds — used when one pointer collects every pickup type. */
export function getLootPickupRadiiForTick(
  upgrades: UpgradeLevels,
  anchoredNodes: AnchoredNodes = NO_ANCHORED_NODES,
): LootPickupRadii {
  return getLootPickupRadii(upgrades, 'hexShard', anchoredNodes);
}
