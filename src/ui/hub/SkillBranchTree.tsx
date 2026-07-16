import type { ReactNode } from 'react';
import { Children } from 'react';
import { SEED_PROTOCOL_VISUAL } from './seedProtocolTheme';

/**
 * Mini-arbre sous une compétence unlock : spine vertical → barre → N feuilles en rangée.
 * Les enfants sont les cartes d'amélioration (ordre catalogue).
 */
export function SkillBranchTree({ children }: { children: ReactNode }) {
  const leaves = Children.toArray(children);
  if (leaves.length === 0) return null;

  return (
    <div className="relative z-10 flex w-full max-w-[min(96vw,520px)] flex-col items-center">
      <div
        aria-hidden
        className="h-5 w-px shrink-0"
        style={{ backgroundColor: SEED_PROTOCOL_VISUAL.spineLine }}
      />
      <div
        className="relative grid w-full gap-2 sm:gap-3"
        style={{ gridTemplateColumns: `repeat(${leaves.length}, minmax(0, 1fr))` }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 h-px"
          style={{
            left: `${50 / leaves.length}%`,
            right: `${50 / leaves.length}%`,
            backgroundColor: SEED_PROTOCOL_VISUAL.spineLine,
          }}
        />
        {leaves.map((leaf, index) => (
          <div key={index} className="relative flex min-w-0 flex-col items-center">
            <div
              aria-hidden
              className="h-4 w-px shrink-0"
              style={{ backgroundColor: SEED_PROTOCOL_VISUAL.spineLine }}
            />
            <div className="w-full min-w-0">{leaf}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
