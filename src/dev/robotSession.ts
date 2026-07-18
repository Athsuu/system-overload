/**
 * Session robot : Skill + Cycle (modules = ton build actuel, sans set auto).
 */
import { saveGame } from '../store/persistence';
import { clampCycleIndex } from '../store/cycleTypes';
import { useGameStore } from '../store/useGameStore';
import { setDevAutoplaySkillId } from './devAutoplay';
import type { DevAutoplaySkillId } from './devAutoplayProfiles';

export const ROBOT_SESSION_EVENT = 'dev-robot-session-change';

export interface RobotSessionSnapshot {
  skillId: DevAutoplaySkillId;
  cycle: number;
}

const session: RobotSessionSnapshot = {
  skillId: 'medium',
  cycle: 1,
};

function notify(): void {
  window.dispatchEvent(new CustomEvent(ROBOT_SESSION_EVENT));
}

function persistStoreSlice(): void {
  const state = useGameStore.getState();
  saveGame({
    bankShards: state.bankShards,
    bankAnchorFragments: state.bankAnchorFragments,
    upgrades: state.upgrades,
    seedFragments: state.seedFragments,
    recompileDepth: state.recompileDepth,
    coreProtocols: state.coreProtocols,
    prestigeUnlocked: state.prestigeUnlocked,
    prestigeLevel: state.prestigeLevel,
    highestCycleUnlocked: state.highestCycleUnlocked,
    selectedCycle: state.selectedCycle,
    cyclesCleared: state.cyclesCleared,
    cyclesSinceLastAnchor: state.cyclesSinceLastAnchor,
    anchoredNodes: state.anchoredNodes,
    bestKillsByCycle: state.bestKillsByCycle,
  });
}

function clampToUnlocked(cycle: number, highestCycleUnlocked: number): number {
  return Math.min(clampCycleIndex(cycle), Math.max(1, highestCycleUnlocked));
}

export function getRobotSession(): RobotSessionSnapshot {
  const { highestCycleUnlocked, selectedCycle } = useGameStore.getState();
  session.cycle = clampToUnlocked(session.cycle || selectedCycle, highestCycleUnlocked);
  return { ...session };
}

export function setRobotSkillId(skillId: DevAutoplaySkillId): void {
  session.skillId = skillId;
  setDevAutoplaySkillId(skillId);
  notify();
}

export function setRobotCycle(cycle: number): void {
  const { highestCycleUnlocked } = useGameStore.getState();
  session.cycle = clampToUnlocked(cycle, highestCycleUnlocked);
  notify();
}

/** Liste des cycles jouables = ceux déjà débloqués. */
export function listUnlockedRobotCycles(): number[] {
  const highest = Math.max(1, useGameStore.getState().highestCycleUnlocked);
  return Array.from({ length: highest }, (_, index) => index + 1);
}

/**
 * Applique skill + cycle débloqué.
 * Ne touche pas aux modules / ancrages / protocoles (ton build reste tel quel).
 */
export function applyRobotSessionToGame(): void {
  const state = useGameStore.getState();
  const cycle = clampToUnlocked(session.cycle, state.highestCycleUnlocked);
  session.cycle = cycle;

  useGameStore.setState({ selectedCycle: cycle });
  persistStoreSlice();
  setDevAutoplaySkillId(session.skillId);
  notify();
}
