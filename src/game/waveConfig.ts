export interface WaveSpawnGroup {
  count: number;
  tier: number;
  intervalMs: number;
  maxAlive: number;
}

export interface WaveDefinition {
  wave: number;
  spawns: WaveSpawnGroup[];
  interWaveMs: number;
  isBoss?: boolean;
  bossId?: string;
  bossHpMult?: number;
  bossSpeedMult?: number;
}

export const WAVE_DEFINITIONS: WaveDefinition[] = [
  {
    wave: 1,
    spawns: [{ count: 7, tier: 0, intervalMs: 1400, maxAlive: 3 }],
    interWaveMs: 900,
  },
  {
    wave: 2,
    spawns: [{ count: 9, tier: 0, intervalMs: 1200, maxAlive: 5 }],
    interWaveMs: 900,
  },
  {
    wave: 3,
    spawns: [{ count: 11, tier: 1, intervalMs: 1100, maxAlive: 5 }],
    interWaveMs: 900,
  },
  {
    wave: 4,
    spawns: [{ count: 12, tier: 1, intervalMs: 1000, maxAlive: 6 }],
    interWaveMs: 900,
  },
  {
    wave: 5,
    spawns: [{ count: 14, tier: 2, intervalMs: 950, maxAlive: 6 }],
    interWaveMs: 1000,
  },
  {
    wave: 6,
    isBoss: true,
    bossId: 'core_breach',
    bossHpMult: 6,
    bossSpeedMult: 0.65,
    spawns: [{ count: 1, tier: 2, intervalMs: 0, maxAlive: 1 }],
    interWaveMs: 0,
  },
];

export const REGULAR_WAVE_COUNT = WAVE_DEFINITIONS.filter((wave) => !wave.isBoss).length;

export function getWaveDefinition(waveIndex: number): WaveDefinition | undefined {
  return WAVE_DEFINITIONS.find((wave) => wave.wave === waveIndex);
}
