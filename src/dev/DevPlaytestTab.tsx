import { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { copyBalanceSnapshotToClipboard } from './balanceSnapshot';
import {
  DEV_AUTOPLAY_EVENT,
  dismissDevAutoplaySnapshotPrompt,
  getDevAutoplaySnapshot,
  type DevAutoplaySnapshot,
} from './devAutoplay';
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
import { DEV_HINT_CLASS } from './devUi/devStyles';

export function DevPlaytestTab() {
  const gameState = useGameStore((state) => state.gameState);
  const selectedCycle = useGameStore((state) => state.selectedCycle);
  const [snapshot, setSnapshot] = useState<DevAutoplaySnapshot>(() => getDevAutoplaySnapshot());
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    const refresh = () => setSnapshot(getDevAutoplaySnapshot());
    window.addEventListener(DEV_AUTOPLAY_EVENT, refresh);
    refresh();
    return () => window.removeEventListener(DEV_AUTOPLAY_EVENT, refresh);
  }, []);

  const handleStart = async () => {
    setLaunching(true);
    try {
      await devStartAutoplayRun();
      setSnapshot(getDevAutoplaySnapshot());
    } finally {
      setLaunching(false);
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

  return (
    <div className="space-y-4">
      <DevSection
        title="Robot playtest"
        description="Lance une run où le robot déplace la zone de purge (~780 px/s, visée imparfaite)."
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
              Cycle {selectedCycle} · retargets {snapshot.retargetCount}
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
          <div className="mt-2">
            <DevCopyButton label={DEV_SNAPSHOT_COPY_LABEL} onCopy={handleCopySnapshot} />
          </div>
        </DevPanel>
      )}

      <p className={DEV_HINT_CLASS}>
        Arrêt d&apos;urgence : Ctrl+Shift+X. Pendant le robot, ta souris est ignorée sur l&apos;arène.
      </p>
    </div>
  );
}
