import { useGameStore } from '../store/useGameStore';
import { DARK_HEX } from '../theme/darkHexTerminal';
import { GAME_NARRATIVE } from './gameNarrative';
import { HexActionButton } from './HexActionButton';
import { useCountUp } from './useCountUp';

export function RunEndScreen() {
  const lastRunShards = useGameStore((state) => state.lastRunShards);
  const runOutcome = useGameStore((state) => state.runOutcome);
  const runLevel = useGameStore((state) => state.runLevel);
  const waveIndex = useGameStore((state) => state.waveIndex);
  const prestigeUnlockedThisRun = useGameStore((state) => state.prestigeUnlockedThisRun);
  const openSkillTree = useGameStore((state) => state.openSkillTree);
  const startRun = useGameStore((state) => state.startRun);

  const isVictory = runOutcome === 'victory_boss';
  const title = isVictory
    ? GAME_NARRATIVE.runEnd.victoryTitle
    : GAME_NARRATIVE.runEnd.meltdownTitle;
  const subtitle = isVictory
    ? `${GAME_NARRATIVE.runEnd.victorySubtitle} · Wave ${waveIndex} · Level ${runLevel}`
    : GAME_NARRATIVE.runEnd.meltdownSubtitle;
  const displayShards = useCountUp(lastRunShards, 600);

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center">
      <div
        className="so-animate-fade-in-slow absolute inset-0"
        style={{
          backgroundColor: isVictory ? 'rgba(10, 10, 15, 0.82)' : 'rgba(8, 4, 4, 0.9)',
        }}
      />
      <div
        className="so-animate-fade-in-slow absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${isVictory ? DARK_HEX.vignette : 'rgba(255, 40, 0, 0.12)'} 0%, transparent 65%)`,
        }}
      />

      <div
        className="relative w-full max-w-sm border px-8 py-8 text-center"
        style={{
          backgroundColor: DARK_HEX.tooltipBg,
          borderColor: isVictory ? DARK_HEX.tooltipBorder : DARK_HEX.breach,
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${isVictory ? DARK_HEX.gold : DARK_HEX.breach}, transparent)`,
          }}
        />

        <h2
          className="so-animate-reveal-title text-lg font-normal uppercase"
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: isVictory ? DARK_HEX.gold : DARK_HEX.breach,
          }}
        >
          {title}
        </h2>

        <p className="so-animate-reveal-step-1 mt-2 max-w-xs text-[10px] leading-relaxed tracking-[0.08em] text-white/45">
          {subtitle}
        </p>

        <p className="so-animate-reveal-step-2 mt-4 font-mono text-2xl font-semibold text-white">
          +{displayShards.toLocaleString()} {GAME_NARRATIVE.currency.shardsEarnedSuffix}
        </p>
        <p className="so-animate-reveal-step-2 mt-2 text-[10px] tracking-[0.25em] text-white/40 uppercase">
          {GAME_NARRATIVE.currency.transferredToVault}
        </p>

        {prestigeUnlockedThisRun && (
          <p
            className="so-animate-reveal-step-2 mt-4 text-[10px] tracking-[0.25em] uppercase"
            style={{ color: DARK_HEX.goldMuted }}
          >
            Prestige system unlocked
          </p>
        )}

        <div className="so-animate-reveal-step-3 mt-8 flex items-center justify-center gap-4">
          <HexActionButton
            label={'Skill\nTree'}
            onClick={openSkillTree}
            size="md"
            variant="secondary"
          />
          <HexActionButton label={'Start\nRun'} onClick={startRun} size="md" variant="primary" />
        </div>
      </div>
    </div>
  );
}
