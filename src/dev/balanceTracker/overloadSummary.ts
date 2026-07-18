import type { OverloadDominantSource } from './types';

export function resolveOverloadDominantSource(
  passive: number,
  hit: number,
): OverloadDominantSource {
  if (passive > hit) return 'passive';
  if (hit > passive) return 'hit';
  return 'tie';
}

export function formatOverloadDominantLabel(dominant: OverloadDominantSource): string {
  if (dominant === 'passive') return 'passive';
  if (dominant === 'hit') return 'hit';
  return 'égal';
}

export function formatOverloadPercent(passive: number, hit: number): { passive: string; hit: string } {
  const total = passive + hit;
  if (total <= 0) {
    return { passive: '0%', hit: '0%' };
  }
  const passivePct = Math.round((passive / total) * 1000) / 10;
  const hitPct = Math.round((hit / total) * 1000) / 10;
  return {
    passive: `${passivePct}%`,
    hit: `${hitPct}%`,
  };
}
