import type { GameState, RunPhase } from '../store/useGameStore';
import type { CoreProtocolLevels } from '../store/prestigeTypes';
import type { UpgradeLevels } from '../store/upgradeCatalog';
import { getGameStrings } from '../i18n';
import type { TutorialSignals } from './tutorialSignals';

export type TutorialGroupId = 'menu_intro' | 'run_intro';

export type TutorialStepId =
  | 'signal_handshake'
  | 'welcome'
  | 'node0_role'
  | 'mission_loop'
  | 'module_tree_intro'
  | 'purge_zone'
  | 'overload'
  | 'run_shards'
  | 'overclock'
  | 'module_tree'
  | 'vault'
  | 'prestige'
  | 'flux_drive';

export type TutorialAnchor =
  | 'featured-center'
  | 'featured-module-tree'
  | 'start-run'
  | 'purge-zone'
  | 'overload-bar'
  | 'run-shards'
  | 'hex-shards'
  | 'overclock'
  | 'module-tree'
  | 'vault-shards'
  | 'flux-drive';

export type TutorialDisplay = 'featured' | 'anchored' | 'spotlight';

export type TutorialStoryBeat =
  | 'hook'
  | 'identity'
  | 'mission'
  | 'growth'
  | 'action'
  | 'stakes'
  | 'reward'
  | 'risk'
  | 'legacy'
  | 'revelation'
  | 'mastery';

export interface TutorialSnapshot {
  gameState: GameState;
  breachProgress: number;
  runShards: number;
  bankShards: number;
  upgrades: UpgradeLevels;
  coreProtocols: CoreProtocolLevels;
  prestigeUnlocked: boolean;
  runKills: number;
  runPhase: RunPhase;
  runOutcome: 'victory_boss' | 'defeat_breach' | null;
  selectedCycle: number;
  activeCycle: number;
  signals: TutorialSignals;
  dismissedIds: ReadonlySet<string>;
}

/** Hub uses selected cycle; in-run uses the active run cycle. */
export function getSnapshotCycle(snapshot: TutorialSnapshot): number {
  return snapshot.gameState === 'PLAYING' ? snapshot.activeCycle : snapshot.selectedCycle;
}

export interface TutorialStep {
  id: TutorialStepId;
  order: number;
  groupId?: TutorialGroupId;
  storyBeat: TutorialStoryBeat;
  display: TutorialDisplay;
  screens: GameState[];
  anchor: TutorialAnchor;
  speaker: 'arch';
  label: string;
  title: string;
  body: string;
  footnote?: string;
  glitchIntensity?: 'normal' | 'heavy';
  bodyGlitchChance?: number;
  titleGlitchChance?: number;
  unlockWhen: (snapshot: TutorialSnapshot) => boolean;
  completeWhen: (snapshot: TutorialSnapshot) => boolean;
}

const SKIP_ONLY = () => false;

export function buildTutorialSteps(): TutorialStep[] {
  const strings = getGameStrings();
  const T = strings.tutorial;
  const steps = strings.tutorialSteps;
  const ARCH_LABEL = strings.arch.channelLabel;

  return [
    {
      id: 'signal_handshake',
      order: 0,
      groupId: 'menu_intro',
      storyBeat: 'hook',
      display: 'featured',
      screens: ['MENU'],
      anchor: 'featured-center',
      speaker: 'arch',
      label: strings.arch.signalBufferLabel,
      title: steps.signalHandshakeTitle,
      body: T.signalHandshake,
      glitchIntensity: 'heavy',
      bodyGlitchChance: 0,
      titleGlitchChance: 0.08,
      unlockWhen: () => true,
      completeWhen: SKIP_ONLY,
    },
    {
      id: 'welcome',
      order: 1,
      groupId: 'menu_intro',
      storyBeat: 'hook',
      display: 'featured',
      screens: ['MENU'],
      anchor: 'featured-center',
      speaker: 'arch',
      label: ARCH_LABEL,
      title: strings.arch.name,
      body: `${T.archIntro} ${T.welcomeContext}`,
      unlockWhen: (s) => s.dismissedIds.has('signal_handshake'),
      completeWhen: SKIP_ONLY,
    },
    {
      id: 'node0_role',
      order: 2,
      groupId: 'menu_intro',
      storyBeat: 'identity',
      display: 'featured',
      screens: ['MENU'],
      anchor: 'featured-center',
      speaker: 'arch',
      label: ARCH_LABEL,
      title: steps.node0RoleTitle,
      body: T.node0Role,
      unlockWhen: (s) => s.dismissedIds.has('welcome'),
      completeWhen: SKIP_ONLY,
    },
    {
      id: 'mission_loop',
      order: 3,
      groupId: 'menu_intro',
      storyBeat: 'mission',
      display: 'spotlight',
      screens: ['MENU'],
      anchor: 'start-run',
      speaker: 'arch',
      label: ARCH_LABEL,
      title: steps.missionLoopTitle,
      body: T.missionLoop,
      unlockWhen: (s) => s.dismissedIds.has('node0_role'),
      completeWhen: SKIP_ONLY,
    },
    {
      id: 'module_tree_intro',
      order: 4,
      groupId: 'menu_intro',
      storyBeat: 'growth',
      display: 'spotlight',
      screens: ['MENU'],
      anchor: 'module-tree',
      speaker: 'arch',
      label: ARCH_LABEL,
      title: steps.moduleTreeTitle,
      body: T.moduleTreeIntro,
      unlockWhen: (s) => s.dismissedIds.has('mission_loop'),
      completeWhen: (s) => s.signals.moduleNodeSelected,
    },
    {
      id: 'purge_zone',
      order: 5,
      groupId: 'run_intro',
      storyBeat: 'action',
      display: 'anchored',
      screens: ['PLAYING'],
      anchor: 'featured-center',
      speaker: 'arch',
      label: ARCH_LABEL,
      title: steps.purgeZoneTitle,
      body: T.purgeAction,
      unlockWhen: (s) => s.signals.runsStarted >= 1,
      completeWhen: SKIP_ONLY,
    },
    {
      id: 'overload',
      order: 6,
      groupId: 'run_intro',
      storyBeat: 'stakes',
      display: 'spotlight',
      screens: ['PLAYING'],
      anchor: 'overload-bar',
      speaker: 'arch',
      label: ARCH_LABEL,
      title: strings.hud.overloadLabel,
      body: `${T.overloadStakes} ${T.overloadGoal}`,
      unlockWhen: (s) => s.signals.runsStarted >= 1,
      completeWhen: SKIP_ONLY,
    },
    {
      id: 'run_shards',
      order: 7,
      groupId: 'run_intro',
      storyBeat: 'reward',
      display: 'spotlight',
      screens: ['PLAYING'],
      anchor: 'run-shards',
      speaker: 'arch',
      label: ARCH_LABEL,
      title: strings.currency.runShardsLabel,
      body: T.hexShardsUnified,
      unlockWhen: (s) => s.signals.runsStarted >= 1,
      completeWhen: SKIP_ONLY,
    },
    {
      id: 'overclock',
      order: 8,
      storyBeat: 'risk',
      display: 'spotlight',
      screens: ['PLAYING'],
      anchor: 'overclock',
      speaker: 'arch',
      label: ARCH_LABEL,
      title: steps.overclockTitle,
      body: T.overclockRisk,
      unlockWhen: (s) => s.coreProtocols.overclock >= 1,
      completeWhen: SKIP_ONLY,
    },
    {
      id: 'module_tree',
      order: 9,
      storyBeat: 'growth',
      display: 'anchored',
      screens: ['UPGRADING'],
      anchor: 'module-tree',
      speaker: 'arch',
      label: ARCH_LABEL,
      title: strings.hub.upgradesTitle,
      body: T.moduleTreeLore,
      unlockWhen: (s) => s.gameState === 'UPGRADING',
      completeWhen: (s) => s.signals.upgradePurchased,
    },
    {
      id: 'prestige',
      order: 10,
      storyBeat: 'revelation',
      display: 'featured',
      screens: ['RUN_END', 'MENU'],
      anchor: 'featured-center',
      speaker: 'arch',
      label: ARCH_LABEL,
      title: steps.breachContainedTitle,
      body: T.prestigeReveal,
      unlockWhen: (s) => s.prestigeUnlocked,
      completeWhen: (s) => s.gameState === 'UPGRADING' || s.gameState === 'PLAYING',
    },
    {
      id: 'flux_drive',
      order: 11,
      storyBeat: 'mastery',
      display: 'anchored',
      screens: ['PLAYING', 'MENU'],
      anchor: 'flux-drive',
      speaker: 'arch',
      label: ARCH_LABEL,
      title: strings.hud.fluxDriveLabel,
      body: T.fluxDriveLore,
      unlockWhen: (s) => s.coreProtocols.fluxDrive >= 1 && getSnapshotCycle(s) === 1,
      completeWhen: (s) => s.signals.fluxDriveToggled,
    },
  ];
}

export function getTutorialSteps(): TutorialStep[] {
  return buildTutorialSteps();
}

export function getTutorialStep(stepId: TutorialStepId): TutorialStep | undefined {
  return getTutorialSteps().find((step) => step.id === stepId);
}

export function getTutorialGroupSteps(groupId: TutorialGroupId): TutorialStep[] {
  return getTutorialSteps()
    .filter((step) => step.groupId === groupId)
    .sort((a, b) => a.order - b.order);
}

function isPriorStepBlocking(
  prior: TutorialStep,
  step: TutorialStep,
  snapshot: TutorialSnapshot,
): boolean {
  if (snapshot.dismissedIds.has(prior.id)) return false;
  if (prior.order >= step.order) return false;
  if (step.groupId && prior.groupId === step.groupId) return false;
  return true;
}

export function getActiveTutorialStep(snapshot: TutorialSnapshot): TutorialStep | null {
  const sorted = [...getTutorialSteps()].sort((a, b) => a.order - b.order);

  for (const step of sorted) {
    if (snapshot.dismissedIds.has(step.id)) continue;

    const priorIncomplete = sorted.some((prior) => isPriorStepBlocking(prior, step, snapshot));
    if (priorIncomplete) continue;

    if (!step.screens.includes(snapshot.gameState)) continue;
    if (!step.unlockWhen(snapshot)) continue;

    return step;
  }

  return null;
}
