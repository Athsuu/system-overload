export {
  BOSS_KILL_THRESHOLD,
  HORDE_KILL_MIDPOINT,
  BASE_HORDE_MAX_ALIVE,
  BASE_HORDE_SPAWN_INTERVAL_MS,
  MIN_HORDE_SPAWN_INTERVAL_MS,
  SPAWN_OUTSET_HEX_MULT,
} from './hordeConfig';
export { createHordeRuntime, resetHordeRuntime } from './hordeRuntime';
export { registerEnemyKill, resetRunKills, runKillsRef } from './killCounter';
export { hordeAliveCountRef, resetHordeAliveCount } from './aliveCount';
export { HordeEngine } from './HordeEngine';
export type { HordePhase, HordeRuntime } from './types';
