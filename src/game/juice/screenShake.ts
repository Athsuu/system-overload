/**
 * Screen shake global — secousse sèche et orthogonale (pas de rotation) du conteneur racine
 * de l'arène. Atténuation rapide vers zéro (~150-200 ms) pour un impact matériel, pas organique.
 */

export type ScreenShakeTrigger = 'critical' | 'eliteDeath' | 'bossDeath' | 'overloadUrgent';

interface ScreenShakePreset {
  amplitudePx: number;
  durationMs: number;
}

const SCREEN_SHAKE_PRESETS: Record<ScreenShakeTrigger, ScreenShakePreset> = {
  critical: { amplitudePx: 5, durationMs: 150 },
  eliteDeath: { amplitudePx: 7, durationMs: 180 },
  bossDeath: { amplitudePx: 13, durationMs: 200 },
  overloadUrgent: { amplitudePx: 6, durationMs: 180 },
};

export interface ScreenShakeState {
  remainingMs: number;
  durationMs: number;
  amplitudePx: number;
}

export function createScreenShake(): ScreenShakeState {
  return { remainingMs: 0, durationMs: 1, amplitudePx: 0 };
}

/** Une secousse plus forte prend le dessus sur une secousse plus faible déjà en cours ; jamais l'inverse. */
export function triggerScreenShake(state: ScreenShakeState, trigger: ScreenShakeTrigger): void {
  const preset = SCREEN_SHAKE_PRESETS[trigger];
  if (state.remainingMs > 0 && preset.amplitudePx <= state.amplitudePx) return;

  state.durationMs = preset.durationMs;
  state.remainingMs = preset.durationMs;
  state.amplitudePx = preset.amplitudePx;
}

export function tickScreenShake(state: ScreenShakeState, deltaMs: number): void {
  state.remainingMs = Math.max(0, state.remainingMs - deltaMs);
}

/** Jitter x/y indépendant (orthogonal, pas de rotation), décroissance quadratique rapide. */
export function getScreenShakeOffset(state: ScreenShakeState): { x: number; y: number } {
  if (state.remainingMs <= 0 || state.durationMs <= 0) return { x: 0, y: 0 };

  const progress = state.remainingMs / state.durationMs;
  const falloff = progress * progress;

  return {
    x: (Math.random() * 2 - 1) * state.amplitudePx * falloff,
    y: (Math.random() * 2 - 1) * state.amplitudePx * falloff,
  };
}
