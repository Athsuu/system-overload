import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { DARK_HEX_PIXI } from '../theme/darkHexTerminal';
import { getEnemyHexRadius } from './encounter';
import type { DissipationNode } from './types';

const BAR_HEIGHT = 4;
const BAR_GAP = 7;

const LEVEL_STYLE = new TextStyle({
  fontFamily: 'Rajdhani, monospace',
  fontSize: 11,
  fill: '#c5a059',
});

const HP_TEXT_STYLE = new TextStyle({
  fontFamily: 'Rajdhani, monospace',
  fontSize: 10,
  fill: '#b3a3f0',
});

export function drawEnemyHpBar(graphics: Graphics, node: DissipationNode): void {
  if (node.maxHp <= 0) return;

  const radius = getEnemyHexRadius(node.isBossEncounter);
  const barWidth = radius * 1.7;
  const ratio = Math.max(0, Math.min(1, node.hp / node.maxHp));
  const left = node.x - barWidth / 2;
  const top = node.y - radius - BAR_GAP - BAR_HEIGHT;
  const fillWidth = barWidth * ratio;
  const fillColor = node.isBossEncounter ? DARK_HEX_PIXI.breachGlow : DARK_HEX_PIXI.corruptCyan;

  graphics.rect(left, top, barWidth, BAR_HEIGHT);
  graphics.fill({ color: 0x0a0a0f, alpha: 0.72 });

  graphics.rect(left, top, barWidth, BAR_HEIGHT);
  graphics.stroke({ color: 0xffffff, width: 0.5, alpha: 0.18 });

  if (fillWidth > 0.5) {
    graphics.rect(left, top, fillWidth, BAR_HEIGHT);
    graphics.fill({ color: fillColor, alpha: 0.92 });
  }
}

interface DebugLabelPair {
  level: Text;
  hp: Text;
}

export class EnemyDebugOverlay {
  private readonly labelLayer = new Container();
  private readonly labels = new Map<number, DebugLabelPair>();

  constructor(parent: Container) {
    parent.addChild(this.labelLayer);
  }

  sync(nodes: readonly DissipationNode[], enabled: boolean): void {
    if (!enabled) {
      for (const entry of this.labels.values()) {
        entry.level.destroy();
        entry.hp.destroy();
      }
      this.labels.clear();
      this.labelLayer.removeChildren();
      return;
    }

    const activeSeeds = new Set<number>();

    for (const node of nodes) {
      activeSeeds.add(node.corruptSeed);
      let entry = this.labels.get(node.corruptSeed);
      if (!entry) {
        const level = new Text({ text: '', style: LEVEL_STYLE });
        const hp = new Text({ text: '', style: HP_TEXT_STYLE });
        this.labelLayer.addChild(level, hp);
        entry = { level, hp };
        this.labels.set(node.corruptSeed, entry);
      }

      const radius = getEnemyHexRadius(node.isBossEncounter);
      entry.level.text = `Lvl ${node.enemyLevel}`;
      entry.hp.text = `${Math.max(0, Math.ceil(node.hp))}/${node.maxHp}`;
      entry.level.x = node.x - entry.level.width / 2;
      entry.level.y = node.y - radius - 34;
      entry.hp.x = node.x - entry.hp.width / 2;
      entry.hp.y = node.y - radius - 20;
    }

    for (const [seed, entry] of this.labels) {
      if (activeSeeds.has(seed)) continue;
      entry.level.destroy();
      entry.hp.destroy();
      this.labels.delete(seed);
    }
  }

  destroy(): void {
    this.sync([], false);
    this.labelLayer.destroy({ children: true });
  }
}
