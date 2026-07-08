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
  isBoss?: boolean;
  moveSpeed: number;
}
