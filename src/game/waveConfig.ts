export interface WaveSpawnGroup {
  count: number;
  tier: number;
  intervalMs: number;
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
    spawns: [{ count: 4, tier: 0, intervalMs: 800 }],
    interWaveMs: 2500,
  },
  {
    wave: 2,
    spawns: [{ count: 5, tier: 0, intervalMs: 700 }],
    interWaveMs: 2500,
  },
  {
    wave: 3,
    spawns: [{ count: 4, tier: 1, intervalMs: 650 }],
    interWaveMs: 2500,
  },
  {
    wave: 4,
    spawns: [{ count: 6, tier: 1, intervalMs: 600 }],
    interWaveMs: 2500,
  },
  {
    wave: 5,
    spawns: [{ count: 5, tier: 2, intervalMs: 550 }],
    interWaveMs: 3000,
  },
  {
    wave: 6,
    isBoss: true,
    bossId: 'core_breach',
    bossHpMult: 8,
    bossSpeedMult: 0.6,
    spawns: [{ count: 1, tier: 2, intervalMs: 0 }],
    interWaveMs: 0,
  },
];

export const REGULAR_WAVE_COUNT = WAVE_DEFINITIONS.filter((wave) => !wave.isBoss).length;

export function getWaveDefinition(waveIndex: number): WaveDefinition | undefined {
  return WAVE_DEFINITIONS.find((wave) => wave.wave === waveIndex);
}
