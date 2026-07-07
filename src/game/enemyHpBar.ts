import type { Graphics } from 'pixi.js';
import { DARK_HEX_PIXI } from '../theme/darkHexTerminal';
import { getEnemyHexRadius } from './constants';
import type { DissipationNode } from './types';

const BAR_HEIGHT = 4;
const BAR_GAP = 7;

export function drawEnemyHpBar(graphics: Graphics, node: DissipationNode): void {
  if (node.maxHp <= 0) return;

  const radius = getEnemyHexRadius(node.tier, node.isBoss ?? false);
  const barWidth = radius * 1.7;
  const ratio = Math.max(0, Math.min(1, node.hp / node.maxHp));
  const left = node.x - barWidth / 2;
  const top = node.y - radius - BAR_GAP - BAR_HEIGHT;
  const fillWidth = barWidth * ratio;
  const fillColor = node.isBoss ? DARK_HEX_PIXI.breachGlow : DARK_HEX_PIXI.corruptCyan;

  graphics.rect(left, top, barWidth, BAR_HEIGHT);
  graphics.fill({ color: 0x0a0a0f, alpha: 0.72 });

  graphics.rect(left, top, barWidth, BAR_HEIGHT);
  graphics.stroke({ color: 0xffffff, width: 0.5, alpha: 0.18 });

  if (fillWidth > 0.5) {
    graphics.rect(left, top, fillWidth, BAR_HEIGHT);
    graphics.fill({ color: fillColor, alpha: 0.92 });
  }
}
