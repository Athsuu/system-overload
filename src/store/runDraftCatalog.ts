export type RunDraftId =
  | 'damageBoost'
  | 'fireRateBoost'
  | 'heatShieldRun'
  | 'multishot'
  | 'pierce'
  | 'xpMagnet'
  | 'overclockDuration'
  | 'overclockCooldown'
  | 'heatReduction'
  | 'hitRadius'
  | 'shardsBoost'
  | 'homingBoost';

export type RunDraftLevels = Partial<Record<RunDraftId, number>>;

export interface RunDraftOption {
  id: RunDraftId;
  name: string;
  description: string;
}

export interface RunDraftDefinition extends RunDraftOption {
  maxLevel: number;
}

export const RUN_DRAFT_CATALOG: RunDraftDefinition[] = [
  {
    id: 'damageBoost',
    name: 'Overdrive',
    description: '+20% bolt damage',
    maxLevel: 5,
  },
  {
    id: 'fireRateBoost',
    name: 'Rapid Pulse',
    description: '+15% fire rate',
    maxLevel: 5,
  },
  {
    id: 'heatShieldRun',
    name: 'Heat Sink',
    description: '-10% leak heat per level',
    maxLevel: 3,
  },
  {
    id: 'multishot',
    name: 'Forked Flux',
    description: '+1 bolt per volley',
    maxLevel: 2,
  },
  {
    id: 'pierce',
    name: 'Penetrator',
    description: 'Bolts pierce +1 target',
    maxLevel: 2,
  },
  {
    id: 'xpMagnet',
    name: 'Data Harvest',
    description: '+25% XP from kills',
    maxLevel: 3,
  },
  {
    id: 'overclockDuration',
    name: 'Extended Overclock',
    description: '+1s overclock duration',
    maxLevel: 3,
  },
  {
    id: 'overclockCooldown',
    name: 'Fast Cycle',
    description: '-2s overclock cooldown',
    maxLevel: 3,
  },
  {
    id: 'heatReduction',
    name: 'Passive Coolant',
    description: '-12% passive heat gain',
    maxLevel: 3,
  },
  {
    id: 'hitRadius',
    name: 'Wide Intercept',
    description: '+4px hit radius',
    maxLevel: 3,
  },
  {
    id: 'shardsBoost',
    name: 'Yield Amplifier',
    description: '+30% Shards from kills',
    maxLevel: 3,
  },
  {
    id: 'homingBoost',
    name: 'Seeker Lock',
    description: '+40% homing strength',
    maxLevel: 3,
  },
];

export const DEFAULT_RUN_DRAFT_LEVELS: RunDraftLevels = {};

export function getRunDraftDefinition(id: RunDraftId): RunDraftDefinition {
  const definition = RUN_DRAFT_CATALOG.find((entry) => entry.id === id);
  if (!definition) throw new Error(`Unknown run draft: ${id}`);
  return definition;
}

export function rollDraftOptions(
  currentLevels: RunDraftLevels,
  count = 3,
): RunDraftOption[] {
  const available = RUN_DRAFT_CATALOG.filter((draft) => {
    const level = currentLevels[draft.id] ?? 0;
    return level < draft.maxLevel;
  });

  if (available.length === 0) {
    return RUN_DRAFT_CATALOG.slice(0, count).map(({ id, name, description }) => ({
      id,
      name,
      description,
    }));
  }

  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map(({ id, name, description }) => ({
    id,
    name,
    description,
  }));
}

export function getXpToNextLevel(runLevel: number): number {
  return 15 + runLevel * 8;
}

export function getXpRewardForTier(tier: number): number {
  return [8, 14, 22][Math.min(tier, 2)] ?? 8;
}
