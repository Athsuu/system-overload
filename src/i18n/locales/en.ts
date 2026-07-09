import type { GameStrings } from '../types';

const ARCH = {
  name: 'ARCH',
  fullName: 'Archive Recovery & Containment Heuristic',
  channelLabel: 'ARCH // ADVISORY CHANNEL',
  runRelayLabel: 'ARCH // RELAY',
  signalBufferLabel: 'SIGNAL // RETRYING BUFFER...',
  intro:
    "I'm ARCH, Archive Recovery & Containment Heuristic. Listen. We don't have much time.",
  role:
    'Recovery heuristic, trapped inside the same collapse as you. I can guide. I cannot execute.',
  improvises:
    'I have no clean blueprint and I am routing untested protocols. We improvise, or we lose the Seed.',
};

const LORE = {
  pitch: {
    short: 'The Zero Archive collapses under a wave of corrupted processes.',
    hook: 'Corrupted processes flood the Zero Archive. The Breach is rising.',
  },
  world: {
    quarantine:
      'I compiled you as a child process, operating within a quarantined thread, the last bubble still stable inside a dying archive.',
    seed: 'The Seed is the original pure source code of the Zero Archive. I am trying to save it. Buy us as much time as possible.',
  },
  node0: {
    identity:
      'You are Node-0. Your active thread is all that stands between the corruption and the Seed.',
    threat:
      'Corrupted processes hammer the quarantine wall. Every purge hit and every passing second feeds the Breach closer to Meltdown.',
  },
  combat: {
    purge:
      'Your purge zone is the only weapon inside quarantine. Hold it over corrupted processes to destroy them.',
    purgeCost: 'Every purge hit and every passing second feeds Overload.',
    overclock:
      'Overclock surges purge output, but Overload builds faster while active. Press Space when you can handle the pressure.',
  },
  breach: {
    overload: 'Overload is the live Breach meter on your thread. Keep it under control.',
    meltdown: 'At 100% Overload. Meltdown. The quarantine fails.',
    vent: 'Breach Vent modules bleed pressure from each kill, permanent relief through the Module Tree.',
  },
  economy: {
    vaultShardsTooltip:
      'Hex Shards are stable data fragments salvaged from corrupted processes. Your total grows with each kill during a run.',
    anchorFragments:
      'Anchoring data torn from the Breach Anchor, only earned when you destroy the boss.',
  },
  moduleTree: {
    intro:
      'This hex grid is our best shot. It integrates your permanent modules between runs. I cannot install them directly. Select a node to execute the reinforcement.',
    betweenRuns:
      'Between runs, spend Hex Shards on hex nodes. Every upgrade hardens the quarantine before the next breach.',
  },
  fluxDrive: {
    name: 'Flux Drive',
    description:
      'Flux Drive doubles simulation speed inside quarantine. Faster combat, faster timers, faster Overload. Toggle only if you can handle the pressure.',
  },
  prestige: {
    unlock:
      "Breach Anchor down. I'm opening a deeper reconfiguration layer. Prestige. Core reconfiguration, permanent gains. The Uplink is still ahead. We take this anyway.",
    banner: 'Prestige system unlocked',
  },
  loop: {
    mission:
      'Stop corrupted processes before they break quarantine. Launch a run. Purge the arena and extract Hex Shards from every kill. When the thread ends, spend them on the Module Tree. I advise. You execute. Each reinforcement buys us time toward the Uplink.',
  },
  enemies: {
    boss:
      'The Breach Anchor is a massive corrupted process, the final rupture of the wave. Destroy it to end the run in victory.',
  },
};

export const EN_STRINGS: GameStrings = {
  title: 'Zero Archive',
  tagline: LORE.pitch.short,
  role: 'You are Node-0, a child process in quarantine.',
  objective: `${LORE.combat.purge} ${LORE.combat.purgeCost} Keep the Breach under control until you contain the threat, or suffer a Meltdown.`,
  arch: ARCH,
  runEnd: {
    victoryTitle: 'Breach Contained',
    victorySubtitle: 'Threat contained. Node-0 holds.',
    victoryArchVariants: [
      "Anchor down. Hex Shards to vault. We bought time. Don't waste it.",
      'Anchor data secured. Capstone modules are online. Spend fragments on the marked nodes.',
    ],
    meltdownTitle: 'Meltdown',
    meltdownSubtitle: 'Overload at 100%. The active thread has collapsed. Node-0 stands by.',
    meltdownArchVariants: [
      "I caught you in time. Margin was thinner than last time. Reinforcing now.",
      "Still here. Almost lost the thread. I'm not letting that happen again.",
      "Got you. That was close, closer than I'd like. Reinforcing.",
    ],
    prestigeUnlocked: LORE.prestige.banner,
    prestigeArch:
      'Deeper layer unlocked. You can rewrite more of the archive than I can reach now.',
    anchorFragmentsEarned: 'Anchor Fragments',
  },
  hub: {
    upgradesTitle: 'Module Enhancements',
    upgradesSubtitle: LORE.moduleTree.betweenRuns,
  },
  moduleTree: {
    placeholderTitle: 'Reserved module',
    placeholderBody: 'Design slot. Replace this node in a future update.',
  },
  mainMenu: {
    newGame: 'New Game',
    continue: 'Continue',
    settings: 'Settings',
    quit: 'Quit',
    statusUnstable: 'NODE-0 STATUS: UNSTABLE',
    confirmTitle: 'Erase all progress?',
    confirmBody: 'This cannot be undone.',
    confirmCancel: 'Cancel',
    confirmErase: 'Erase',
    quitDisabledTooltip: 'Available in desktop build',
  },
  hud: {
    overloadLabel: 'Overload',
    overloadStable: 'Stable',
    overloadUrgent: 'Meltdown imminent',
    overloadHint: 'Purge · impacts · time',
    fluxDriveLabel: LORE.fluxDrive.name,
    fluxDriveOn: '×2 ON',
    fluxDriveOff: '×1 OFF',
  },
  currency: {
    runShardsLabel: 'Hex Shards',
    availableShardsLabel: 'Hex Shards',
    anchorFragmentsLabel: 'Anchor Fragments',
    shardsEarnedSuffix: 'Hex Shards',
    anchorEarnedSuffix: 'Anchor Fragments',
    transferredToVault: 'Earned this run',
    shardsLoreTooltip: LORE.economy.vaultShardsTooltip,
    anchorLoreTooltip: LORE.economy.anchorFragments,
  },
  pause: {
    title: 'SYSTEM HALT',
    subtitle: 'Node-0 execution suspended',
    resumeLabel: 'Resume',
    abortLabel: 'Abort\nRun',
    settingsLabel: 'Settings',
    confirmPrompt: 'Abort this run? Your Hex Shards are kept.',
    confirmYes: 'Yes',
    confirmNo: 'No',
    statBreach: 'Breach',
    statWave: 'Wave',
    statCycle: 'Cycle',
    statShards: 'Hex Shards',
    escHint: 'Esc · Resume',
  },
  settings: {
    title: 'System Config',
    subtitle: 'Node-0 preferences',
    closeLabel: 'Close',
    returnToMainMenuLabel: 'Main Menu',
    comingSoon: 'Coming soon',
    masterVolumeLabel: 'Master Volume',
    musicVolumeLabel: 'Music Volume',
    sfxVolumeLabel: 'FX Volume',
    languageAuto: 'Auto (System)',
    languageFrench: 'Français',
    languageEnglish: 'English',
    languageHint: 'Auto follows your browser language.',
    sections: {
      audio: 'Audio',
      language: 'Language',
      controls: 'Controls',
    },
  },
  tutorial: {
    signalHandshake:
      '...noi—se... [ERR_702] Node-0, parse th—is! Send a re—turn code, wak—e up... pl--ea--se... Connection stable. Do not drop.',
    archIntro: ARCH.intro,
    welcomeContext: `${LORE.pitch.hook} ${LORE.world.quarantine} ${LORE.world.seed}`,
    node0Role: `${LORE.node0.identity} ${LORE.node0.threat}`,
    missionLoop: LORE.loop.mission,
    moduleTreeIntro: `${LORE.moduleTree.intro} ${ARCH.improvises}`,
    purgeAction: `You're live. ${LORE.combat.purge} ${LORE.combat.purgeCost}`,
    overloadStakes: `${LORE.breach.overload} ${LORE.breach.meltdown}`,
    overloadGoal: 'Contain the threat before quarantine breaks.',
    hexShardsUnified:
      'Hex Shards are stable data fragments salvaged from corrupted processes. They drop when you purge a target. Sweep your purge zone over them to collect. Spend them on the Module Tree to reinforce yourself.',
    overclockRisk: LORE.combat.overclock,
    moduleTreeLore: LORE.moduleTree.betweenRuns,
    prestigeReveal: LORE.prestige.unlock,
    fluxDriveLore: LORE.fluxDrive.description,
  },
  archAmbient: {
    bossIncoming: "That's the Breach Anchor, the rupture point. End it.",
    overloadCritical: "Thread pressure critical. I'm losing the channel.",
    firstRun: 'Quarantine thread active. Purge what breaks through.',
    waveMidpoint: 'Midpoint confirmed. The Archive isn\'t stable yet, keep purging.',
    fluxDrive: 'Flux Drive online. Double speed, double risk. Your call.',
  },
  tutorialSteps: {
    signalHandshakeTitle: 'INCOMING SIGNAL',
    node0RoleTitle: 'NODE-0',
    missionLoopTitle: 'Contain the Breach',
    moduleTreeTitle: 'Module Tree',
    purgeZoneTitle: 'Purge Zone',
    overclockTitle: 'Overclock',
    breachContainedTitle: 'Breach Contained',
  },
  upgrades: {
    node0Boot: {
      name: 'Node-0 Boot',
      description: 'Boot the quarantine thread so Node-0 can purge corrupted processes',
    },
    shardSalvage: {
      name: 'Shard Salvage',
      description: 'Extract more Hex Shards from every corrupted process you purge',
    },
    shardYield: {
      name: 'Extraction Yield',
      description: 'Increase the base Hex Shard yield from every kill',
    },
    shardMagnet: {
      name: 'Shard Magnet',
      description: 'Draw dropped shards toward your purge zone from farther away',
    },
    purgeStrike: {
      name: 'Purge Strike',
      description: 'Increase purge hit damage against corrupted processes',
    },
    eliteBreaker: {
      name: 'Elite Breaker',
      description: 'Hit heavy corrupted processes harder with your purge zone',
    },
    purgeCadence: {
      name: 'Purge Cadence',
      description: 'Increase purge tick rate for faster clears',
    },
    purgeReach: {
      name: 'Purge Reach',
      description: 'Expand purge zone coverage on the arena',
    },
    purgeSplash: {
      name: 'Purge Splash',
      description: 'Splash purge damage to corrupted processes just outside your zone',
    },
    threadCoolant: {
      name: 'Thread Coolant',
      description: 'Reduce passive Overload buildup while the Breach holds',
    },
    killBreachRelief: {
      name: 'Kill Vent',
      description: 'Each purge kill sheds a bit of Breach pressure',
    },
    meltdownThreshold: {
      name: 'Meltdown Threshold',
      description: 'Stretch the Overload buffer before Meltdown',
    },
  },
  branches: {
    degats: 'Damage',
    thermique: 'Heat',
    flux: 'Flux',
  },
  tooltipStats: {
    purgeHitDamage: 'Purge hit damage',
    purgeDamageBonus: 'Purge damage bonus',
    elitePurgeDamageBonus: 'Heavy process bonus',
    elitePurgeHitDamage: 'Purge hit vs heavy',
    shardBonusPerKill: 'Hex Shards / kill',
    shardYieldBonus: 'Shard yield bonus',
    shardPickupRadius: 'Shard pickup radius',
    shardPickupReachBonus: 'Shard attraction radius',
    purgeCadence: 'Purge cadence',
    purgeReach: 'Main purge zone',
    purgeReachBonus: 'Purge zone bonus',
    purgeSplashRadius: 'Splash reach (vs main zone)',
    purgeSplashDamage: 'Splash damage',
    passiveBreachPerSec: 'Passive Breach / sec',
    reduction: 'Reduction',
    breachReliefPerKill: 'Breach relief / kill',
    meltdownThreshold: 'Meltdown threshold',
    max: 'max',
  },
  playerStats: {
    title: 'NODE-0 // STATS',
    openLabel: 'Node-0 stats',
    cadenceUnit: '/s',
    purgeSplashZone: 'Splash zone',
  },
  transitions: {
    bootTitle: 'ARCH // NODE-0 BOOT',
    shutdownTitle: 'ARCH // THREAD SUSPEND',
    bootLine1: 'NODE-0 STATUS: ONLINE',
    bootLine2: 'ARCH // PURGE THREAD ACTIVE',
    bootLine3: 'BREACH CONTAINMENT: ENGAGED',
    shutdownLine1: 'ARCH // PURGE THREAD SUSPENDED',
    shutdownLine2: 'NODE-0 STATUS: STANDBY',
    shutdownLine3: 'ZERO ARCHIVE: RECOVERY MODE',
    shutdownAbortedLine1: 'ARCH // PURGE THREAD HALTED',
    shutdownAbortedLine2: 'NODE-0 STATUS: STANDBY',
    shutdownAbortedLine3: 'ZERO ARCHIVE: RECOVERY MODE',
  },
  ui: {
    startRun: 'Start\nRun',
    skip: 'Skip',
    purchase: 'Purchase',
    purchaseAnchor: 'Install',
    max: 'MAX',
    fullyUpgraded: 'Fully upgraded',
    nextRankCost: 'Next rank cost',
    requirementsNotMet: 'Requirements not met',
    maxUpgradeToUnlock: 'Max {name} to unlock',
    node0Label: 'NODE-0',
    purgeZone: 'Purge Zone',
    mouse: 'Mouse',
    bossIncoming: 'Boss Incoming',
    boss: 'BOSS',
    wave: 'Wave',
    waveClear: 'Wave Clear',
    overclock: 'Overclock',
    levelFormat: 'Level {current} / {max}',
    previous: 'Previous',
    next: 'Next',
    gotIt: 'Got it',
    moduleTree: 'Module\nTree',
    cycleLabel: 'Cycle {n}',
    cycleWaveFormat: 'Cycle {cycle} · Wave {wave}/{max}',
    cycleBossFormat: 'Cycle {cycle} · BOSS',
  },
};
