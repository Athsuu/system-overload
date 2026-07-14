import type { EnemyClass } from '../enemyClass';

export interface DamageAppliedEvent {
  x: number;
  y: number;
  waveIndex: number;
  enemyClass: EnemyClass;
  damage: number;
  isCritical: boolean;
}

type DamageAppliedListener = (event: DamageAppliedEvent) => void;

let listener: DamageAppliedListener | null = null;

/** Un seul listener actif à la fois — cohérent avec les refs mutables singleton du moteur (purgePointerRef, etc.). */
export function setOnDamageApplied(fn: DamageAppliedListener | null): void {
  listener = fn;
}

export function emitDamageApplied(event: DamageAppliedEvent): void {
  listener?.(event);
}
