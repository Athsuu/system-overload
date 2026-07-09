import type { Graphics } from 'pixi.js';
import { DARK_HEX_PIXI } from '../../theme/darkHexTerminal';
import {
  drawRotatedFlatTopHexFill,
  drawRotatedFlatTopHexStroke,
} from '../hexDraw';
import { getLootPickupDrawY, getLootPickupHexRadius } from './pickups';
import type { LootPickup } from './types';

function drawHexShardPickup(graphics: Graphics, pickup: LootPickup): void {
  const drawY = getLootPickupDrawY(pickup);
  const radius = getLootPickupHexRadius(pickup.kind, pickup.amount);
  const pulse = 0.72 + Math.sin(pickup.elapsedMs * 0.006 + pickup.bobPhase) * 0.18;
  const rotation = pickup.elapsedMs * 0.0009 + pickup.bobPhase;

  drawRotatedFlatTopHexFill(
    graphics,
    pickup.x,
    drawY,
    radius * 1.35,
    rotation,
    DARK_HEX_PIXI.fluxGlow,
    0.12 * pulse,
  );
  drawRotatedFlatTopHexFill(
    graphics,
    pickup.x,
    drawY,
    radius,
    rotation,
    DARK_HEX_PIXI.fluxGlow,
    0.88 * pulse,
  );
  drawRotatedFlatTopHexStroke(
    graphics,
    pickup.x,
    drawY,
    radius,
    rotation,
    DARK_HEX_PIXI.purge,
    1.25,
    0.55 * pulse,
  );
}

export function drawLootPickup(graphics: Graphics, pickup: LootPickup): void {
  switch (pickup.kind) {
    case 'hexShard':
      drawHexShardPickup(graphics, pickup);
      break;
    default: {
      const _exhaustive: never = pickup.kind;
      return _exhaustive;
    }
  }
}

export function renderLootPickups(graphics: Graphics, pickups: LootPickup[]): void {
  graphics.clear();

  for (const pickup of pickups) {
    drawLootPickup(graphics, pickup);
  }
}
