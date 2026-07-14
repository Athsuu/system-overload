import {
  BASE_LOOT_PICKUP_RADII,
  LOOT_PICKUP_BOB_AMPLITUDE,
  LOOT_PICKUP_BOB_SPEED,
  LOOT_PICKUP_HEX_RADIUS,
  LOOT_PICKUP_MAGNET_SPEED,
  LOOT_PICKUP_SCATTER_JITTER,
  LOOT_PICKUP_SCATTER_MAX,
  LOOT_PICKUP_SCATTER_MIN,
} from './constants';
import type {
  CollectedLoot,
  LootDrop,
  LootPickup,
  LootPickupRadii,
} from './types';

function scatterOffset(): { x: number; y: number } {
  const angle = Math.random() * Math.PI * 2;
  const distance = LOOT_PICKUP_SCATTER_MIN + Math.random() * (LOOT_PICKUP_SCATTER_MAX - LOOT_PICKUP_SCATTER_MIN);
  const jitterX = (Math.random() - 0.5) * LOOT_PICKUP_SCATTER_JITTER;
  const jitterY = (Math.random() - 0.5) * LOOT_PICKUP_SCATTER_JITTER;

  return {
    x: Math.cos(angle) * distance + jitterX,
    y: Math.sin(angle) * distance + jitterY,
  };
}

/** One world pickup per shard — loot feedback matches payout. */
export function expandHexShardDrops(totalShards: number): LootDrop[] {
  return Array.from({ length: totalShards }, () => ({ kind: 'hexShard' as const, amount: 1 }));
}

export function spawnLootDrops(
  pickups: LootPickup[],
  x: number,
  y: number,
  drops: readonly LootDrop[],
): void {
  for (const drop of drops) {
    if (drop.amount <= 0) continue;

    const offset = scatterOffset();
    pickups.push({
      kind: drop.kind,
      x: x + offset.x,
      y: y + offset.y,
      amount: drop.amount,
      elapsedMs: 0,
      bobPhase: Math.random() * Math.PI * 2,
    });
  }
}

export function getLootPickupHexRadius(kind: LootPickup['kind'], amount: number): number {
  return LOOT_PICKUP_HEX_RADIUS[kind] + Math.min(amount - 1, 3) * 1.4;
}

export function getLootPickupDrawY(pickup: LootPickup): number {
  return (
    pickup.y +
    Math.sin(pickup.elapsedMs * LOOT_PICKUP_BOB_SPEED + pickup.bobPhase) * LOOT_PICKUP_BOB_AMPLITUDE
  );
}

export function tickLootPickups(
  pickups: LootPickup[],
  pointerX: number,
  pointerY: number,
  pointerActive: boolean,
  deltaMs: number,
  radii: LootPickupRadii = BASE_LOOT_PICKUP_RADII,
): CollectedLoot[] {
  const collected: CollectedLoot[] = [];

  for (let index = pickups.length - 1; index >= 0; index -= 1) {
    const pickup = pickups[index];
    pickup.elapsedMs += deltaMs;

    if (!pointerActive) continue;

    let dx = pointerX - pickup.x;
    let dy = pointerY - pickup.y;
    let distance = Math.hypot(dx, dy);

    if (distance <= radii.magnetRadius && distance > 0.001) {
      const step = Math.min(LOOT_PICKUP_MAGNET_SPEED * (deltaMs / 1000), distance * 0.7);
      pickup.x += (dx / distance) * step;
      pickup.y += (dy / distance) * step;

      dx = pointerX - pickup.x;
      dy = pointerY - pickup.y;
      distance = Math.hypot(dx, dy);
    }

    if (distance <= radii.collectRadius) {
      collected.push({ kind: pickup.kind, amount: pickup.amount, x: pickup.x, y: pickup.y });
      pickups.splice(index, 1);
    }
  }

  return collected;
}
