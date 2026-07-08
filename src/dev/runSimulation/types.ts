import type { UpgradeLevels } from '../../store/upgradeCatalog';

export interface SimParams {
  upgrades: UpgradeLevels;
  /** Dev speed multiplier (1 or 2). Scales gameplay delta like runTimeScale. */
  timeScale: number;
  arenaWidth: number;
  arenaHeight: number;
  /** 0–1 : part des ticks purge qui touchent les ennemis (proxy skill joueur). */
  purgeCoverage: number;
  /** Distance moyenne spawn → sortie (px). */
  avgFlowDistancePx: number;
  /** Stress supplémentaire aux leaks en vitesse ×2 (réaction joueur). */
  speedLeakStress: number;
  /** Étire ou compresse la durée estimée de chaque vague (calibré playtest). */
  waveDurationMult: number;
  /** Poids des leaks sur la breach (faible si mort surtout passive). */
  leakFactor: number;
}

export interface SimWaveSnapshot {
  waveIndex: number;
  startTimeSec: number;
  endTimeSec: number;
  kills: number;
  leaks: number;
  breachStart: number;
  breachEnd: number;
}

export interface SimOutcome {
  result: 'meltdown' | 'victory' | 'timeout';
  waveIndex: number;
  /** 0 = début de vague, 1 = vague terminée. */
  waveProgress: number;
  gameTimeSec: number;
  breach: number;
  totalKills: number;
  totalLeaks: number;
  breachFromPassive: number;
  breachFromLeaks: number;
  breachReliefFromKills: number;
  waves: SimWaveSnapshot[];
}

export interface PlaytestMeltdownAnchor {
  id: string;
  label: string;
  upgrades: UpgradeLevels;
  timeScale: number;
  waveIndex: number;
  waveProgress: number;
  notes?: string;
}

export interface CalibrationResult {
  purgeCoverage: number;
  waveDurationMult: number;
  leakFactor: number;
  speedLeakStress: number;
  errorScore: number;
  outcomes: { anchorId: string; outcome: SimOutcome; error: number }[];
}
