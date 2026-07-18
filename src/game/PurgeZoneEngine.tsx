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
import { applyHitOverload } from './overload';
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

function hasEnemyInZone(
  nodes: DissipationNode[],
  purgeX: number,
  purgeY: number,
  purgeRadius: number,
): boolean {
  for (let i = 0; i < nodes.length; i += 1) {
    if (isEnemyInPurgeZone(nodes[i], purgeX, purgeY, purgeRadius)) return true;
  }
  return false;
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
      explosivePurgeEnabled: boolean,
      explosivePurgeRadiusPx: number,
      explosivePurgeDamageRatio: number,
      explosivePurgeChainDepth: number,
    ) => {
      let kills = 0;
      let hitCount = 0;
      const explodedOrigins = new Set<DissipationNode>();
      const blastRadiusSq = explosivePurgeRadiusPx * explosivePurgeRadiusPx;

      const applyDamageAtIndex = (
        index: number,
        damage: number,
        chainRemaining: number | null,
      ) => {
        if (index < 0 || index >= nodes.length || damage <= 0) return;

        const node = nodes[index];
        const crit = rollCritical(damage, criticalChance, criticalMultiplier);

        node.hp -= crit.damage;
        node.flashTimer = FLASH_DURATION_MS;
        pushPurgeHit(effects, node.x, node.y, node.enemyLevel, node.isBossEncounter);
        hitCount += 1;
        applyHitOverload({ maxHp: node.maxHp, cycle: node.enemyLevel });

        emitDamageApplied({
          x: node.x,
          y: node.y,
          enemyLevel: node.enemyLevel,
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
        const deathX = node.x;
        const deathY = node.y;
        handleEnemyKill(node, pickups);
        pushDeathEffect(effects, deathX, deathY, node.enemyLevel, node.isBossEncounter);
        nodes.splice(index, 1);

        if (!explosivePurgeEnabled) return;
        if (explodedOrigins.has(node)) return;

        // Purge kill → always explode. Explosion kill → only if chain remaining > 0.
        if (chainRemaining !== null && chainRemaining <= 0) return;

        explodedOrigins.add(node);
        const explosionDamage = Math.max(1, Math.round(baseDamage * explosivePurgeDamageRatio));
        const childChain =
          chainRemaining === null ? explosivePurgeChainDepth : chainRemaining - 1;

        pushSplashShockwave(
          effects,
          deathX,
          deathY,
          0,
          explosivePurgeRadiusPx,
          resolvePurgeHitVisualDurationMs(intervalMs) + 120,
        );

        for (let i = nodes.length - 1; i >= 0; i -= 1) {
          const blastTarget = nodes[i];
          const dx = blastTarget.x - deathX;
          const dy = blastTarget.y - deathY;
          if (dx * dx + dy * dy > blastRadiusSq) continue;
          applyDamageAtIndex(i, explosionDamage, childChain);
        }
      };

      // Parcours inverse : splice sûr sans indexOf.
      for (let i = nodes.length - 1; i >= 0; i -= 1) {
        if (isEnemyInPurgeZone(nodes[i], purgeX, purgeY, purgeRadius)) {
          applyDamageAtIndex(i, baseDamage, null);
        }
      }

      const hadMainPurgeHit = hitCount > 0;

      if (splashLevel > 0) {
        const splashRadius = getPurgeSplashRadius(purgeRadius, splashLevel, splashAnchorMultiplier);
        const splashDamage = resolvePurgeSplashDamage(baseDamage, splashLevel, splashAnchorMultiplier);
        for (let i = nodes.length - 1; i >= 0; i -= 1) {
          if (isEnemyInSplashRing(nodes[i], purgeX, purgeY, purgeRadius, splashRadius)) {
            applyDamageAtIndex(i, splashDamage, null);
          }
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

      if (!hasEnemyInZone(nodes, pointer.x, pointer.y, config.purgeRadius)) return;

      if (instantHitReadyRef.current) {
        instantHitReadyRef.current = false;
        attackAccumulatorMsRef.current = 0;
        applyPurgeHits(
          nodes,
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
          config.explosivePurgeEnabled,
          config.explosivePurgeRadiusPx,
          config.explosivePurgeDamageRatio,
          config.explosivePurgeChainDepth,
        );
        return;
      }

      const tickDelta = Math.min(tickDeltaMs, intervalMs);
      attackAccumulatorMsRef.current += tickDelta;

      if (attackAccumulatorMsRef.current < intervalMs) return;

      attackAccumulatorMsRef.current -= intervalMs;
      if (!hasEnemyInZone(nodes, pointer.x, pointer.y, config.purgeRadius)) return;

      applyPurgeHits(
        nodes,
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
        config.explosivePurgeEnabled,
        config.explosivePurgeRadiusPx,
        config.explosivePurgeDamageRatio,
        config.explosivePurgeChainDepth,
      );
    },
    [applyPurgeHits, effectsRef, nodesRef, overclockRef, pickupsRef],
  );

  useTick({ callback: tick, isEnabled: isPlaying });

  return <pixiContainer ref={containerRef} />;
}
