export interface WaveSpawnGroup {
  count: number;
  intervalMs: number;
  maxAlive: number;
}

export interface WaveDefinition {
  wave: number;
  spawns: WaveSpawnGroup[];
  interWaveMs: number;
  isBoss?: boolean;
  bossId?: string;
}

export const WAVE_DEFINITIONS: WaveDefinition[] = [
  { wave: 1, spawns: [{ count: 6, intervalMs: 1400, maxAlive: 3 }], interWaveMs: 900 },
  { wave: 2, spawns: [{ count: 7, intervalMs: 1320, maxAlive: 3 }], interWaveMs: 900 },
  { wave: 3, spawns: [{ count: 8, intervalMs: 1240, maxAlive: 4 }], interWaveMs: 900 },
  { wave: 4, spawns: [{ count: 9, intervalMs: 1160, maxAlive: 4 }], interWaveMs: 900 },
  { wave: 5, spawns: [{ count: 10, intervalMs: 1080, maxAlive: 5 }], interWaveMs: 900 },
  { wave: 6, spawns: [{ count: 11, intervalMs: 1000, maxAlive: 5 }], interWaveMs: 1000 },
  { wave: 7, spawns: [{ count: 12, intervalMs: 940, maxAlive: 6 }], interWaveMs: 1000 },
  { wave: 8, spawns: [{ count: 13, intervalMs: 880, maxAlive: 6 }], interWaveMs: 1000 },
  { wave: 9, spawns: [{ count: 14, intervalMs: 820, maxAlive: 7 }], interWaveMs: 1000 },
  { wave: 10, spawns: [{ count: 15, intervalMs: 760, maxAlive: 8 }], interWaveMs: 1200 },
  {
    wave: 11,
    isBoss: true,
    bossId: 'core_breach',
    spawns: [{ count: 1, intervalMs: 0, maxAlive: 1 }],
    interWaveMs: 0,
  },
];

export const REGULAR_WAVE_COUNT = WAVE_DEFINITIONS.filter((wave) => !wave.isBoss).length;

export function getWaveDefinition(waveIndex: number): WaveDefinition | undefined {
  return WAVE_DEFINITIONS.find((wave) => wave.wave === waveIndex);
}

export function getWaveSpawnCount(
  waveIndex: number,
  groupCount: number,
  starterNodes = 0,
): number {
  return waveIndex === 1 ? groupCount + starterNodes : groupCount;
}
