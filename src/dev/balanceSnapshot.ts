import {
  getBreachCap,
  getBreachPercent,
  getEffectivePassiveHeatPerSec,
  getEnemyMaxHp,
  getEnemySpeed,
  getHitHeatPenalty,
  getKillBreachRelief,
  getRunConfig,
  getExpectedShardReward,
} from '../game/runConfig';
import { formatRunElapsedMs, runElapsedMsRef } from '../game/runElapsed';
import { formatHexRadius } from '../game/purgeHexDisplay';
import { getCycleHeatMult, getCyclePressureMult } from '../game/cycleScaling';
import { BOSS_KILL_THRESHOLD } from '../game/horde';
import { getEnemyLevel } from '../game/enemyScaling';
import { CORE_PROTOCOL_CATALOG } from '../store/coreProtocolCatalog';
import { MODULE_TREE_NODES } from '../store/moduleTree';
import { getDevRunConfigOverrides } from './devRunConfigOverrides';
import {
  UPGRADE_CATALOG,
  getUpgradeLevel,
  isAnchorSuperchargeEligible,
  isModuleUnlocked,
  type UpgradeId,
} from '../store/upgradeCatalog';
import { useGameStore } from '../store/useGameStore';
import {
  formatKillsRecordLabel,
  getBestKillsEver,
  listBestKillsRecords,
} from '../store/killProgress';
import { formatDevAutoplayTelemetry, getDevAutoplaySnapshot } from './devAutoplay';
import { getUpgradeDisplayName } from './formatOwnedModules';

export interface BalanceSnapshot {
  generatedAt: string;
  gameVersion: string;
  gameState: string;
  progression: {
    bankShards: number;
    bankAnchorFragments: number;
    seedFragments: number;
    recompileDepth: number;
    highestCycleUnlocked: number;
    selectedCycle: number;
    cyclesCleared: number[];
    cyclesSinceLastAnchor: number;
    fluxDriveEnabled: boolean;
    bestKillsByCycle: Record<number, number>;
    bestKillsEver: { cycle: number; kills: number } | null;
  };
  modules: Array<{
    id: UpgradeId;
    name: string;
    level: number;
    maxLevel: number;
    unlocked: boolean;
    currency: string;
  }>;
  hardwareSupercharge: Array<{ id: UpgradeId; name: string; anchored: boolean; active: boolean }>;
  coreProtocols: Array<{ id: string; name: string; level: number }>;
  run: {
    inRun: boolean;
    activeCycle: number;
    runKills: number;
    runPhase: string;
    bossKillThreshold: number;
    isBossPhase: boolean;
    breachPercent: number;
    runShards: number;
    elapsed: string;
    runOutcome: string | null;
    lastRunShards: number;
    lastRunAnchorFragments: number;
  };
  computedStats: ReturnType<typeof getRunConfig> & {
    breachCap: number;
    killBreachRelief: number;
    passiveHeatPerSecEffective: number;
  };
  enemyPressure: Array<{
    cycle: number;
    label: string;
    enemyLevel: number;
    hpNormal: number;
    hpBoss: number;
    speedNormal: number;
    hitHeatPenalty: number;
    hitHeatBoss: number;
    shardReward: number;
  }>;
  devOverrides: Record<string, number>;
}

function buildEnemyPressureSamples(
  cycle: number,
  config: ReturnType<typeof getRunConfig>,
): BalanceSnapshot['enemyPressure'] {
  const sampleCycles = new Set<number>([cycle, cycle + 1, Math.max(1, cycle - 1)]);
  return [...sampleCycles]
    .filter((c) => c >= 1)
    .sort((a, b) => a - b)
    .map((sampleCycle) => {
      const enemyLevel = getEnemyLevel(sampleCycle);
      return {
        cycle: sampleCycle,
        label:
          sampleCycle === cycle
            ? `Cycle ${sampleCycle} (actif)`
            : `Cycle ${sampleCycle}`,
        enemyLevel,
        hpNormal: getEnemyMaxHp(config, false, sampleCycle),
        hpBoss: getEnemyMaxHp(config, true, sampleCycle),
        speedNormal: Math.round(getEnemySpeed(config, sampleCycle) * 10) / 10,
        hitHeatPenalty: getHitHeatPenalty({
          maxHp: getEnemyMaxHp(config, false, sampleCycle),
          cycle: sampleCycle,
        }),
        hitHeatBoss: getHitHeatPenalty({
          maxHp: getEnemyMaxHp(config, true, sampleCycle),
          cycle: sampleCycle,
        }),
        shardReward: getExpectedShardReward(config, sampleCycle),
      };
    });
}

export function buildBalanceSnapshot(): BalanceSnapshot {
  const state = useGameStore.getState();
  const config = getRunConfig(state.upgrades);
  const breachCap = getBreachCap(state.upgrades);
  const inRun = state.gameState === 'PLAYING' || state.gameState === 'PAUSED';
  const activeCycle = inRun ? state.activeCycle : state.selectedCycle;

  const modules = UPGRADE_CATALOG.map((entry) => {
    const level = getUpgradeLevel(state.upgrades, entry.id);
    const moduleRequires = MODULE_TREE_NODES.find((node) => node.id === entry.id)?.requires;
    let name: string = entry.id;
    name = getUpgradeDisplayName(entry.id);
    return {
      id: entry.id,
      name,
      level,
      maxLevel: entry.maxLevel,
      unlocked: isModuleUnlocked(entry.id, state.upgrades, moduleRequires),
      currency: entry.currency,
    };
  });

  const ownedModules = modules.filter((module) => module.level > 0 || module.unlocked);

  const hardwareSupercharge = UPGRADE_CATALOG.filter((entry) => isAnchorSuperchargeEligible(entry.id)).map(
    (entry) => {
      const anchored = entry.id in state.anchoredNodes;
      const active = state.anchoredNodes[entry.id] === true;
      let name: string = entry.id;
      name = getUpgradeDisplayName(entry.id);
      return { id: entry.id, name, anchored, active };
    },
  ).filter((row) => row.anchored);

  const coreProtocols = CORE_PROTOCOL_CATALOG.map((protocol) => ({
    id: protocol.id,
    name: protocol.name,
    level: state.coreProtocols[protocol.id] ?? 0,
  })).filter((protocol) => protocol.level > 0);

  const devOverrides = getDevRunConfigOverrides();
  const bestKillsByCycle = { ...state.bestKillsByCycle };
  const bestKillsEver = getBestKillsEver(bestKillsByCycle);

  return {
    generatedAt: new Date().toISOString(),
    gameVersion: '0.1.0',
    gameState: state.gameState,
    progression: {
      bankShards: state.bankShards,
      bankAnchorFragments: state.bankAnchorFragments,
      seedFragments: state.seedFragments,
      recompileDepth: state.recompileDepth,
      highestCycleUnlocked: state.highestCycleUnlocked,
      selectedCycle: state.selectedCycle,
      cyclesCleared: [...state.cyclesCleared],
      cyclesSinceLastAnchor: state.cyclesSinceLastAnchor,
      fluxDriveEnabled: state.fluxDriveEnabled,
      bestKillsByCycle,
      bestKillsEver,
    },
    modules: ownedModules,
    hardwareSupercharge,
    coreProtocols,
    run: {
      inRun,
      activeCycle: state.activeCycle,
      runKills: state.runKills,
      runPhase: state.runPhase,
      bossKillThreshold: BOSS_KILL_THRESHOLD,
      isBossPhase: state.runPhase === 'boss',
      breachPercent: Math.round(getBreachPercent(state.breachProgress, state.upgrades)),
      runShards: state.runShards,
      elapsed: formatRunElapsedMs(runElapsedMsRef.value),
      runOutcome: state.runOutcome,
      lastRunShards: state.lastRunShards,
      lastRunAnchorFragments: state.lastRunAnchorFragments,
    },
    computedStats: {
      ...config,
      breachCap,
      killBreachRelief: getKillBreachRelief(state.upgrades),
      passiveHeatPerSecEffective: getEffectivePassiveHeatPerSec(config),
    },
    enemyPressure: buildEnemyPressureSamples(activeCycle, config),
    devOverrides: { ...devOverrides },
  };
}

export function formatBalanceSnapshot(snapshot: BalanceSnapshot): string {
  const lines: string[] = [];
  const p = snapshot.progression;
  const r = snapshot.run;
  const cycle = r.inRun ? r.activeCycle : p.selectedCycle;

  lines.push('=== ZERO ARCHIVE — SNAPSHOT ÉQUILIBRAGE ===');
  lines.push(`Généré : ${snapshot.generatedAt}`);
  lines.push(`Version : ${snapshot.gameVersion}`);
  lines.push(`État jeu : ${snapshot.gameState}`);
  lines.push('');

  lines.push('--- PROGRESSION ---');
  lines.push(`Hex Shards (vault) : ${p.bankShards}`);
  lines.push(`Anchor Fragments : ${p.bankAnchorFragments}`);
  lines.push(`Seed Fragments (Recompile) : ${p.seedFragments}`);
  lines.push(`Profondeur Recompile : ${p.recompileDepth}`);
  lines.push(`Cycles débloqués : 1 → ${p.highestCycleUnlocked}`);
  lines.push(`Cycles complétés : [${p.cyclesCleared.join(', ') || 'aucun'}]`);
  lines.push(`Cycle sélectionné : ${p.selectedCycle}`);
  lines.push(`Cycles depuis dernier Anchor : ${p.cyclesSinceLastAnchor}`);
  lines.push(`Flux Drive toggle : ${p.fluxDriveEnabled ? 'ON' : 'OFF'}`);
  lines.push('');

  lines.push('--- RECORD KILLS MAX (sauvegardé) ---');
  if (p.bestKillsEver) {
    lines.push(
      `Meilleur score global : ${formatKillsRecordLabel(p.bestKillsEver.kills)} (cycle ${p.bestKillsEver.cycle})`,
    );
  } else {
    lines.push('Meilleur score global : aucune run enregistrée');
  }
  const killRecords = listBestKillsRecords(p.bestKillsByCycle);
  if (killRecords.length === 0) {
    lines.push('Par cycle : aucune');
  } else {
    lines.push('Par cycle :');
    for (const row of killRecords) {
      lines.push(`  Cycle ${row.cycle} : ${formatKillsRecordLabel(row.kills)}`);
    }
  }
  lines.push('');

  lines.push('--- MODULES ---');
  if (snapshot.modules.length === 0) {
    lines.push('(aucun module possédé)');
  } else {
    for (const module of snapshot.modules) {
      lines.push(
        `${module.name} (${module.id}) : ${module.level}/${module.maxLevel}${module.unlocked ? '' : ' [verrouillé]'}`,
      );
    }
  }
  lines.push('');

  if (snapshot.hardwareSupercharge.length > 0) {
    lines.push('--- HARDWARE SUPERCHARGE ---');
    for (const row of snapshot.hardwareSupercharge) {
      lines.push(`${row.name} (${row.id}) : ancré, ${row.active ? 'ACTIF' : 'inactif'}`);
    }
    lines.push('');
  }

  if (snapshot.coreProtocols.length > 0) {
    lines.push('--- PROTOCOLES DE LA GRAINE ---');
    for (const protocol of snapshot.coreProtocols) {
      lines.push(`${protocol.name} (${protocol.id}) : niveau ${protocol.level}`);
    }
    lines.push('');
  }

  lines.push('--- RUN ---');
  if (r.inRun) {
    lines.push(
      `En run : oui | Cycle ${r.activeCycle} | Kills ${r.runKills}/${r.bossKillThreshold}`,
    );
    lines.push(`Phase : ${r.runPhase}${r.isBossPhase ? ' (boss)' : ''}`);
    lines.push(`Breach / Surcharge : ${r.breachPercent}%`);
    lines.push(`Run Shards : ${r.runShards}`);
    lines.push(`Timer run : ${r.elapsed}`);
  } else if (snapshot.gameState === 'RUN_END') {
    lines.push(
      `Dernière run terminée — kills : ${r.runKills}${r.isBossPhase ? ' (boss)' : ''}`,
    );
    lines.push(`Résultat : ${r.runOutcome ?? 'inconnu'}`);
    lines.push(`Shards gagnés : ${r.lastRunShards} | Anchor gagnés : ${r.lastRunAnchorFragments}`);
  } else {
    lines.push('En run : non (hub / menu)');
    lines.push(`Derniers kills (session) : ${r.runKills > 0 ? r.runKills : 'n/a'}`);
  }
  lines.push('');

  const stats = snapshot.computedStats;
  lines.push('--- STATS CALCULÉES (build actuel) ---');
  lines.push(`Purge dégâts : ${stats.purgeHitDamage}`);
  lines.push(`Purge cadence : ${stats.purgeIntervalMs} ms`);
  lines.push(`Purge rayon : ${formatHexRadius(stats.purgeRadius)}`);
  lines.push(`Critique : ${Math.round(stats.criticalChance * 1000) / 10}% ×${stats.criticalMultiplier}`);
  lines.push(`Chaleur passive : ${stats.passiveHeatPerSec}/s (eff. ${Math.round(stats.passiveHeatPerSecEffective * 100) / 100}/s)`);
  lines.push(`Cap Breach / Meltdown : ${stats.breachCap}`);
  lines.push(`Soulagement Breach / kill : ${stats.killBreachRelief}`);
  lines.push(`Bonus shards (mult) : ×${stats.shardsMultiplier} +${stats.killBonusShards}/kill`);
  lines.push('');

  lines.push(`--- PRESSION ENNEMIE (cycle ${cycle}) ---`);
  lines.push(`Mult cycle pression : ×${Math.round(getCyclePressureMult(cycle) * 100) / 100}`);
  lines.push(`Mult cycle chaleur : ×${Math.round(getCycleHeatMult(cycle) * 100) / 100}`);
  for (const row of snapshot.enemyPressure) {
    lines.push(
      `${row.label} [lvl ${row.enemyLevel}] — HP ${row.hpNormal} (boss ${row.hpBoss}), vit. ${row.speedNormal}, riposte hit +${row.hitHeatPenalty} (boss +${row.hitHeatBoss}), shards ${row.shardReward}`,
    );
  }
  lines.push('');

  if (Object.keys(snapshot.devOverrides).length > 0) {
    lines.push('--- ⚠ OVERRIDES LABO STATS (dev) ---');
    for (const [key, value] of Object.entries(snapshot.devOverrides)) {
      lines.push(`${key} = ${value}`);
    }
    lines.push('');
  }

  const robot = getDevAutoplaySnapshot();
  if (
    robot.retargetCount > 0 ||
    robot.estimatedCoverage > 0 ||
    robot.lastOutcome != null ||
    robot.awaitingSnapshot
  ) {
    lines.push(formatDevAutoplayTelemetry());
    lines.push('');
  }

  lines.push('--- JSON (compact) ---');
  lines.push(JSON.stringify(snapshot, null, 2));

  return lines.join('\n');
}

export async function copyBalanceSnapshotToClipboard(): Promise<boolean> {
  const text = formatBalanceSnapshot(buildBalanceSnapshot());
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
