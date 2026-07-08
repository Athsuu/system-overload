import type { BranchId } from '../store/skillTree';
import type { UpgradeId } from '../store/upgradeCatalog';

export type GameLocale = 'en' | 'fr';
export type LanguageMode = 'auto' | GameLocale;

export interface UpgradeText {
  name: string;
  description: string;
}

export interface TooltipStatLabels {
  purgeHitDamage: string;
  purgeDamageBonus: string;
  attackSpeed: string;
  purgeInterval: string;
  passiveBreachPerSec: string;
  reduction: string;
  impactBreachTier0: string;
  breachReliefPerKill: string;
  tier1Kill: string;
  meltdownThreshold: string;
  purgeRadius: string;
  radiusBonus: string;
  simulationSpeed: string;
  simulationSpeedToggle: string;
  bonusShardsPerKill: string;
  shardsPerKillTier0: string;
  shardMultiplier: string;
  bonus: string;
  wave1ExtraEnemies: string;
  spawnInterval: string;
  slowerSpawns: string;
  maxAliveReduction: string;
  exampleCapWave1: string;
  max: string;
  overclockDuration: string;
  overclockCooldown: string;
}

export interface TutorialStepText {
  signalHandshakeTitle: string;
  node0RoleTitle: string;
  missionLoopTitle: string;
  skillTreeTitle: string;
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
  purgeZone: string;
  mouse: string;
  bossIncoming: string;
  boss: string;
  wave: string;
  waveClear: string;
  overclock: string;
  levelFormat: string;
  previous: string;
  next: string;
  gotIt: string;
  skillTree: string;
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
    victoryArch: string;
    meltdownTitle: string;
    meltdownSubtitle: string;
    meltdownArchVariants: readonly [string, string, string];
    prestigeUnlocked: string;
    prestigeArch: string;
    anchorFragmentsEarned: string;
    firstAnchorArch: string;
  };
  hub: {
    upgradesTitle: string;
    upgradesSubtitle: string;
  };
  skillTree: {
    placeholderTitle: string;
    placeholderBody: string;
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
    shardsEarnedSuffix: string;
    anchorEarnedSuffix: string;
    transferredToVault: string;
    shardsLoreTooltip: string;
    anchorLoreTooltip: string;
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
    statWave: string;
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
    skillTreeIntro: string;
    purgeAction: string;
    overloadStakes: string;
    overloadGoal: string;
    shardsWhy: string;
    shardsLoop: string;
    hexShardsUnified: string;
    overclockRisk: string;
    skillTreeLore: string;
    vaultLore: string;
    prestigeReveal: string;
    fluxDriveLore: string;
    breachVentHint: string;
    bossHint: string;
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
  ui: UiStrings;
}
