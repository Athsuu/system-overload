import { useMemo, useState } from 'react';
import { DEFAULT_UPGRADES, type UpgradeLevels } from '../store/upgradeCatalog';
import { useGameStore } from '../store/useGameStore';
import {
  PLAYTEST_FULL_MAX_UPGRADES,
  PLAYTEST_MELTDOWN_ANCHORS,
  calibrateFromPlaytest,
  defaultSimParams,
  formatOutcomeShort,
  simulateRun,
  type CalibrationResult,
  type SimOutcome,
} from './runSimulation';

function DevButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[15px] font-medium text-white/80 transition hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200"
    >
      {children}
    </button>
  );
}

function OutcomeBlock({ title, outcome }: { title: string; outcome: SimOutcome }) {
  return (
    <div className="rounded-lg border border-white/8 bg-black/30 px-2.5 py-2 text-[14px] text-white/70">
      <p className="mb-1 font-semibold text-amber-300/90">{title}</p>
      <p>{formatOutcomeShort(outcome)}</p>
      <p className="mt-1 text-white/45">
        Kills {outcome.totalKills} · Leaks {outcome.totalLeaks} · Passive{' '}
        {outcome.breachFromPassive.toFixed(0)}% · Leaks+ {outcome.breachFromLeaks.toFixed(0)}%
      </p>
    </div>
  );
}

export function DevRunSimPanel() {
  const storeUpgrades = useGameStore((state) => state.upgrades);
  const [preset, setPreset] = useState<'store' | 'fresh' | 'fullMax'>('fullMax');
  const [calibration, setCalibration] = useState<CalibrationResult | null>(null);
  const [lastRun, setLastRun] = useState<{ x1: SimOutcome; x2: SimOutcome } | null>(null);

  const upgrades: UpgradeLevels = useMemo(() => {
    if (preset === 'fresh') return DEFAULT_UPGRADES;
    if (preset === 'fullMax') return PLAYTEST_FULL_MAX_UPGRADES;
    return storeUpgrades;
  }, [preset, storeUpgrades]);

  const runWithCalibration = () => {
    const cal = calibration ?? calibrateFromPlaytest();
    if (!calibration) setCalibration(cal);

    const base = defaultSimParams({
      upgrades,
      purgeCoverage: cal.purgeCoverage,
      waveDurationMult: cal.waveDurationMult,
      leakFactor: cal.leakFactor,
      speedLeakStress: cal.speedLeakStress,
    });

    setLastRun({
      x1: simulateRun({ ...base, timeScale: 1 }),
      x2: simulateRun({ ...base, timeScale: 2 }),
    });
  };

  const runCalibrate = () => {
    const cal = calibrateFromPlaytest();
    setCalibration(cal);
    setLastRun(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-[14px] leading-relaxed text-white/40">
        Modèle rapide calibré sur tes repères playtest (breach passive + rythme des vagues).
      </p>

      <div className="flex flex-wrap gap-1.5">
        <DevButton onClick={() => setPreset('fullMax')}>
          Build playtest {preset === 'fullMax' ? '✓' : ''}
        </DevButton>
        <DevButton onClick={() => setPreset('fresh')}>
          Node-0 seul {preset === 'fresh' ? '✓' : ''}
        </DevButton>
        <DevButton onClick={() => setPreset('store')}>
          Build actuel {preset === 'store' ? '✓' : ''}
        </DevButton>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <DevButton onClick={runCalibrate}>Calibrer sur playtest</DevButton>
        <DevButton onClick={runWithCalibration}>Simuler ×1 et ×2</DevButton>
      </div>

      {calibration && (
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-2 font-mono text-[14px] text-cyan-100/80">
          <p className="mb-1 text-cyan-300/90">Calibration</p>
          <p>Coverage purge : {(calibration.purgeCoverage * 100).toFixed(0)}%</p>
          <p>Durée vague × : {calibration.waveDurationMult.toFixed(2)}</p>
          <p>Facteur leaks : {calibration.leakFactor.toFixed(2)}</p>
          <p>Erreur ancres : {calibration.errorScore.toFixed(3)}</p>
          <ul className="mt-2 space-y-1 text-white/55">
            {PLAYTEST_MELTDOWN_ANCHORS.map((anchor) => {
              const match = calibration.outcomes.find((entry) => entry.anchorId === anchor.id);
              if (!match) return null;
              return (
                <li key={anchor.id}>
                  <span className="text-white/35">{anchor.label} → </span>
                  {formatOutcomeShort(match.outcome)}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {lastRun && (
        <div className="space-y-2">
          <OutcomeBlock title="Simulation ×1" outcome={lastRun.x1} />
          <OutcomeBlock title="Simulation ×2" outcome={lastRun.x2} />
          <div className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-2 text-[14px] text-white/50">
            <p className="mb-1 font-semibold text-white/70">Repères playtest réels</p>
            <p>×1 → fin manche 5 (meltdown)</p>
            <p>×2 → début manche 5 (meltdown)</p>
          </div>
        </div>
      )}
    </div>
  );
}
