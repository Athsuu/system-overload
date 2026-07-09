import { useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useCallback, useLayoutEffect, useRef, type MutableRefObject, type RefObject } from 'react';
import type { OverclockState } from './overclock';
import { triggerGameSfx } from '../audio/sfxApi';
import { useGameStore } from '../store/useGameStore';
import { FLASH_DURATION_MS } from './constants';
import { handleEnemyKill } from './enemyCombat';
import { pushPurgeHit, pushDeathEffect, type GameEffect } from './effects';
import { purgePointerRef } from './purgeInput';
import {
  createPurgeVisualShake,
  drawPurgeZone,
  getPurgeVisualShake,
  isEnemyInPurgeZone,
  tickPurgeVisualShake,
  triggerPurgeVisualShake,
} from './purgeZone';
import { getRunConfig } from './runConfig';
import { scaleDeltaMs } from './runTimeScale';
import type { LootPickup } from './loot';
import type { DissipationNode } from './types';

const OVERCLOCK_CADENCE_MULT = 1.4;

interface PurgeZoneEngineProps {
  isPlaying: boolean;
  nodesRef: RefObject<DissipationNode[]>;
  effectsRef: RefObject<GameEffect[]>;
  pickupsRef: RefObject<LootPickup[]>;
  overclockRef: MutableRefObject<OverclockState>;
}

function getEnemiesInZone(
  nodes: DissipationNode[],
  purgeX: number,
  purgeY: number,
  purgeRadius: number,
): DissipationNode[] {
  const hits: DissipationNode[] = [];
  for (const node of nodes) {
    if (isEnemyInPurgeZone(node, purgeX, purgeY, purgeRadius)) {
      hits.push(node);
    }
  }
  return hits;
}

export function PurgeZoneEngine({
  isPlaying,
  nodesRef,
  effectsRef,
  pickupsRef,
  overclockRef,
}: PurgeZoneEngineProps) {
  const graphicsRef = useRef<Graphics | null>(null);
  const containerRef = useRef<Container | null>(null);
  const shakeRef = useRef(createPurgeVisualShake());
  const attackAccumulatorMsRef = useRef(0);
  const instantHitReadyRef = useRef(false);
  const pointerWasActiveRef = useRef(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const graphics = new Graphics();
    container.addChild(graphics);
    graphicsRef.current = graphics;

    return () => {
      container.removeChild(graphics);
      graphics.destroy();
      graphicsRef.current = null;
    };
  }, []);

  const applyPurgeHits = useCallback(
    (
      nodes: DissipationNode[],
      targets: DissipationNode[],
      damage: number,
      effects: GameEffect[],
      pickups: LootPickup[],
      intervalMs: number,
    ) => {
      let kills = 0;

      for (const node of targets) {
        const index = nodes.indexOf(node);
        if (index < 0) continue;

        node.hp -= damage;
        node.flashTimer = FLASH_DURATION_MS;
        pushPurgeHit(effects, node.x, node.y, node.waveIndex, node.enemyClass);

        if (node.hp > 0) continue;

        kills += 1;
        handleEnemyKill(node, pickups);
        pushDeathEffect(effects, node.x, node.y, node.waveIndex, node.enemyClass);
        nodes.splice(index, 1);
      }

      if (targets.length > 0) {
        triggerPurgeVisualShake(shakeRef.current, intervalMs);
        triggerGameSfx('purgeHit');
      }
      for (let killIndex = 0; killIndex < kills; killIndex += 1) {
        triggerGameSfx('purgeKill', killIndex * 0.032);
      }
    },
    [],
  );

  const tick = useCallback(
    (ticker: { deltaMS: number }) => {
      const graphics = graphicsRef.current;
      const nodes = nodesRef.current;
      if (!graphics || !nodes) return;
      if (useGameStore.getState().gameState !== 'PLAYING') return;

      graphics.clear();
      const tickDeltaMs = scaleDeltaMs(ticker.deltaMS);
      tickPurgeVisualShake(shakeRef.current, tickDeltaMs);

      const pointer = purgePointerRef;
      if (!pointer.active) {
        pointerWasActiveRef.current = false;
        attackAccumulatorMsRef.current = 0;
        instantHitReadyRef.current = false;
        shakeRef.current.remainingMs = 0;
        return;
      }

      if (!pointerWasActiveRef.current) {
        instantHitReadyRef.current = true;
        pointerWasActiveRef.current = true;
      }

      const store = useGameStore.getState();
      const config = getRunConfig(store.upgrades);
      const cadenceMult = overclockRef.current.active ? OVERCLOCK_CADENCE_MULT : 1;
      const intervalMs = config.purgeIntervalMs / cadenceMult;
      const effects = effectsRef.current ?? [];
      const pickups = pickupsRef.current ?? [];
      const shake = getPurgeVisualShake(shakeRef.current);

      drawPurgeZone(graphics, pointer.x, pointer.y, config.purgeRadius, shake);

      const targets = getEnemiesInZone(nodes, pointer.x, pointer.y, config.purgeRadius);
      if (targets.length === 0) return;

      if (instantHitReadyRef.current) {
        instantHitReadyRef.current = false;
        attackAccumulatorMsRef.current = 0;
        applyPurgeHits(nodes, targets, config.purgeHitDamage, effects, pickups, intervalMs);
        return;
      }

      const tickDelta = Math.min(tickDeltaMs, intervalMs);
      attackAccumulatorMsRef.current += tickDelta;

      if (attackAccumulatorMsRef.current < intervalMs) return;

      attackAccumulatorMsRef.current -= intervalMs;
      const refreshedTargets = getEnemiesInZone(
        nodes,
        pointer.x,
        pointer.y,
        config.purgeRadius,
      );
      if (refreshedTargets.length === 0) return;

      applyPurgeHits(nodes, refreshedTargets, config.purgeHitDamage, effects, pickups, intervalMs);
    },
    [applyPurgeHits, effectsRef, nodesRef, overclockRef, pickupsRef],
  );

  useTick({ callback: tick, isEnabled: isPlaying });

  return <pixiContainer ref={containerRef} />;
}
