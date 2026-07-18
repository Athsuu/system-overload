export type HordePhase = 'horde' | 'boss';

export interface HordeRuntime {
  phase: HordePhase;
  spawnAccumulatorMs: number;
  /** Boss déjà spawné cette run (évite double spawn). */
  bossSpawned: boolean;
  /** Victoire déjà déclenchée. */
  victoryTriggered: boolean;
}
