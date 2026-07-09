import type { EnemyClass } from './enemyClass';

export interface DissipationNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  flowDistance: number;
  distanceTraveled: number;
  hp: number;
  maxHp: number;
  waveIndex: number;
  flashTimer: number;
  satelliteAngle: number;
  hexAngle: number;
  corruptSeed: number;
  enemyClass: EnemyClass;
  moveSpeed: number;
}
