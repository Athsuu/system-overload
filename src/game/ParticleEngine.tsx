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
import { getXpRewardForTier } from '../store/runDraftCatalog';
import { useGameStore } from '../store/useGameStore';
import { resolveAutoFireTarget } from './aimUtils';
import { type OverclockState } from './activeSkill';
import { isParticleHittingEnemy } from './enemyHitbox';
import { pushDeathEffect, pushHitSpark, pushMissRipple, type GameEffect } from './effects';
import { applyMissedShotOverload } from './overload';
import {
  getScreenBounds,
  isParticleOutOfBounds,
  PARTICLE_COLOR,
  PARTICLE_GLOW,
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

function getDraftHomingStrength(runDraftLevels: { homingBoost?: number }): number {
  return (runDraftLevels.homingBoost ?? 0) * 1.5;
}

function createParticle(
  originX: number,
  originY: number,
  aimTarget: Vec2,
  damage: number,
  pierceRemaining: number,
  homingStrength: number,
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

function renderParticles(graphics: Graphics, particles: Particle[]) {
  graphics.clear();

  for (const particle of particles) {
    graphics.circle(particle.x, particle.y, PARTICLE_RADIUS + 3);
    graphics.fill({ color: PARTICLE_GLOW, alpha: 0.25 });
    graphics.circle(particle.x, particle.y, PARTICLE_RADIUS);
    graphics.fill({ color: PARTICLE_COLOR });
  }
}

function handleEnemyKill(node: DissipationNode): void {
  const store = useGameStore.getState();
  const config = getRunConfig(store.upgrades, store.runDraftLevels);
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

      const config = getRunConfig(store.upgrades, store.runDraftLevels);
      const player = playerRef.current;
      const bounds = getScreenBounds(app.screen.width, app.screen.height);
      const deltaSeconds = ticker.deltaMS / 1000;
      const homingStrength = getDraftHomingStrength(store.runDraftLevels);

      elapsedTimeRef.current += deltaSeconds;
      const fireRateMult = getOverclockFireRateMult(overclockRef);
      const spawnInterval = getSpawnInterval(elapsedTimeRef.current, config) * fireRateMult;

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

        for (const angleOffset of spreadAngles) {
          particlesRef.current.push(
            createParticle(
              player.x,
              player.y,
              aimTarget,
              config.particleDamage,
              pierceRemaining,
              homingStrength,
              angleOffset,
            ),
          );
        }
      }

      const particles = particlesRef.current;

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        applyHomingToLockedTarget(particle, particle.homingStrength, deltaSeconds);
        particle.x += particle.vx * deltaSeconds;
        particle.y += particle.vy * deltaSeconds;

        if (isParticleOutOfBounds(particle.x, particle.y, bounds, PARTICLE_RADIUS)) {
          particles.splice(index, 1);
          applyMissedShotOverload(config);
          pushMissRipple(effectsRef.current ?? [], particle.x, particle.y);
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
        node.hp -= particle.damage;
        node.flashTimer = 200;
        pushHitSpark(effectsRef.current ?? [], particle.x, particle.y);

        if (node.hp <= 0) {
          handleEnemyKill(node);
          pushDeathEffect(
            effectsRef.current ?? [],
            node.x,
            node.y,
            node.tier,
            node.isBoss ?? false,
          );
          currentNodes.splice(hitNodeIndex, 1);
        }

        particle.pierceRemaining -= 1;
        if (particle.pierceRemaining <= 0) {
          particles.splice(index, 1);
        }
      }

      renderParticles(graphics, particles);
    },
    [app.screen.height, app.screen.width, effectsRef, elapsedTimeRef, nodesRef, overclockRef, playerRef],
  );

  useTick({ callback: tick, isEnabled: isPlaying });

  return <pixiContainer ref={containerRef} />;
}
