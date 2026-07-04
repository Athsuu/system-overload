/** Player-facing narrative copy (English UI). */
export const GAME_NARRATIVE = {
  title: 'System Overload',
  tagline: 'The system collapses under a wave of corrupted processes.',
  role: 'You are the Kernel — the last stable core.',
  objective:
    'Every impact, every missed shot, every second drives overload higher. Keep the Breach under control until you contain the threat — or suffer a Meltdown.',
  runEnd: {
    victoryTitle: 'Breach Contained',
    victorySubtitle: 'Threat contained — the Kernel holds.',
    meltdownTitle: 'Meltdown',
    meltdownSubtitle: 'Kernel overloaded — the last stable core has failed.',
  },
  hub: {
    upgradesTitle: 'Skill Enhancements',
    upgradesSubtitle: 'Reinforce the Kernel before the next breach.',
  },
  hud: {
    overloadLabel: 'Overload',
    overloadStable: 'Stable',
    overloadUrgent: 'Meltdown imminent',
    overloadHint: 'Impact · missed shots · time',
  },
  currency: {
    runShardsLabel: 'Run Shards',
    availableShardsLabel: 'Available Shards',
    shardsEarnedSuffix: 'Shards',
    transferredToVault: 'Transferred to vault',
  },
  pause: {
    title: 'SYSTEM HALT',
    subtitle: 'Kernel execution suspended',
    resumeLabel: 'Resume',
    abortLabel: 'Abort\nRun',
    confirmPrompt: 'Abort this run? Shards will transfer to vault.',
    confirmYes: 'Yes',
    confirmNo: 'No',
    statBreach: 'Breach',
    statWave: 'Wave',
    statShards: 'Run Shards',
  },
} as const;
