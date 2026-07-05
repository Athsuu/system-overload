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
    cyclesLabel: 'Cycles',
  },
  currency: {
    runShardsLabel: 'Run Shards',
    availableShardsLabel: 'Available Shards',
    shardsEarnedSuffix: 'Shards',
    transferredToVault: 'Transferred to vault',
  },
  moduleBay: {
    title: 'Module Bay',
    subtitle: 'Install Kernel Modules',
    levelUpHint: 'Kernel Level Up',
    cyclesLabel: 'Cycles',
    cycleCostSuffix: 'Cycles',
    installLabel: 'Install',
    maxedLabel: 'Maxed',
    resumeLabel: 'Resume',
    loreSnippet:
      'Each level grants Cycles — spare compute time to hot-swap modules before the next wave hits.',
  },
  pause: {
    title: 'SYSTEM HALT',
    subtitle: 'Kernel execution suspended',
    resumeLabel: 'Resume',
    abortLabel: 'Abort\nRun',
    settingsLabel: 'Settings',
    confirmPrompt: 'Abort this run? Shards will transfer to vault.',
    confirmYes: 'Yes',
    confirmNo: 'No',
    statBreach: 'Breach',
    statWave: 'Wave',
    statShards: 'Run Shards',
  },
  settings: {
    title: 'System Config',
    subtitle: 'Kernel preferences',
    closeLabel: 'Close',
    comingSoon: 'Coming soon',
    masterVolumeLabel: 'Master Volume',
    audioComingSoon: 'Audio system not yet connected',
    sections: {
      audio: 'Audio',
      language: 'Language',
      controls: 'Controls',
    },
  },
  lore: {
    kernel:
      'You are the Kernel — the last stable core holding back a total system collapse. Every run is a desperate execution thread against corrupted processes flooding the breach.',
    shards:
      'Shards are salvaged data fragments stored in your vault. Spend them in the Skill Tree to permanently reinforce the Kernel between runs.',
    cycles:
      'Cycles are units of spare compute time recovered when the Kernel levels up during a run. They exist only for the current execution — when the run ends, unspent Cycles vanish.',
    kernelModules:
      'Kernel Modules are hot-swappable upgrades installed in the Module Bay. Forked Flux, Penetrators, heat sinks — each module reshapes how the Kernel fights this breach, but none survive a Meltdown.',
    moduleBay:
      'The Module Bay opens when you level up mid-run. Spend Cycles to install modules before resuming. Permanent Skills from the vault and temporary Modules from the Bay stack together — but only Shards outlive the run.',
    progression:
      'Kill corrupted processes → gain XP → level up → earn Cycles → install Kernel Modules. Survive long enough, and Shards from the run transfer to your vault for permanent Skill Enhancements.',
  },
} as const;
