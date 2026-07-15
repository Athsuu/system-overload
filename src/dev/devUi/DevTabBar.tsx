import type { DevTabId } from '../devTabTypes';

interface DevTabBarProps {
  tabs: readonly { id: DevTabId; label: string }[];
  activeTab: DevTabId;
  onSelect: (tab: DevTabId) => void;
}

/** Grille 3×2 — tous les onglets visibles, pas de scrollbar horizontale. */
export function DevTabBar({ tabs, activeTab, onSelect }: DevTabBarProps) {
  return (
    <div className="grid shrink-0 grid-cols-3 gap-1 border-b border-white/8 px-2 py-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelect(tab.id)}
          className={`rounded-lg px-2 py-1.5 text-[12px] font-medium tracking-wide uppercase transition ${
            activeTab === tab.id
              ? 'border border-amber-500/35 bg-amber-500/12 text-amber-300'
              : 'border border-transparent text-white/40 hover:border-white/10 hover:bg-white/[0.04] hover:text-white/70'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
