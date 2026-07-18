import { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { copyBalanceSnapshotToClipboard } from './balanceSnapshot';
import {
  DEV_AUTOPLAY_EVENT,
  dismissDevAutoplaySnapshotPrompt,
  formatDevAutoplayTelemetry,
  getDevAutoplaySnapshot,
  type DevAutoplaySnapshot,
} from './devAutoplay';
import { DEV_AUTOPLAY_SKILL_PROFILES, type DevAutoplaySkillId } from './devAutoplayProfiles';
import { devStartAutoplayRun, devStopAutoplayRun } from './devAutoplayActions';
import { isDevInRun } from './devAutoplayRunState';
import { DevButton } from './DevButton';
import {
  DevCopyButton,
  DevPanel,
  DevSection,
  DEV_SNAPSHOT_COPY_HINT,
  DEV_SNAPSHOT_COPY_LABEL,
} from './devUi';
import { DEV_HINT_CLASS, DEV_SELECT_CLASS } from './devUi/devStyles';
import {
  ROBOT_SESSION_EVENT,
  applyRobotSessionToGame,
  getRobotSession,
  listUnlockedRobotCycles,
  setRobotCycle,
  setRobotSkillId,
  type RobotSessionSnapshot,
} from './robotSession';

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function DevPlaytestTab() {
  const gameState = useGameStore((state) => state.gameState);
  const highestCycleUnlocked = useGameStore((state) => state.highestCycleUnlocked);
  const [snapshot, setSnapshot] = useState<DevAutoplaySnapshot>(() => getDevAutoplaySnapshot());
  const [session, setSession] = useState<RobotSessionSnapshot>(() => getRobotSession());
  const [launching, setLaunching] = useState(false);

  const unlockedCycles = listUnlockedRobotCycles();

  useEffect(() => {
    const refreshAutoplay = () => setSnapshot(getDevAutoplaySnapshot());
    const refreshSession = () => setSession(getRobotSession());
    window.addEventListener(DEV_AUTOPLAY_EVENT, refreshAutoplay);
    window.addEventListener(ROBOT_SESSION_EVENT, refreshSession);
    refreshAutoplay();
    refreshSession();
    return () => {
      window.removeEventListener(DEV_AUTOPLAY_EVENT, refreshAutoplay);
      window.removeEventListener(ROBOT_SESSION_EVENT, refreshSession);
    };
  }, []);

  useEffect(() => {
    setSession(getRobotSession());
  }, [highestCycleUnlocked]);

  useEffect(() => {
    if (!snapshot.active) return;
    const id = window.setInterval(() => setSnapshot(getDevAutoplaySnapshot()), 500);
    return () => window.clearInterval(id);
  }, [snapshot.active]);

  const handleStart = async () => {
    setLaunching(true);
    try {
      await devStartAutoplayRun();
    } finally {
      setLaunching(false);
      setSnapshot(getDevAutoplaySnapshot());
      setSession(getRobotSession());
    }
  };

  const handleStop = () => {
    devStopAutoplayRun();
    setSnapshot(getDevAutoplaySnapshot());
  };

  const handleCopySnapshot = async () => {
    const ok = await copyBalanceSnapshotToClipboard();
    if (ok) {
      dismissDevAutoplaySnapshotPrompt();
      setSnapshot(getDevAutoplaySnapshot());
    }
    return ok;
  };

  const inRun = isDevInRun(gameState);
  const robotBusy = snapshot.active || snapshot.pendingStart;
  const isStuck = robotBusy && !inRun && gameState !== 'RUN_END';
  const skillProfile = DEV_AUTOPLAY_SKILL_PROFILES[session.skillId];

  return (
    <div className="space-y-4">
      <DevSection
        title="Session robot"
        description="Joue avec ton build actuel. Cycle = ceux que tu as déjà débloqués."
      >
        <DevPanel title="Paramètres">
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-[11px] text-white/45">
              Cycle
              <select
                className={DEV_SELECT_CLASS}
                value={session.cycle}
                disabled={robotBusy}
                onChange={(event) => setRobotCycle(Number(event.target.value))}
              >
                {unlockedCycles.map((cycle) => (
                  <option key={cycle} value={cycle}>
                    {cycle}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-white/45">
              Skill
              <select
                className={DEV_SELECT_CLASS}
                value={session.skillId}
                disabled={robotBusy}
                onChange={(event) =>
                  setRobotSkillId(event.target.value as DevAutoplaySkillId)
                }
              >
                {(Object.keys(DEV_AUTOPLAY_SKILL_PROFILES) as DevAutoplaySkillId[]).map((id) => (
                  <option key={id} value={id}>
                    {DEV_AUTOPLAY_SKILL_PROFILES[id].label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="mt-2 text-[12px] text-white/40">
            Ton build · {skillProfile.label} · Cycle {session.cycle} (max débloqué{' '}
            {highestCycleUnlocked})
          </p>
          <div className="mt-2">
            <DevButton onClick={() => applyRobotSessionToGame()} disabled={robotBusy}>
              Appliquer cycle / skill (sans lancer)
            </DevButton>
          </div>
        </DevPanel>
      </DevSection>

      <DevSection
        title="Robot playtest"
        description="Utility AI. Au lancement : garde ton build, applique cycle + skill."
      >
        <DevPanel title="Statut">
          <p className="mt-1 text-[13px] text-amber-200/90">{snapshot.statusLine}</p>
          {isStuck && (
            <p className="mt-1 text-[12px] text-red-300/90">
              État bloqué (hors run). Clique Arrêter ou Ctrl+Shift+X.
            </p>
          )}
          {robotBusy && inRun && (
            <p className="mt-1 text-[12px] text-white/40">
              Cycle {session.cycle} · retargets {snapshot.retargetCount} · cov.{' '}
              {(snapshot.estimatedCoverage * 100).toFixed(0)}% · moy.{' '}
              {snapshot.avgEnemiesInRadius.toFixed(1)} ennemis/rayon
            </p>
          )}
        </DevPanel>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {!robotBusy ? (
            <DevButton onClick={() => void handleStart()} disabled={launching}>
              {launching ? 'Lancement…' : 'Lancer robot'}
            </DevButton>
          ) : (
            <DevButton onClick={handleStop} variant="danger">
              Arrêter robot
            </DevButton>
          )}
        </div>
      </DevSection>

      {snapshot.awaitingSnapshot && (
        <DevPanel>
          <p className="text-[13px] text-cyan-100/90">{DEV_SNAPSHOT_COPY_HINT}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <DevCopyButton label={DEV_SNAPSHOT_COPY_LABEL} onCopy={handleCopySnapshot} />
            <DevCopyButton
              label="Copier télémétrie robot"
              onCopy={() => copyTextToClipboard(formatDevAutoplayTelemetry())}
            />
          </div>
        </DevPanel>
      )}

      <p className={DEV_HINT_CLASS}>
        Arrêt d&apos;urgence : Ctrl+Shift+X. Le robot ne change plus tes modules.
      </p>
    </div>
  );
}
