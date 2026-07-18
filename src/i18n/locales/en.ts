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
      'Hardware chips torn from the Breach Anchor, one every 3 successful Cycles. Socket one into a module to Supercharge it: doubled yield, heavier global Overload while the chip stays active.',
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
      'The Breach Anchor is a massive corrupted process, the rupture point at 75 kills. Destroy it to end the run in victory.',
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
      'Anchor chip secured. Socket it into a module — supercharge the yield, if you can take the Overload.',
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
    seedFragmentsLabel: 'Seed Fragments',
    seedFragmentsShort: 'SF',
    shardsEarnedSuffix: 'Hex Shards',
    anchorEarnedSuffix: 'Anchor Fragments',
    transferredToVault: 'Earned this run',
    shardsLoreTooltip: LORE.economy.vaultShardsTooltip,
    anchorLoreTooltip: LORE.economy.anchorFragments,
    seedLoreTooltip:
      'Pure data torn from the Seed during Recompile. Spent on Core Protocols etched into Node-0 source code. Never lost on reset.',
    anchorProgressFormat: 'Next: {current}/{total} Cycles',
  },
  hardwareSupercharge: {
    sectionTitle: 'Hardware Supercharge',
    superchargeButton: 'Supercharge',
    costFormat: 'Cost: {n} Chip',
    bonusLabel: 'Yield ×2',
    malusLabel: '+25% Global Overload',
    toggleOn: 'ON',
    toggleOff: 'OFF',
  },
  pause: {
    title: 'SYSTEM HALT',
    subtitle: 'Node-0 execution suspended',
    resumeLabel: 'Resume',
    abortLabel: 'Abort Run',
    settingsLabel: 'Settings',
    confirmPrompt: 'Abort this run? Your Hex Shards are kept.',
    confirmYes: 'Yes',
    confirmNo: 'No',
    statBreach: 'Breach',
    statKills: 'Kills',
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
      description: 'Extract 1 extra Hex Shard from every purged kill. First economy module after the magnet',
    },
    victoryShardBonus: {
      name: 'Threat Feed',
      description: 'Raise spawn rate and max living enemies (+50 % per rank). More chaos, more shards, more risk',
    },
    shardMagnet: {
      name: 'Shard Magnet',
      description: 'Draw dropped shards toward your purge zone from farther away. Early quarantine comfort — collection radii in hex',
    },
    purgeStrike: {
      name: 'Purge Strike',
      description: 'Increase purge hit damage against corrupted processes',
    },
    purgeCadence: {
      name: 'Purge Cadence',
      description: 'Increase purge tick rate for faster clears',
    },
    purgeCrit: {
      name: 'Purge Crit',
      description: 'Raises the chance that each purge tick lands a critical hit',
    },
    purgeReach: {
      name: 'Purge Reach',
      description: 'Expand the purge zone on the arena. Range shown in hex (1 hex = Node-0 base size)',
    },
    purgeSplash: {
      name: 'Purge Splash',
      description: 'Splash purge damage outside the main zone. Splash radius in hex',
    },
    latencyInjection: {
      name: 'Latency Injection',
      description: 'Slow down corrupted processes inside your active purge zone',
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
    overclock: {
      name: 'Overclock',
      description: 'Unlocks the Overclock button: temporary purge boost, at the cost of faster Overload buildup',
    },
    fluxDrive: {
      name: 'Flux Drive',
      description: 'Unlocks the Flux Drive toggle: doubles simulation speed inside quarantine',
    },
    leakSealing: {
      name: 'Quarantine Plating',
      description:
        'Softens the Overload backlash on each purge hit (+3 plating / rank, max 15). Higher max HP hits back harder; every enemy struck retaliates (main zone, splash, explosion)',
    },
    purgeAmplifier: {
      name: 'Purge Amplifier',
      description:
        'Boosts purge hit damage against all corrupted processes (+7 / rank, max +35). Works in every cycle',
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
    shardBonusPerKill: 'Hex Shards / kill',
    shardYieldBonus: 'Shard yield bonus',
    victoryShardBonus: 'Spawn bonus',
    victoryShardTotal: 'Victory payout total',
    spawnRateBonus: 'Spawn rate bonus',
    spawnMaxAlive: 'Max living enemies',
    shardPickupRadius: 'Shard pickup radius',
    shardPickupReachBonus: 'Shard attraction radius',
    purgeCadence: 'Purge cadence',
    criticalChance: 'Critical chance',
    criticalChanceBonus: 'Crit bonus',
    purgeReach: 'Main purge zone',
    purgeReachBonus: 'Purge zone bonus',
    purgeSplashRadius: 'Splash reach',
    purgeSplashDamage: 'Splash damage',
    latencySlowBonus: 'Process slowdown',
    passiveBreachPerSec: 'Passive Breach / sec',
    reduction: 'Reduction',
    breachReliefPerKill: 'Breach relief / kill',
    meltdownThreshold: 'Meltdown threshold',
    max: 'max',
    overclockDuration: 'Overclock duration',
    overclockCooldown: 'Overclock cooldown',
    fluxDriveSpeed: 'Simulation speed',
    leakSealingReduction: 'Plating',
    leakArmor: 'Plating',
    hitHeatNetExample: 'Hit backlash (trash / boss)',
    purgeAmplifierBonus: 'Purge damage bonus',
  },
  playerStats: {
    title: 'NODE-0 // STATS',
    openLabel: 'Node-0 stats',
    cadenceUnit: '/s',
    purgeSplashZone: 'Splash zone',
    hexUnit: 'hex',
    emptyTab: 'Nothing here yet.',
    tabs: {
      damage: 'Damage',
      overload: 'Overload',
      economy: 'Economy',
      misc: 'Misc',
    },
  },
  seedProtocols: {
    screenTitle: 'Seed Protocols',
    screenSubtitle: 'Core optimizations written into Node-0 source code',
    openButton: 'Seed\nProtocols',
    backToHub: 'Back to\nHub',
    tabFundamentals: 'Fundamentals',
    tabSkills: 'Skills',
    branchHeading: 'Upgrades',
    recompileAction: 'Recompile',
    recompileAvailable: 'Recompile available',
    recompileConfirmTitle: 'Seed Recompilation',
    recompileConfirmBody:
      'I can recompile you from the Seed itself. You lose everything. What you gain is written into your source code. Permanent.',
    recompileCancel: 'Cancel',
    recompileLoseShards: 'Hex Shards lost: {n}',
    recompileLoseAnchors: 'Anchor Fragments lost: {n}',
    recompileLoseModules: 'All Module Tree levels reset',
    recompileLoseCycles: 'Cycles reset to Cycle 1',
    recompileDepthLabel: 'Recompile Depth: {n}',
    recompileDepthAfter: 'Next Recompile Depth: {n}',
    postRecompileArch:
      'Recompile complete. Depth {n}. You feel different because you ARE different. The old modules are gone, but what the Seed gave you stays.',
    protocols: {
      residualMemory: {
        name: 'Residual Memory',
        description: 'Gain Hex Shards on purchase and at the start after each Recompile (+200 per rank, uncapped)',
      },
      bootReinforcement: {
        name: 'Boot Reinforcement',
        description: 'Multiplicative boost to total purge hit damage (+15% per rank, uncapped)',
      },
      thermalBaseline: {
        name: 'Thermal Baseline',
        description: 'Lower passive Overload buildup from the Breach (×0.9 per rank, exponential falloff, uncapped)',
      },
      extractionProtocol: {
        name: 'Extraction Protocol',
        description: 'Extract more Hex Shards from every kill (+15% global yield per rank, uncapped)',
      },
      seedResonance: {
        name: 'Seed Resonance',
        description: 'Gain extra Seed Fragments on every future Recompile (+25% per rank, additive stacking, uncapped)',
      },
      explosivePurge: {
        name: 'Explosive Purge',
        description: 'Every purge kill triggers a small explosion (fixed radius, 40% of purge hit damage). Max 1.',
      },
      explosivePurgeRadius: {
        name: 'Explosion Radius',
        description: 'Widen Explosive Purge blast radius (+30 px per rank, max 3)',
      },
      explosivePurgeDamage: {
        name: 'Explosion Damage',
        description: 'Raise explosion damage (+15% of purge hit damage per rank, max 3)',
      },
      explosivePurgeChain: {
        name: 'Explosive Chain',
        description: 'Kills caused by an explosion can explode too (+1 chain depth per rank, max 3)',
      },
      overclock: {
        name: 'Overclock',
        description:
          'Unlocks the Overclock button: temporary purge boost at the cost of faster Overload. Permanent after Recompile.',
      },
      fluxDrive: {
        name: 'Flux Drive',
        description:
          'Unlocks the Flux Drive toggle: double simulation speed in quarantine. Requires Overclock. Permanent after Recompile.',
      },
    },
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
    startRun: 'Start Run',
    skip: 'Skip',
    purchase: 'Purchase',
    purchaseAnchor: 'Install',
    max: 'MAX',
    fullyUpgraded: 'Fully upgraded',
    nextRankCost: 'Next rank cost',
    requirementsNotMet: 'Requirements not met',
    maxUpgradeToUnlock: 'Max {name} to unlock',
    node0Label: 'NODE-0',
    reservedModuleLabel: 'RESERVED',
    purgeZone: 'Purge Zone',
    mouse: 'Mouse',
    bossIncoming: 'Boss Incoming',
    boss: 'BOSS',
    overclock: 'Overclock',
    levelFormat: 'Level {current} / {max}',
    levelFormatUncapped: 'Level {n}',
    previous: 'Previous',
    next: 'Next',
    gotIt: 'Got it',
    moduleTree: 'Module Tree',
    cycleLabel: 'Cycle {n}',
    cycleKillFormat: 'Cycle {cycle} · {kills}/{max}',
    cycleBossFormat: 'Cycle {cycle} · BOSS',
  },
};
