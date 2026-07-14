import { useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { triggerSfx } from '../../audio/sfxApi';
import { useGameStore } from '../../store/useGameStore';
import { spawnBadgeFlyParticle, type BadgeFlyParticle } from '../juice/badgeFlyParticles';
import { purgePointerRef } from '../purgeInput';
import { scaleDeltaMs } from '../runTimeScale';
import { applyLootCollection, getLootCollectSfx } from './collect';
import { getLootPickupRadiiForTick } from './pickupRadii';
import { tickLootPickups } from './pickups';
import type { LootPickup } from './types';
import { renderLootPickups } from './visuals';

interface LootPickupEngineProps {
  isPlaying: boolean;
  pickupsRef: RefObject<LootPickup[]>;
  badgeParticlesRef: RefObject<BadgeFlyParticle[]>;
}

export function LootPickupEngine({ isPlaying, pickupsRef, badgeParticlesRef }: LootPickupEngineProps) {
  const graphicsRef = useRef<Graphics | null>(null);
  const containerRef = useRef<Container | null>(null);

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

  useEffect(() => {
    if (!isPlaying) {
      graphicsRef.current?.clear();
    }
  }, [isPlaying]);

  const tick = useCallback(
    (ticker: { deltaMS: number }) => {
      const graphics = graphicsRef.current;
      const pickups = pickupsRef.current;
      if (!graphics || !pickups) return;
      if (useGameStore.getState().gameState !== 'PLAYING') return;

      const deltaMs = scaleDeltaMs(ticker.deltaMS);
      const pointer = purgePointerRef;

      if (isPlaying) {
        const store = useGameStore.getState();
        const radii = getLootPickupRadiiForTick(store.upgrades, store.anchoredNodes);
        const collected = tickLootPickups(
          pickups,
          pointer.x,
          pointer.y,
          pointer.active,
          deltaMs,
          radii,
        );

        const badgeParticles = badgeParticlesRef.current;
        for (const loot of collected) {
          applyLootCollection(loot);
          triggerSfx(getLootCollectSfx(loot.kind));
          if (badgeParticles) {
            spawnBadgeFlyParticle(badgeParticles, loot.x, loot.y);
          }
        }
      }

      renderLootPickups(graphics, pickups);
    },
    [badgeParticlesRef, isPlaying, pickupsRef],
  );

  useTick({ callback: tick, isEnabled: isPlaying });

  return <pixiContainer ref={containerRef} />;
}
