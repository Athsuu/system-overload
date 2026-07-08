import { ARENA_PADDING } from '../../game/constants';
import {
  getEnemyMaxHp,
  getKillBreachRelief,
  getLeakProgressPenalty,
  getRunConfig,
  getSpawnIntervalMs,
} from '../../game/runConfig';
import { getWaveDefinition } from '../../game/waveConfig';
import type { SimOutcome, SimParams, SimWaveSnapshot } from './types';

const LEAK_BURST_MULT = 1.5;

function estimateWaveActiveSec(
  waveIndex: number,
  config: ReturnType<typeof getRunConfig>,
  params: SimParams,
): number {
  const waveDef = getWaveDefinition(waveIndex);
  if (!waveDef) return 12;

  const group = waveDef.spawns[0];
  if (!group) return 12;

  const count = waveIndex === 1 ? group.count + config.starterNodes : group.count;
  const spawnSpanSec = (Math.max(0, count - 1) * getSpawnIntervalMs(group.intervalMs, config)) / 1000;
  const hp = getEnemyMaxHp(config, waveIndex, waveDef.isBoss ?? false);
  const purgeDps = config.purgeHitDamage > 0 ? config.purgeHitDamage / (config.purgeIntervalMs / 1000) : 0;
  const killSec =
    purgeDps > 0
      ? (hp * count) / (purgeDps * Math.max(0.05, params.purgeCoverage))
      : count * 6;
  const travelSec = params.avgFlowDistancePx / Math.max(40, config.baseEnemySpeed);

  return (spawnSpanSec + killSec + travelSec * 0.35) * params.waveDurationMult;
}

function estimateLeaksForWave(
  waveIndex: number,
  config: ReturnType<typeof getRunConfig>,
  params: SimParams,
): number {
  const waveDef = getWaveDefinition(waveIndex);
  if (!waveDef) return 0;

  const group = waveDef.spawns[0];
  if (!group) return 0;

  const count = waveIndex === 1 ? group.count + config.starterNodes : group.count;
  const missRate = Math.max(0, 1 - params.purgeCoverage);
  return missRate * missRate * count * params.leakFactor;
}

function applyLeaks(
  breach: number,
  config: ReturnType<typeof getRunConfig>,
  waveIndex: number,
  leakCount: number,
  leakStress: number,
): { breach: number; added: number } {
  if (leakCount <= 0) return { breach, added: 0 };

  let added = 0;
  let next = breach;
  for (let index = 0; index < leakCount; index += 1) {
    let penalty = getLeakProgressPenalty(config, waveIndex) * leakStress;
    if (index >= 1) penalty *= LEAK_BURST_MULT;
    next += penalty;
    added += penalty;
  }
  return { breach: next, added };
}

export function estimateRunTimelineSec(
  upgrades: SimParams['upgrades'],
  purgeCoverage: number,
  waveDurationMult: number,
  throughWave: number,
): number {
  const config = getRunConfig(upgrades);
  const params = defaultSimParams({ upgrades, purgeCoverage, waveDurationMult });
  let total = 0;

  for (let waveIndex = 1; waveIndex <= throughWave; waveIndex += 1) {
    total += estimateWaveActiveSec(waveIndex, config, params);
    const waveDef = getWaveDefinition(waveIndex);
    if (waveDef && !waveDef.isBoss && waveIndex < throughWave) {
      total += waveDef.interWaveMs / 1000;
    }
  }

  return total;
}

export function simulateRun(params: SimParams): SimOutcome {
  const config = getRunConfig(params.upgrades);
  const timeScale = Math.max(0.1, params.timeScale);
  const leakStress = timeScale > 1 ? params.speedLeakStress : 1;
  const passivePerSec = config.passiveHeatPerSec;

  let breach = 0;
  let breachFromPassive = 0;
  let breachFromLeaks = 0;
  let breachReliefFromKills = 0;
  let gameTimeSec = 0;
  let totalKills = 0;
  let totalLeaks = 0;
  const waves: SimWaveSnapshot[] = [];

  for (let waveIndex = 1; waveIndex <= 11; waveIndex += 1) {
    const waveDef = getWaveDefinition(waveIndex);
    if (!waveDef) break;

    const group = waveDef.spawns[0];
    const count = group
      ? waveIndex === 1
        ? group.count + config.starterNodes
        : group.count
      : 0;

    const waveStart = gameTimeSec;
    const breachStart = breach;
    const activeSec = estimateWaveActiveSec(waveIndex, config, params);
    const stepSec = 0.25;
    const steps = Math.max(1, Math.ceil(activeSec / stepSec));
    let waveProgress = 0;
    let waveKills = 0;
    let waveLeaks = 0;

    for (let step = 0; step < steps; step += 1) {
      const deltaSec = activeSec / steps;
      const passiveDelta = passivePerSec * deltaSec;
      breach += passiveDelta;
      breachFromPassive += passiveDelta;
      gameTimeSec += deltaSec;
      waveProgress = (step + 1) / steps;

      if (breach >= 100) {
        waves.push({
          waveIndex,
          startTimeSec: waveStart,
          endTimeSec: gameTimeSec,
          kills: Math.floor(waveKills),
          leaks: Math.floor(waveLeaks),
          breachStart,
          breachEnd: breach,
        });
        return {
          result: 'meltdown',
          waveIndex,
          waveProgress,
          gameTimeSec,
          breach,
          totalKills,
          totalLeaks,
          breachFromPassive,
          breachFromLeaks,
          breachReliefFromKills,
          waves,
        };
      }
    }

    const leakEstimate = estimateLeaksForWave(waveIndex, config, params);
    const leakResult = applyLeaks(breach, config, waveIndex, leakEstimate, leakStress);
    breach = leakResult.breach;
    breachFromLeaks += leakResult.added;
    totalLeaks += leakEstimate;
    waveLeaks += leakEstimate;

    const kills = Math.max(0, count - leakEstimate);
    totalKills += kills;
    waveKills += kills;
    for (let killIndex = 0; killIndex < kills; killIndex += 1) {
      const relief = getKillBreachRelief(params.upgrades, waveIndex);
      if (relief > 0) {
        breach = Math.max(0, breach - relief);
        breachReliefFromKills += relief;
      }
    }

    waves.push({
      waveIndex,
      startTimeSec: waveStart,
      endTimeSec: gameTimeSec,
      kills: Math.floor(waveKills),
      leaks: Math.floor(waveLeaks),
      breachStart,
      breachEnd: breach,
    });

    if (breach >= 100) {
      return {
        result: 'meltdown',
        waveIndex,
        waveProgress: 1,
        gameTimeSec,
        breach,
        totalKills,
        totalLeaks,
        breachFromPassive,
        breachFromLeaks,
        breachReliefFromKills,
        waves,
      };
    }

    if (waveDef.isBoss) {
      return {
        result: 'victory',
        waveIndex,
        waveProgress: 1,
        gameTimeSec,
        breach,
        totalKills,
        totalLeaks,
        breachFromPassive,
        breachFromLeaks,
        breachReliefFromKills,
        waves,
      };
    }

    const intermissionSec = waveDef.interWaveMs / 1000;
    if (intermissionSec > 0) {
      const passiveDelta = passivePerSec * intermissionSec;
      breach += passiveDelta;
      breachFromPassive += passiveDelta;
      gameTimeSec += intermissionSec;

      if (breach >= 100) {
        return {
          result: 'meltdown',
          waveIndex: waveIndex + 1,
          waveProgress: 0,
          gameTimeSec,
          breach,
          totalKills,
          totalLeaks,
          breachFromPassive,
          breachFromLeaks,
          breachReliefFromKills,
          waves,
        };
      }
    }
  }

  return {
    result: 'timeout',
    waveIndex: 11,
    waveProgress: 1,
    gameTimeSec,
    breach,
    totalKills,
    totalLeaks,
    breachFromPassive,
    breachFromLeaks,
    breachReliefFromKills,
    waves,
  };
}

export function defaultSimParams(
  overrides: Partial<SimParams> & Pick<SimParams, 'upgrades'>,
): SimParams {
  const arenaWidth = overrides.arenaWidth ?? 1920;
  const arenaHeight = overrides.arenaHeight ?? 1080;
  const innerW = arenaWidth - ARENA_PADDING * 2;
  const innerH = arenaHeight - ARENA_PADDING * 2;

  return {
    timeScale: 1,
    arenaWidth,
    arenaHeight,
    purgeCoverage: 0.62,
    avgFlowDistancePx: Math.hypot(innerW * 0.62, innerH * 0.62),
    speedLeakStress: 1.12,
    waveDurationMult: 1.38,
    leakFactor: 0.08,
    ...overrides,
  };
}
