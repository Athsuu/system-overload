import { PLAYTEST_MELTDOWN_ANCHORS } from './playtestAnchors';
import { defaultSimParams, estimateRunTimelineSec, simulateRun } from './simulateRun';
import { getRunConfig } from '../../game/runConfig';
import type { CalibrationResult, PlaytestMeltdownAnchor, SimOutcome } from './types';

function anchorError(outcome: SimOutcome, anchor: PlaytestMeltdownAnchor): number {
  const waveDiff = outcome.waveIndex - anchor.waveIndex;
  const progressDiff = outcome.waveProgress - anchor.waveProgress;
  return waveDiff * waveDiff + progressDiff * progressDiff * 4;
}

function scoreCandidate(
  purgeCoverage: number,
  waveDurationMult: number,
  leakFactor: number,
  speedLeakStress: number,
  anchors: PlaytestMeltdownAnchor[],
): CalibrationResult {
  const outcomes = anchors.map((anchor) => {
    const outcome = simulateRun(
      defaultSimParams({
        upgrades: anchor.upgrades,
        timeScale: anchor.timeScale,
        purgeCoverage,
        waveDurationMult,
        leakFactor,
        speedLeakStress,
      }),
    );
    return {
      anchorId: anchor.id,
      outcome,
      error: anchorError(outcome, anchor),
    };
  });

  return {
    purgeCoverage,
    waveDurationMult,
    leakFactor,
    speedLeakStress,
    errorScore: outcomes.reduce((sum, entry) => sum + entry.error, 0),
    outcomes,
  };
}

export function scoreAgainstAnchors(
  purgeCoverage: number,
  waveDurationMult: number,
  anchors: PlaytestMeltdownAnchor[] = PLAYTEST_MELTDOWN_ANCHORS,
  speedLeakStress = 1.12,
): CalibrationResult {
  return scoreCandidate(purgeCoverage, waveDurationMult, 0.08, speedLeakStress, anchors);
}

export function calibrateFromPlaytest(
  anchors: PlaytestMeltdownAnchor[] = PLAYTEST_MELTDOWN_ANCHORS,
): CalibrationResult {
  const reference = anchors[0];
  const passivePerSec = getRunConfig(reference.upgrades).passiveHeatPerSec;
  const meltdownSec = passivePerSec > 0 ? 100 / passivePerSec : 71;
  const baseTimeline = estimateRunTimelineSec(reference.upgrades, 0.62, 1, reference.waveIndex);
  const seededMult = baseTimeline > 0 ? meltdownSec / baseTimeline : 1.38;

  let best = scoreCandidate(0.62, seededMult, 0.05, 1.12, anchors);

  for (let coverage = 0.5; coverage <= 0.8; coverage += 0.05) {
    for (let waveMult = seededMult * 0.85; waveMult <= seededMult * 1.15; waveMult += 0.02) {
      for (const leakFactor of [0, 0.04, 0.08, 0.12]) {
        for (const speedLeakStress of [1.05, 1.1, 1.12, 1.18, 1.25]) {
          const scored = scoreCandidate(coverage, waveMult, leakFactor, speedLeakStress, anchors);
          if (scored.errorScore < best.errorScore) {
            best = scored;
          }
        }
      }
    }
  }

  return best;
}

export function formatOutcomeShort(outcome: SimOutcome): string {
  const waveLabel =
    outcome.waveProgress >= 0.99
      ? `fin manche ${outcome.waveIndex}`
      : outcome.waveProgress <= 0.05
        ? `début manche ${outcome.waveIndex}`
        : `manche ${outcome.waveIndex} (${Math.round(outcome.waveProgress * 100)}%)`;

  const resultLabel =
    outcome.result === 'victory' ? 'Victoire' : outcome.result === 'timeout' ? 'Timeout' : 'Meltdown';

  return `${resultLabel} · ${waveLabel} · ${outcome.gameTimeSec.toFixed(0)}s jeu · breach ${outcome.breach.toFixed(0)}%`;
}
