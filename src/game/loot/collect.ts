import type { HubSfxId } from '../../audio/types';
import { useGameStore } from '../../store/useGameStore';
import type { CollectedLoot, LootKind } from './types';

export function applyLootCollection({ kind, amount }: CollectedLoot): void {
  if (amount <= 0) return;

  const store = useGameStore.getState();

  switch (kind) {
    case 'hexShard':
      store.addRunShards(amount);
      break;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function getLootCollectSfx(kind: LootKind): HubSfxId {
  switch (kind) {
    case 'hexShard':
      return 'purchase';
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
