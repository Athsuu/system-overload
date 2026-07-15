import { useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useCallback, useLayoutEffect, useRef, type MutableRefObject, type RefObject } from 'react';
import type { OverclockState } from './overclock';
import { triggerGameSfx } from '../audio/sfxApi';
import { useGameStore } from '../store/useGameStore';
import { FLASH_DURATION_MS } from './constants';
import { handleEnemyKill } from './enemyCombat';
import { pushPurgeHit, pushDeathEffect, pushSplashShockwave, type GameEffect } from './effects';
import { triggerChromaticAberration, type ChromaticAberrationState } from './juice/chromaticAberration';
import { emitDamageApplied } from './juice/damageEvents';
import { rollCritical } from './juice/criticalHit';
import { triggerScreenShake, type ScreenShakeState } from './juice/screenShake';
import { purgePointerRef } from './purgeInput';
import {
  createPurgeVisualShake,
  drawPurgeZone,
  getPurgeVisualShake,
  isEnemyInPurgeZone,
  isEnemyInSplashRing,
  resolvePurgeHitVisualDurationMs,
  tickPurgeVisualShake,
  triggerPurgeVisualShake,
} from './purgeZone';
import { getRunConfig } from './runConfig';
import {
  getPurgeSplashRadius,
  resolvePurgeSplashDamage,
} from './moduleEffects';
import { getAnchorMultiplier } from './anchorSupercharge';
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
  screenShakeRef: MutableRefObject<ScreenShakeState>;
  chromaticAberrationRef: MutableRefObject<ChromaticAberrationState>;
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

function getEnemiesInSplashRing(
  nodes: DissipationNode[],
  purgeX: number,
  purgeY: number,
  purgeRadius: number,
  splashRadius: number,
): DissipationNode[] {
  const hits: DissipationNode[] = [];
  for (const node of nodes) {
    if (isEnemyInSplashRing(node, purgeX, purgeY, purgeRadius, splashRadius)) {
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
  screenShakeRef,
  chromaticAberrationRef,
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
      baseDamage: number,
      splashLevel: number,
      purgeRadius: number,
      purgeX: number,
      purgeY: number,
      effects: GameEffect[],
      pickups: LootPickup[],
      intervalMs: number,
      criticalChance: number,
      criticalMultiplier: number,
      splashAnchorMultiplier: number,
    ) => {
      let kills = 0;
      let hitCount = 0;

      const applyDamage = (node: DissipationNode, damage: number) => {
        const index = nodes.indexOf(node);
        if (index < 0 || damage <= 0) return;

        const crit = rollCritical(damage, criticalChance, criticalMultiplier);

        node.hp -= crit.damage;
        node.flashTimer = FLASH_DURATION_MS;
        pushPurgeHit(effects, node.x, node.y, node.waveIndex, node.isBossEncounter);
        hitCount += 1;

        emitDamageApplied({
          x: node.x,
          y: node.y,
          waveIndex: node.waveIndex,
          isBossEncounter: node.isBossEncounter,
          damage: crit.damage,
          isCritical: crit.isCritical,
        });

        if (crit.isCritical) {
          triggerScreenShake(screenShakeRef.current, 'critical');
          triggerChromaticAberration(chromaticAberrationRef.current);
        }

        if (node.hp > 0) return;

        kills += 1;
        if (node.isBossEncounter) {
          triggerScreenShake(screenShakeRef.current, 'bossDeath');
        }
        handleEnemyKill(node, pickups);
        pushDeathEffect(effects, node.x, node.y, node.waveIndex, node.isBossEncounter);
        nodes.splice(index, 1);
      };

      for (const node of targets) {
        applyDamage(node, baseDamage);
      }

      const hadMainPurgeHit = hitCount > 0;

      if (splashLevel > 0) {
        const splashRadius = getPurgeSplashRadius(purgeRadius, splashLevel, splashAnchorMultiplier);
        const splashDamage = resolvePurgeSplashDamage(baseDamage, splashLevel, splashAnchorMultiplier);
        const splashTargets = getEnemiesInSplashRing(
          nodes,
          purgeX,
          purgeY,
          purgeRadius,
          splashRadius,
        );
        for (const node of splashTargets) {
          if (nodes.indexOf(node) < 0) continue;
          applyDamage(node, splashDamage);
        }
        if (hadMainPurgeHit) {
          pushSplashShockwave(
            effects,
            purgeX,
            purgeY,
            purgeRadius,
            splashRadius,
            resolvePurgeHitVisualDurationMs(intervalMs) + 150,
          );
        }
      }

      if (hitCount > 0) {
        triggerPurgeVisualShake(shakeRef.current, intervalMs);
        triggerGameSfx('purgeHit');
      }
      for (let killIndex = 0; killIndex < kills; killIndex += 1) {
        triggerGameSfx('purgeKill', killIndex * 0.032);
      }
    },
    [chromaticAberrationRef, screenShakeRef],
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
      const splashLevel = store.upgrades.purgeSplash;
      const splashAnchorMultiplier = getAnchorMultiplier(store.anchoredNodes, 'purgeSplash');
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
        applyPurgeHits(
          nodes,
          targets,
          config.purgeHitDamage,
          splashLevel,
          config.purgeRadius,
          pointer.x,
          pointer.y,
          effects,
          pickups,
          intervalMs,
          config.criticalChance,
          config.criticalMultiplier,
          splashAnchorMultiplier,
        );
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

      applyPurgeHits(
        nodes,
        refreshedTargets,
        config.purgeHitDamage,
        splashLevel,
        config.purgeRadius,
        pointer.x,
        pointer.y,
        effects,
        pickups,
        intervalMs,
        config.criticalChance,
        config.criticalMultiplier,
        splashAnchorMultiplier,
      );
    },
    [applyPurgeHits, effectsRef, nodesRef, overclockRef, pickupsRef],
  );

  useTick({ callback: tick, isEnabled: isPlaying });

  return <pixiContainer ref={containerRef} />;
}
