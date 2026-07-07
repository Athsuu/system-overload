export interface DissipationNode {
  x: number;
  y: number;
  flowTargetX: number;
  flowTargetY: number;
  hp: number;
  maxHp: number;
  tier: number;
  flashTimer: number;
  satelliteAngle: number;
  hexAngle: number;
  corruptSeed: number;
  isBoss?: boolean;
  moveSpeed: number;
}
