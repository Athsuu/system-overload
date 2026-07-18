import type { BranchId } from '../store/moduleTree';
import type { UpgradeId } from '../store/upgradeCatalog';
import type { CoreProtocolId } from '../store/prestigeTypes';

export type GameLocale = 'en' | 'fr';
export type LanguageMode = 'auto' | GameLocale;

export interface CoreProtocolText {
  name: string;
  description: string;
}

export interface SeedProtocolsStrings {
  screenTitle: string;
  screenSubtitle: string;
  openButton: string;
  backToHub: string;
  tabFundamentals: string;
  tabSkills: string;
  branchHeading: string;
  recompileAction: string;
  recompileAvailable: string;
  recompileConfirmTitle: string;
  recompileConfirmBody: string;
  recompileCancel: string;
  recompileLoseShards: string;
  recompileLoseAnchors: string;
  recompileLoseModules: string;
  recompileLoseCycles: string;
  recompileDepthLabel: string;
  recompileDepthAfter: string;
  postRecompileArch: string;
  protocols: Record<CoreProtocolId, CoreProtocolText>;
}

export interface UpgradeText {
  name: string;
  description: string;
}

export interface PlayerStatsStrings {
  title: string;
  openLabel: string;
  cadenceUnit: string;
  purgeSplashZone: string;
  hexUnit: string;
  emptyTab: string;
  tabs: {
    damage: string;
    overload: string;
    economy: string;
    misc: string;
  };
}

export interface TransitionStrings {
  bootTitle: string;
  shutdownTitle: string;
  bootLine1: string;
  bootLine2: string;
  bootLine3: string;
  shutdownLine1: string;
  shutdownLine2: string;
  shutdownLine3: string;
  shutdownAbortedLine1: string;
  shutdownAbortedLine2: string;
  shutdownAbortedLine3: string;
}

export interface TooltipStatLabels {
  purgeHitDamage: string;
  purgeDamageBonus: string;
  shardBonusPerKill: string;
  shardYieldBonus: string;
  victoryShardBonus: string;
  victoryShardTotal: string;
  spawnRateBonus: string;
  spawnMaxAlive: string;
  shardPickupRadius: string;
  shardPickupReachBonus: string;
  purgeCadence: string;
  criticalChance: string;
  criticalChanceBonus: string;
  purgeReach: string;
  purgeReachBonus: string;
  purgeSplashRadius: string;
  purgeSplashDamage: string;
  latencySlowBonus: string;
  passiveBreachPerSec: string;
  reduction: string;
  breachReliefPerKill: string;
  meltdownThreshold: string;
  max: string;
  overclockDuration: string;
  overclockCooldown: string;
  fluxDriveSpeed: string;
  leakSealingReduction: string;
  leakArmor: string;
  hitHeatNetExample: string;
  purgeAmplifierBonus: string;
}

export interface TutorialStepText {
  signalHandshakeTitle: string;
  node0RoleTitle: string;
  missionLoopTitle: string;
  moduleTreeTitle: string;
  purgeZoneTitle: string;
  overclockTitle: string;
  breachContainedTitle: string;
}

export interface UiStrings {
  startRun: string;
  skip: string;
  purchase: string;
  purchaseAnchor: string;
  max: string;
  fullyUpgraded: string;
  nextRankCost: string;
  requirementsNotMet: string;
  maxUpgradeToUnlock: string;
  node0Label: string;
  reservedModuleLabel: string;
  purgeZone: string;
  mouse: string;
  bossIncoming: string;
  boss: string;
  overclock: string;
  levelFormat: string;
  levelFormatUncapped: string;
  previous: string;
  next: string;
  gotIt: string;
  moduleTree: string;
  cycleLabel: string;
  cycleKillFormat: string;
  cycleBossFormat: string;
}

export interface GameStrings {
  title: string;
  tagline: string;
  role: string;
  objective: string;
  arch: {
    name: string;
    fullName: string;
    channelLabel: string;
    runRelayLabel: string;
    signalBufferLabel: string;
    intro: string;
    role: string;
    improvises: string;
  };
  runEnd: {
    victoryTitle: string;
    victorySubtitle: string;
    victoryArchVariants: readonly [string, string];
    meltdownTitle: string;
    meltdownSubtitle: string;
    meltdownArchVariants: readonly [string, string, string];
    prestigeUnlocked: string;
    prestigeArch: string;
    anchorFragmentsEarned: string;
  };
  hub: {
    upgradesTitle: string;
    upgradesSubtitle: string;
  };
  mainMenu: {
    newGame: string;
    continue: string;
    settings: string;
    quit: string;
    statusUnstable: string;
    confirmTitle: string;
    confirmBody: string;
    confirmCancel: string;
    confirmErase: string;
    quitDisabledTooltip: string;
  };
  hud: {
    overloadLabel: string;
    overloadStable: string;
    overloadUrgent: string;
    overloadHint: string;
    fluxDriveLabel: string;
    fluxDriveOn: string;
    fluxDriveOff: string;
  };
  currency: {
    runShardsLabel: string;
    availableShardsLabel: string;
    anchorFragmentsLabel: string;
    seedFragmentsLabel: string;
    seedFragmentsShort: string;
    shardsEarnedSuffix: string;
    anchorEarnedSuffix: string;
    transferredToVault: string;
    shardsLoreTooltip: string;
    anchorLoreTooltip: string;
    seedLoreTooltip: string;
    anchorProgressFormat: string;
  };
  hardwareSupercharge: {
    sectionTitle: string;
    superchargeButton: string;
    costFormat: string;
    bonusLabel: string;
    malusLabel: string;
    toggleOn: string;
    toggleOff: string;
  };
  pause: {
    title: string;
    subtitle: string;
    resumeLabel: string;
    abortLabel: string;
    settingsLabel: string;
    confirmPrompt: string;
    confirmYes: string;
    confirmNo: string;
    statBreach: string;
    statKills: string;
    statCycle: string;
    statShards: string;
    escHint: string;
  };
  settings: {
    title: string;
    subtitle: string;
    closeLabel: string;
    returnToMainMenuLabel: string;
    comingSoon: string;
    masterVolumeLabel: string;
    musicVolumeLabel: string;
    sfxVolumeLabel: string;
    languageAuto: string;
    languageFrench: string;
    languageEnglish: string;
    languageHint: string;
    sections: {
      audio: string;
      language: string;
      controls: string;
    };
  };
  tutorial: {
    signalHandshake: string;
    archIntro: string;
    welcomeContext: string;
    node0Role: string;
    missionLoop: string;
    moduleTreeIntro: string;
    purgeAction: string;
    overloadStakes: string;
    overloadGoal: string;
    hexShardsUnified: string;
    overclockRisk: string;
    moduleTreeLore: string;
    prestigeReveal: string;
    fluxDriveLore: string;
  };
  archAmbient: {
    bossIncoming: string;
    overloadCritical: string;
    firstRun: string;
    waveMidpoint: string;
    fluxDrive: string;
  };
  tutorialSteps: TutorialStepText;
  upgrades: Record<UpgradeId, UpgradeText>;
  branches: Record<BranchId, string> & { flux: string };
  tooltipStats: TooltipStatLabels;
  playerStats: PlayerStatsStrings;
  seedProtocols: SeedProtocolsStrings;
  transitions: TransitionStrings;
  ui: UiStrings;
}
