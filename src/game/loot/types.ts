/** Loot kinds that can spawn as world pickups. Extend this union when adding currencies. */
export type LootKind = 'hexShard';

/** Reward payload produced by gameplay (kill, chest, boss, etc.). */
export interface LootDrop {
  kind: LootKind;
  amount: number;
}

/** Mutable world entity — positions live in a ref, never in Zustand. */
export interface LootPickup {
  kind: LootKind;
  x: number;
  y: number;
  amount: number;
  elapsedMs: number;
  bobPhase: number;
}

export interface LootPickupRadii {
  collectRadius: number;
  magnetRadius: number;
}

export interface CollectedLoot {
  kind: LootKind;
  amount: number;
}
