import { useApplication, useTick } from '@pixi/react';
import { useCallback, type MutableRefObject, type RefObject } from 'react';
import { consumeDevForceBossRequest, consumeDevKillAllRequest, consumeDevKillJump } from '../../dev/devFlags';
import { triggerRunEventSfx } from '../../audio/sfxApi';
import { useGameStore } from '../../store/useGameStore';
import { getScreenBounds } from '../constants';
import { spawnEnemyOnEdge } from '../enemyMovement';
import { pushSpawnFlash, type GameEffect } from '../effects';
import type { LootPickup } from '../loot';
import { getRunConfig } from '../runConfig';
import { scaleDeltaMs } from '../runTimeScale';
import type { DissipationNode } from '../types';
import { hordeAliveCountRef } from './aliveCount';
import { BOSS_KILL_THRESHOLD, MIN_HORDE_SPAWN_INTERVAL_MS, SPAWN_STAGGER_EXTRA_MS } from './hordeConfig';
import { runKillsRef } from './killCounter';
import type { HordeRuntime } from './types';

interface HordeEngineProps {
  isPlaying: boolean;
  nodesRef: RefObject<DissipationNode[]>;
  effectsRef: RefObject<GameEffect[]>;
  pickupsRef: RefObject<LootPickup[]>;
  hordeRuntimeRef: MutableRefObject<HordeRuntime>;
}

function spawnOne(
  nodes: DissipationNode[],
  bounds: ReturnType<typeof getScreenBounds>,
  config: ReturnType<typeof getRunConfig>,
  effects: GameEffect[],
  isBossEncounter: boolean,
): void {
  const spawned = spawnEnemyOnEdge(bounds, config, { isBossEncounter });
  pushSpawnFlash(effects, spawned.x, spawned.y, spawned.enemyLevel, spawned.isBossEncounter);
  nodes.push(spawned);
}

function hasLivingBoss(nodes: DissipationNode[]): boolean {
  for (let i = 0; i < nodes.length; i += 1) {
    if (nodes[i].isBossEncounter) return true;
  }
  return false;
}

export function HordeEngine({
  isPlaying,
  nodesRef,
  effectsRef,
  pickupsRef,
  hordeRuntimeRef,
}: HordeEngineProps) {
  const { app } = useApplication();

  const tick = useCallback(
    (ticker: { deltaMS: number }) => {
      if (!isPlaying) return;
      if (!app?.renderer) return;

      const nodes = nodesRef.current;
      if (!nodes) return;

      const store = useGameStore.getState();
      if (store.gameState !== 'PLAYING') return;

      const runtime = hordeRuntimeRef.current;
      const effects = effectsRef.current ?? [];
      hordeAliveCountRef.current = nodes.length;

      if (consumeDevKillAllRequest()) {
        nodes.length = 0;
        hordeAliveCountRef.current = 0;
        if (effectsRef.current) effectsRef.current.length = 0;
        if (pickupsRef.current) pickupsRef.current.length = 0;
        return;
      }

      const killJump = consumeDevKillJump();
      if (killJump !== null) {
        runKillsRef.current = killJump;
        store.setRunKills(killJump);
      }

      if (consumeDevForceBossRequest() && runtime.phase === 'horde') {
        runKillsRef.current = Math.max(runKillsRef.current, BOSS_KILL_THRESHOLD);
        store.setRunKills(runKillsRef.current);
      }

      // Victoire boss — early-out avant getRunConfig (tick idle pendant le duel)
      if (runtime.phase === 'boss' && runtime.bossSpawned && !runtime.victoryTriggered) {
        if (!hasLivingBoss(nodes)) {
          runtime.victoryTriggered = true;
          triggerRunEventSfx('victory');
          store.endRun('victory_boss');
        }
        return;
      }

      const bounds = getScreenBounds(app.screen.width, app.screen.height);
      const config = getRunConfig(store.upgrades);

      // Transition horde → boss
      if (
        runtime.phase === 'horde' &&
        runKillsRef.current >= BOSS_KILL_THRESHOLD &&
        !runtime.bossSpawned
      ) {
        nodes.length = 0;
        if (effectsRef.current) effectsRef.current.length = 0;
        runtime.phase = 'boss';
        runtime.bossSpawned = true;
        runtime.spawnAccumulatorMs = 0;
        store.setRunPhase('boss');
        triggerRunEventSfx('bossIncoming');
        spawnOne(nodes, bounds, config, effects, true);
        return;
      }

      // Spawn horde continu
      if (runtime.phase !== 'horde') return;

      const maxAlive = config.hordeMaxAlive;
      if (nodes.length >= maxAlive) {
        runtime.spawnAccumulatorMs = 0;
        return;
      }

      const spawnIntervalMs = Math.max(
        MIN_HORDE_SPAWN_INTERVAL_MS,
        Math.floor(config.hordeSpawnIntervalMs),
      );
      const spawnDelta = Math.min(scaleDeltaMs(ticker.deltaMS), spawnIntervalMs);
      runtime.spawnAccumulatorMs += spawnDelta;

      // Un seul spawn / frame + micro-stagger : évite le paquet « tous en même temps ».
      if (runtime.spawnAccumulatorMs >= spawnIntervalMs && nodes.length < maxAlive) {
        runtime.spawnAccumulatorMs -= spawnIntervalMs + Math.random() * SPAWN_STAGGER_EXTRA_MS;
        spawnOne(nodes, bounds, config, effects, false);
      }
    },
    [app, effectsRef, hordeRuntimeRef, isPlaying, nodesRef, pickupsRef],
  );

  useTick({ callback: tick, isEnabled: isPlaying });

  return null;
}
