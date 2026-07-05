import { useApplication, useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type MutableRefObject,
  type RefObject,
} from 'react';
import { getXpRewardForTier } from '../store/kernelModuleCatalog';
import { useGameStore } from '../store/useGameStore';
import { resolveAutoFireTarget } from './aimUtils';
import { type OverclockState } from './activeSkill';
import { getBoltRotation, computeBoltEdgeFade, renderFluxBolts } from './boltVisual';
import { isParticleHittingEnemy } from './enemyHitbox';
import { pushBoltHit, pushDeathEffect, pushMissRipple, pushMuzzleFlash, type GameEffect } from './effects';
import { applyMissedShotOverload } from './overload';
import {
  CORE_RADIUS,
  FLASH_DURATION_MS,
  getScreenBounds,
  isParticleOutOfBounds,
  PARTICLE_RADIUS,
  PARTICLE_SPEED,
  type Vec2,
} from './constants';
import type { PlayerState } from './playerMovement';
import { getOverclockFireRateMult } from './RunTimerEngine';
import { getRunConfig, getSpawnInterval, getShardReward } from './runConfig';
import type { DissipationNode, Particle } from './types';

interface ParticleEngineProps {
  isPlaying: boolean;
  isRunActive: boolean;
  playerRef: MutableRefObject<PlayerState>;
  nodesRef: RefObject<DissipationNode[]>;
  effectsRef: RefObject<GameEffect[]>;
  elapsedTimeRef: MutableRefObject<number>;
  overclockRef: MutableRefObject<OverclockState>;
}

function getModuleHomingStrength(runModuleLevels: { homingBoost?: number }): number {
  return (runModuleLevels.homingBoost ?? 0) * 1.5;
}

function createParticle(
  originX: number,
  originY: number,
  aimTarget: Vec2,
  damage: number,
  pierceRemaining: number,
  homingStrength: number,
  multishotIndex: number,
  multishotTotal: number,
  overclockTint: boolean,
  angleOffset = 0,
): Particle {
  const dx = aimTarget.x - originX;
  const dy = aimTarget.y - originY;
  const baseAngle = Math.atan2(dy, dx) + angleOffset;
  const vx = Math.cos(baseAngle) * PARTICLE_SPEED;
  const vy = Math.sin(baseAngle) * PARTICLE_SPEED;

  return {
    x: originX,
    y: originY,
    vx,
    vy,
    damage,
    pierceRemaining,
    hitTargets: new WeakSet(),
    lockTargetX: aimTarget.x,
    lockTargetY: aimTarget.y,
    homingStrength,
    trailX1: originX,
    trailY1: originY,
    trailX2: originX,
    trailY2: originY,
    hitsLanded: 0,
    multishotIndex,
    multishotTotal,
    overclockTint,
    fadeAlpha: 1,
  };
}

function applyHomingToLockedTarget(
  particle: Particle,
  strength: number,
  deltaSeconds: number,
): void {
  if (strength <= 0) return;

  const dx = particle.lockTargetX - particle.x;
  const dy = particle.lockTargetY - particle.y;
  const distance = Math.hypot(dx, dy) || 1;
  const desiredVx = (dx / distance) * PARTICLE_SPEED;
  const desiredVy = (dy / distance) * PARTICLE_SPEED;
  const blend = Math.min(1, strength * deltaSeconds);

  particle.vx += (desiredVx - particle.vx) * blend;
  particle.vy += (desiredVy - particle.vy) * blend;
}

function advanceParticleTrail(particle: Particle): void {
  particle.trailX2 = particle.trailX1;
  particle.trailY2 = particle.trailY1;
  particle.trailX1 = particle.x;
  particle.trailY1 = particle.y;
}

function handleEnemyKill(node: DissipationNode): void {
  const store = useGameStore.getState();
  const config = getRunConfig(store.upgrades, store.runModuleLevels);
  store.addRunShards(getShardReward(config, node.tier));
  store.addRunXp(Math.floor(getXpRewardForTier(node.tier) * config.xpMultiplier));
}

export function ParticleEngine({
  isPlaying,
  isRunActive,
  playerRef,
  nodesRef,
  effectsRef,
  elapsedTimeRef,
  overclockRef,
}: ParticleEngineProps) {
  const { app } = useApplication();
  const particlesRef = useRef<Particle[]>([]);
  const spawnAccumulatorRef = useRef(0);
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
    if (isRunActive) return;

    particlesRef.current = [];
    spawnAccumulatorRef.current = 0;
    elapsedTimeRef.current = 0;
    graphicsRef.current?.clear();
  }, [elapsedTimeRef, isRunActive]);

  const tick = useCallback(
    (ticker: { deltaMS: number }) => {
      const graphics = graphicsRef.current;
      const currentNodes = nodesRef.current;
      if (!graphics || !currentNodes) return;

      const store = useGameStore.getState();
      if (store.gameState !== 'PLAYING') return;

      const config = getRunConfig(store.upgrades, store.runModuleLevels);
      const player = playerRef.current;
      const bounds = getScreenBounds(app.screen.width, app.screen.height);
      const deltaSeconds = ticker.deltaMS / 1000;
      const homingStrength = getModuleHomingStrength(store.runModuleLevels);
      const effects = effectsRef.current ?? [];

      elapsedTimeRef.current += deltaSeconds;
      const fireRateMult = getOverclockFireRateMult(overclockRef);
      const spawnInterval = getSpawnInterval(elapsedTimeRef.current, config) * fireRateMult;
      const overclockActive = overclockRef.current.active;

      spawnAccumulatorRef.current += ticker.deltaMS;
      while (spawnAccumulatorRef.current >= spawnInterval) {
        spawnAccumulatorRef.current -= spawnInterval;
        const aimTarget = resolveAutoFireTarget(
          player,
          currentNodes,
          config.acquisitionRange,
        );
        const pierceRemaining = config.pierceCount;
        const spreadAngles =
          config.multishotCount <= 1
            ? [0]
            : Array.from(
                { length: config.multishotCount },
                (_, index) => (index - (config.multishotCount - 1) / 2) * 0.12,
              );

        for (let shotIndex = 0; shotIndex < spreadAngles.length; shotIndex += 1) {
          const angleOffset = spreadAngles[shotIndex];
          const particle = createParticle(
            player.x,
            player.y,
            aimTarget,
            config.particleDamage,
            pierceRemaining,
            homingStrength,
            shotIndex,
            spreadAngles.length,
            overclockActive,
            angleOffset,
          );

          if (overclockActive) {
            const travelAngle = Math.atan2(particle.vy, particle.vx);
            const rotation = getBoltRotation(particle.vx, particle.vy);
            const muzzleX = player.x + Math.cos(travelAngle) * (CORE_RADIUS * 0.55);
            const muzzleY = player.y + Math.sin(travelAngle) * (CORE_RADIUS * 0.55);
            pushMuzzleFlash(effects, muzzleX, muzzleY, rotation);
          }

          particlesRef.current.push(particle);
        }
      }

      const particles = particlesRef.current;

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        applyHomingToLockedTarget(particle, particle.homingStrength, deltaSeconds);
        advanceParticleTrail(particle);
        particle.x += particle.vx * deltaSeconds;
        particle.y += particle.vy * deltaSeconds;
        particle.fadeAlpha = computeBoltEdgeFade(particle.x, particle.y, bounds);

        if (particle.fadeAlpha <= 0.02) {
          particles.splice(index, 1);
          applyMissedShotOverload(config);
          pushMissRipple(effects, particle.x, particle.y);
          continue;
        }

        if (isParticleOutOfBounds(particle.x, particle.y, bounds, PARTICLE_RADIUS)) {
          particles.splice(index, 1);
          applyMissedShotOverload(config);
          pushMissRipple(effects, particle.x, particle.y);
          continue;
        }

        let hitNodeIndex = -1;
        for (let nodeIndex = 0; nodeIndex < currentNodes.length; nodeIndex += 1) {
          const node = currentNodes[nodeIndex];
          if (particle.hitTargets.has(node)) continue;
          if (
            isParticleHittingEnemy(
              particle.x,
              particle.y,
              PARTICLE_RADIUS,
              node,
              config.hitRadiusBonus,
            )
          ) {
            hitNodeIndex = nodeIndex;
            break;
          }
        }

        if (hitNodeIndex < 0) continue;

        const node = currentNodes[hitNodeIndex];
        particle.hitTargets.add(node);
        particle.hitsLanded += 1;
        node.hp -= particle.damage;
        node.flashTimer = FLASH_DURATION_MS;
        pushBoltHit(effects, particle.x, particle.y, getBoltRotation(particle.vx, particle.vy));

        if (node.hp <= 0) {
          handleEnemyKill(node);
          pushDeathEffect(effects, node.x, node.y, node.tier, node.isBoss ?? false);
          currentNodes.splice(hitNodeIndex, 1);
        }

        particle.pierceRemaining -= 1;
        if (particle.pierceRemaining <= 0) {
          particles.splice(index, 1);
        }
      }

      renderFluxBolts(graphics, particles);
    },
    [app.screen.height, app.screen.width, effectsRef, elapsedTimeRef, nodesRef, overclockRef, playerRef],
  );

  useTick({ callback: tick, isEnabled: isPlaying });

  return <pixiContainer ref={containerRef} />;
}
