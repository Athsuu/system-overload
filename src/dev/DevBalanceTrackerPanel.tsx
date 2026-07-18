import { useEffect, useState } from 'react';
import {
  BALANCE_TRACKER_EVENT,
  BALANCE_TRACKER_MAX_RUNS,
  copyBalanceTrackerLastRun,
  copyBalanceTrackerReport,
  downloadBalanceTrackerReport,
  getBalanceTrackerSessionShardTotal,
  getBalanceTrackerState,
  getLastRunsWithBuildDetail,
  isBalanceTrackerRecording,
  resetBalanceTrackerLog,
  startBalanceTrackerRecording,
  stopBalanceTrackerRecording,
  type BalanceTrackerState,
} from './balanceTracker';
import { DevButton, DevConfirmButton } from './DevButton';
import { DevCopyButton, DevPanel, DevSection } from './devUi';
import { DEV_HINT_CLASS } from './devUi/devStyles';

export function DevBalanceTrackerPanel() {
  const [tracker, setTracker] = useState<BalanceTrackerState>(() => getBalanceTrackerState());
  const [recording, setRecording] = useState(() => isBalanceTrackerRecording());

  const refresh = () => {
    setTracker(getBalanceTrackerState());
    setRecording(isBalanceTrackerRecording());
  };

  useEffect(() => {
    const onChange = () => refresh();
    window.addEventListener(BALANCE_TRACKER_EVENT, onChange);
    refresh();
    return () => window.removeEventListener(BALANCE_TRACKER_EVENT, onChange);
  }, []);

  const sessionShards = getBalanceTrackerSessionShardTotal();
  const previewLines = getLastRunsWithBuildDetail(tracker, 3);

  const toggleRecording = () => {
    if (recording) {
      stopBalanceTrackerRecording();
    } else {
      startBalanceTrackerRecording();
    }
    refresh();
  };

  return (
    <DevSection
      title="Suivi équilibrage"
      description="Start/Stop : enregistre automatiquement chaque fin de run (shards, modules, surcharge passive vs hit)."
    >
      <DevPanel title="Session">
        <p className="mt-1 text-[13px] text-amber-200/90">
          Enregistrement :{' '}
          <span className={recording ? 'text-emerald-300' : 'text-white/50'}>
            {recording ? 'ON' : 'OFF'}
          </span>
          {' · '}
          {tracker.runs.length} run(s) · {sessionShards} shards (session)
        </p>
        <div className="mt-2 space-y-2">
          <DevButton onClick={toggleRecording} variant={recording ? 'danger' : 'primary'}>
            {recording ? 'Arrêter enregistrement' : 'Démarrer enregistrement'}
          </DevButton>
          <div className="flex flex-wrap gap-1.5">
            <DevCopyButton
              label="Copier dernière run"
              disabled={tracker.runs.length === 0}
              onCopy={() => copyBalanceTrackerLastRun()}
            />
            <DevCopyButton
              label="Copier tout le rapport"
              onCopy={() => copyBalanceTrackerReport()}
            />
            <DevButton onClick={() => downloadBalanceTrackerReport()}>Télécharger .md</DevButton>
            <DevConfirmButton
              onConfirm={() => {
                resetBalanceTrackerLog();
                refresh();
              }}
            >
              Vider journal
            </DevConfirmButton>
          </div>
        </div>
      </DevPanel>

      {previewLines.length > 0 && (
        <DevPanel title="Aperçu (3 dernières runs)">
          <ul className="mt-1 space-y-1 text-[12px] text-white/55">
            {previewLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <div className="mt-2">
            <DevCopyButton
              label={`Copier la run #${tracker.runs.length} (dernière)`}
              disabled={tracker.runs.length === 0}
              onCopy={() => copyBalanceTrackerLastRun()}
            />
          </div>
        </DevPanel>
      )}

      <p className={DEV_HINT_CLASS}>
        Journal persisté en local (survit au refresh). Plafond {BALANCE_TRACKER_MAX_RUNS} runs /
        session. Surcharge = apports bruts passive vs hit.
      </p>
    </DevSection>
  );
}
