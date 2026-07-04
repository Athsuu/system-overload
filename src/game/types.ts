export type EnemyShape = 'hex';

export interface DissipationNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  tier: number;
  shape: EnemyShape;
  flashTimer: number;
  isBoss?: boolean;
  bossId?: string;
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
}
