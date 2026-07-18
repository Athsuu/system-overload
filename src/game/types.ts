export interface DissipationNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  flowDistance: number;
  distanceTraveled: number;
  hp: number;
  maxHp: number;
  /** Niveau / cycle de spawn (soft-block). */
  enemyLevel: number;
  isBossEncounter: boolean;
  flashTimer: number;
  satelliteAngle: number;
  hexAngle: number;
  corruptSeed: number;
  moveSpeed: number;
}
