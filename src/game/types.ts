export interface DissipationNode {
  x: number;
  y: number;
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

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  pierceRemaining: number;
  hitTargets: WeakSet<DissipationNode>;
  lockTargetX: number;
  lockTargetY: number;
  homingStrength: number;
  trailX1: number;
  trailY1: number;
  trailX2: number;
  trailY2: number;
  hitsLanded: number;
  multishotIndex: number;
  multishotTotal: number;
  overclockTint: boolean;
  fadeAlpha: number;
}
