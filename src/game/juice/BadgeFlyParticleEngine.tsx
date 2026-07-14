import { useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useCallback, useLayoutEffect, useRef, type RefObject } from 'react';
import { DARK_HEX_PIXI } from '../../theme/darkHexTerminal';
import { scaleDeltaMs } from '../runTimeScale';
import { tickBadgeFlyParticles, type BadgeFlyParticle } from './badgeFlyParticles';

interface BadgeFlyParticleEngineProps {
  isPlaying: boolean;
  particlesRef: RefObject<BadgeFlyParticle[]>;
}

function renderBadgeFlyParticles(graphics: Graphics, particles: BadgeFlyParticle[]): void {
  graphics.clear();

  for (const particle of particles) {
    if (!particle.active) continue;

    const progress = particle.elapsedMs / particle.durationMs;
    const alpha = 0.9 * (1 - progress * 0.35);

    graphics.circle(particle.x, particle.y, particle.size);
    graphics.fill({ color: DARK_HEX_PIXI.fluxGlow, alpha });
  }
}

export function BadgeFlyParticleEngine({ isPlaying, particlesRef }: BadgeFlyParticleEngineProps) {
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

  const tick = useCallback(
    (ticker: { deltaMS: number }) => {
      const graphics = graphicsRef.current;
      const particles = particlesRef.current;
      if (!graphics || !particles) return;

      if (isPlaying) {
        tickBadgeFlyParticles(particles, scaleDeltaMs(ticker.deltaMS));
      }

      renderBadgeFlyParticles(graphics, particles);
    },
    [isPlaying, particlesRef],
  );

  useTick(tick);

  return <pixiContainer ref={containerRef} />;
}
