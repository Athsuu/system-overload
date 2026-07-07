import type { GameStrings } from '../types';

const ARCH = {
  name: 'ARCH',
  fullName: 'Archive Recovery & Containment Heuristic',
  channelLabel: 'ARCH // ADVISORY CHANNEL',
  intro:
    "I'm ARCH — Archive Recovery & Containment Heuristic. I compiled you into quarantine. Listen — we don't have much time.",
  role:
    'Recovery heuristic — trapped inside the same collapse as you. I can guide. I cannot execute.',
  improvises:
    "I don't have a clean repair map. I'm routing recovery protocols I've never run before — we improvise, or we lose the Seed.",
};

const LORE = {
  pitch: {
    short: 'The Zero Archive collapses under a wave of corrupted processes.',
    hook: 'Corrupted processes flood the Zero Archive. The Breach is rising.',
  },
  world: {
    quarantine:
      'I compiled Node-0 in a quarantined execution thread — the last bubble still stable inside a dying archive.',
    seed: 'The Seed is the original pure source code of the Zero Archive. I am trying to save it. You keep it isolated.',
  },
  node0: {
    identity:
      'You are Node-0 — a child process I compiled into quarantine. This thread is all that stands between the corruption and the Seed.',
    threat:
      'Corrupted processes hammer the quarantine wall. Every purge hit and every passing second feeds the Breach closer to Meltdown.',
  },
  combat: {
    purge:
      'Your purge zone is the only weapon inside quarantine. Hold it over corrupted processes to destroy them.',
    purgeCost: 'Every purge hit and every passing second feeds Overload.',
    overclock:
      'Overclock surges purge output — but Overload builds faster while active. Press Space when you can handle the pressure.',
  },
  breach: {
    overload: 'Overload is the live Breach meter on your thread. Keep it under control.',
    meltdown: 'At 100% Overload — Meltdown. The quarantine fails.',
    vent: 'Breach Vent modules bleed pressure from each kill — permanent relief through the Skill Tree.',
  },
  economy: {
    runShards:
      'Run Shards are stable data fragments salvaged from corrupted processes during a run.',
    vault:
      'When a run ends, Shards transfer to your vault — currency for repairs between threads.',
    hexShards: 'Hex Shards fund permanent Node-0 reconfiguration between runs.',
  },
  skillTree: {
    intro:
      "This hex grid is our best shot — permanent modules between runs. I can't install them. Select a node and you execute the repair.",
    betweenRuns:
      'Between runs, spend Available Shards on hex nodes. Every upgrade hardens the quarantine before the next breach.',
  },
  fluxDrive: {
    name: 'Flux Drive',
    description:
      'Flux Drive doubles simulation speed inside quarantine — faster combat, faster timers, faster Overload. Toggle only if you can handle the pressure.',
  },
  prestige: {
    unlock:
      "Breach Anchor down. I'm opening a deeper reconfiguration layer — Prestige. Partial reset, permanent gains. The Uplink is still ahead. We take this anyway.",
    banner: 'Prestige system unlocked',
  },
  loop: {
    mission:
      'Stop corrupted processes before they break quarantine. Launch a Run — purge in the arena, salvage Shards from every kill. When the thread ends, spend them on the Skill Tree. I advise. You execute. Each upgrade buys us time toward the Uplink.',
  },
  enemies: {
    boss:
      'The Breach Anchor is a massive corrupted process — the final rupture of the wave. Destroy it to end the run in victory.',
  },
};

export const EN_STRINGS: GameStrings = {
  title: 'Zero Archive',
  tagline: LORE.pitch.short,
  role: 'You are Node-0 — a child process in quarantine.',
  objective: `${LORE.combat.purge} ${LORE.combat.purgeCost} Keep the Breach under control until you contain the threat — or suffer a Meltdown.`,
  arch: ARCH,
  runEnd: {
    victoryTitle: 'Breach Contained',
    victorySubtitle: 'Threat contained — Node-0 holds.',
    victoryArch: "Anchor down. Shards to vault. We bought time — don't waste it.",
    meltdownTitle: 'Meltdown',
    meltdownSubtitle: 'Node-0 overloaded — the quarantine thread has failed.',
    meltdownArch: '…thread lost. Signal—',
    prestigeUnlocked: LORE.prestige.banner,
    prestigeArch:
      'Deeper layer unlocked. You can rewrite more of the archive than I can reach now.',
    anchorFragmentsEarned: 'Anchor Fragments',
    firstAnchorArch:
      'Anchor data secured. Capstone modules are online — spend fragments on the marked nodes.',
  },
  hub: {
    upgradesTitle: 'Skill Enhancements',
    upgradesSubtitle: LORE.skillTree.betweenRuns,
  },
  skillTree: {
    placeholderTitle: 'Reserved module',
    placeholderBody: 'Design slot — replace this node in a future update.',
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
    runShardsLabel: 'Run Shards',
    availableShardsLabel: 'Available Shards',
    anchorFragmentsLabel: 'Anchor Fragments',
    shardsEarnedSuffix: 'Shards',
    anchorEarnedSuffix: 'Anchor Fragments',
    transferredToVault: 'Transferred to vault',
  },
  pause: {
    title: 'SYSTEM HALT',
    subtitle: 'Node-0 execution suspended',
    resumeLabel: 'Resume',
    abortLabel: 'Abort\nRun',
    settingsLabel: 'Settings',
    confirmPrompt: 'Abort this run? Shards will transfer to vault.',
    confirmYes: 'Yes',
    confirmNo: 'No',
    statBreach: 'Breach',
    statWave: 'Wave',
    statShards: 'Run Shards',
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
    archIntro: ARCH.intro,
    welcomeContext: `${LORE.pitch.hook} ${LORE.world.quarantine} ${LORE.world.seed}`,
    node0Role: `${LORE.node0.identity} ${LORE.node0.threat}`,
    missionLoop: LORE.loop.mission,
    skillTreeIntro: `${LORE.skillTree.intro} ${ARCH.improvises}`,
    purgeAction: `You're live. ${LORE.combat.purge} ${LORE.combat.purgeCost}`,
    overloadStakes: `${LORE.breach.overload} ${LORE.breach.meltdown}`,
    overloadGoal: 'Contain the threat before quarantine breaks.',
    shardsWhy: LORE.economy.runShards,
    shardsLoop: LORE.economy.vault,
    overclockRisk: LORE.combat.overclock,
    skillTreeLore: LORE.skillTree.betweenRuns,
    vaultLore: `${LORE.economy.hexShards} ${LORE.economy.vault}`,
    prestigeReveal: LORE.prestige.unlock,
    fluxDriveLore: LORE.fluxDrive.description,
    breachVentHint: LORE.breach.vent,
    bossHint: LORE.enemies.boss,
  },
  archAmbient: {
    bossIncoming: "That's the Breach Anchor — the rupture point. End it.",
    overloadCritical: "Thread pressure critical. I'm losing the channel.",
    firstRun: 'Quarantine thread active. Purge what breaks through.',
    fluxDrive: 'Flux Drive online. Double speed — double risk. Your call.',
  },
  tutorialSteps: {
    node0RoleTitle: 'Quarantined Thread',
    missionLoopTitle: 'Contain the Breach',
    skillTreeTitle: 'Skill Tree',
    purgeZoneTitle: 'Purge Zone',
    overclockTitle: 'Overclock',
    breachContainedTitle: 'Breach Contained',
  },
  upgrades: {
    node0Boot: {
      name: 'Node-0 Boot',
      description: 'Initialize the quarantine thread — +1 purge hit damage',
    },
    fireRate: { name: 'Purge Rate', description: '+10% attack speed per level' },
    boltDamage: { name: 'Purge Power', description: '+5 purge hit damage per level' },
    damageAmp: { name: 'Damage Amplifier', description: '+10% purge hit damage per level' },
    coolingPower: { name: 'Coolant', description: '-10% passive Breach per level' },
    heatShield: { name: 'Heat Shield', description: '-10% impact Breach per level' },
    fluxThrottle: {
      name: 'Breach Vent',
      description: '-0.08% Breach per kill per level (more on higher tiers)',
    },
    criticalThreshold: { name: 'Heat Capacity', description: '+10% meltdown threshold' },
    nodeReach: { name: 'Purge Radius', description: '+25% purge zone radius per level' },
    overclock: {
      name: 'Overclock',
      description: 'Unlock Overclock in run — Space to surge purge output (Overload builds faster while active)',
    },
    purgeReach: { name: 'Purge Reach', description: '+20% purge zone radius' },
    fluxDrive: {
      name: 'Flux Drive',
      description: '×2 simulation speed — purge, enemies, timers, and Breach buildup',
    },
    killBonus: { name: 'Kill Bonus', description: '+1 shard per kill per level' },
    shardYield: { name: 'Shard Yield', description: '+15% shards per kill per level' },
    starterNodes: { name: 'Initial Relay', description: '+1 enemy at wave 1 start per level' },
    spawnThrottle: { name: 'Spawn Throttle', description: '+10% spawn interval per level' },
    containment: { name: 'Containment', description: '-1 max alive enemies per wave' },
  },
  branches: {
    attackSpeed: 'Attack Speed',
    degats: 'Damage',
    thermique: 'Heat',
    purgeAoe: 'Purge AOE',
    shards: 'Shards',
    enemies: 'Enemies',
    flux: 'Flux',
  },
  tooltipStats: {
    purgeHitDamage: 'Purge hit damage',
    purgeDamageBonus: 'Purge damage bonus',
    attackSpeed: 'Attack speed',
    purgeInterval: 'Purge interval',
    passiveBreachPerSec: 'Passive Breach / sec',
    reduction: 'Reduction',
    impactBreachTier0: 'Impact Breach (tier 0)',
    breachReliefPerKill: 'Breach relief / kill',
    tier1Kill: 'Tier 1 kill',
    meltdownThreshold: 'Meltdown threshold',
    purgeRadius: 'Purge radius',
    radiusBonus: 'Radius bonus',
    simulationSpeed: 'Simulation speed',
    simulationSpeedToggle: '×2 (toggle in run)',
    bonusShardsPerKill: 'Bonus shards / kill',
    shardsPerKillTier0: 'Shards / kill (tier 0)',
    shardMultiplier: 'Shard multiplier',
    bonus: 'Bonus',
    wave1ExtraEnemies: 'Wave 1 extra enemies',
    spawnInterval: 'Spawn interval',
    slowerSpawns: 'Slower spawns',
    maxAliveReduction: 'Max alive reduction',
    exampleCapWave1: 'Example cap (wave 1)',
    max: 'max',
    overclockDuration: 'Active duration',
    overclockCooldown: 'Cooldown',
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
    skillTree: 'Skill\nTree',
  },
};
