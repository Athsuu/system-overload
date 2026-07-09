import {
  BASE_LOOT_PICKUP_RADII,
  LOOT_PICKUP_BOB_AMPLITUDE,
  LOOT_PICKUP_BOB_SPEED,
  LOOT_PICKUP_HEX_RADIUS,
  LOOT_PICKUP_MAGNET_SPEED,
  LOOT_PICKUP_SCATTER_RADIUS,
} from './constants';
import type {
  CollectedLoot,
  LootDrop,
  LootPickup,
  LootPickupRadii,
} from './types';

function scatterOffset(index: number, total: number): { x: number; y: number } {
  if (total <= 1) return { x: 0, y: 0 };

  const angle = (index / total) * Math.PI * 2 + Math.random() * 0.35;
  const distance = LOOT_PICKUP_SCATTER_RADIUS * (0.45 + Math.random() * 0.55);
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
  };
}

export function spawnLootDrops(
  pickups: LootPickup[],
  x: number,
  y: number,
  drops: LootDrop[],
): void {
  const validDrops = drops.filter((drop) => drop.amount > 0);
  if (validDrops.length === 0) return;

  for (let index = 0; index < validDrops.length; index += 1) {
    const drop = validDrops[index];
    const offset = scatterOffset(index, validDrops.length);

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
  const base = LOOT_PICKUP_HEX_RADIUS[kind];
  return base + Math.min(amount - 1, 3) * 1.4;
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

    const dx = pointerX - pickup.x;
    const dy = pointerY - pickup.y;
    const distance = Math.hypot(dx, dy);

    if (distance <= radii.magnetRadius && distance > 0.001) {
      const step = Math.min(LOOT_PICKUP_MAGNET_SPEED * (deltaMs / 1000), distance * 0.7);
      pickup.x += (dx / distance) * step;
      pickup.y += (dy / distance) * step;
    }

    const collectDistance = Math.hypot(pointerX - pickup.x, pointerY - pickup.y);
    if (collectDistance <= radii.collectRadius) {
      collected.push({ kind: pickup.kind, amount: pickup.amount });
      pickups.splice(index, 1);
    }
  }

  return collected;
}
