import type { RunConfig } from '../game/moduleEffects';

/**
 * Overrides dev pour le Labo Stats — écrasent la valeur calculée d'un champ RunConfig,
 * peu importe les modules/upgrades du joueur, jusqu'à effacement explicite.
 */
let overrides: Partial<Record<keyof RunConfig, number>> = {};

export function devSetRunConfigOverride(key: keyof RunConfig, value: number): void {
  overrides = { ...overrides, [key]: value };
}

export function devClearRunConfigOverride(key: keyof RunConfig): void {
  if (!(key in overrides)) return;
  const next = { ...overrides };
  delete next[key];
  overrides = next;
}

export function devClearAllRunConfigOverrides(): void {
  overrides = {};
}

export function getDevRunConfigOverrides(): Partial<Record<keyof RunConfig, number>> {
  return overrides;
}

export function isDevRunConfigOverridden(key: keyof RunConfig): boolean {
  return key in overrides;
}

/** Appliqué en dernier dans getRunConfig() — les valeurs forcées gagnent toujours. */
export function applyDevRunConfigOverrides(config: RunConfig): RunConfig {
  if (Object.keys(overrides).length === 0) return config;
  return { ...config, ...overrides };
}

export interface DevStatFieldMeta {
  key: keyof RunConfig;
  label: string;
}

/** Labo Stats — TOUTES les stats de RunConfig, labellisées pour l'affichage. */
export const DEV_STAT_FIELDS: DevStatFieldMeta[] = [
  { key: 'purgeHitDamage', label: 'Dégâts de base (purge)' },
  { key: 'purgeIntervalMs', label: 'Cadence de purge (ms)' },
  { key: 'purgeRadius', label: 'Rayon de purge' },
  { key: 'criticalChance', label: 'Chance de critique (0-1)' },
  { key: 'criticalMultiplier', label: 'Multiplicateur critique' },
  { key: 'passiveHeatPerSec', label: 'Chaleur passive / s' },
  { key: 'leakProgressPenalty', label: 'Pénalité fuite (Breach)' },
  { key: 'baseEnemyHp', label: 'PV ennemi de base' },
  { key: 'baseEnemySpeed', label: 'Vitesse ennemi de base' },
  { key: 'maxEnemySpeed', label: 'Vitesse ennemi max' },
  { key: 'shardsMultiplier', label: 'Multiplicateur Éclats hex' },
  { key: 'killBonusShards', label: 'Éclats bonus / kill' },
  { key: 'spawnIntervalMult', label: 'Multiplicateur intervalle de spawn' },
  { key: 'maxAliveReduction', label: 'Réduction ennemis max vivants' },
  { key: 'starterNodes', label: 'Nœuds de départ' },
];
