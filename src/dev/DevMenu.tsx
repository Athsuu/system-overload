import { useEffect, useState } from 'react';
import { isDevInvincible } from './devActions';
import { DevDebugTab } from './DevDebugTab';
import { DevMenuHeader } from './DevMenuHeader';
import { DevNavStateTab } from './DevNavStateTab';
import { DevProgressionTab } from './DevProgressionTab';
import { DevStatsLabTab } from './DevStatsLabTab';

type DevTabId = 'nav' | 'stats' | 'progression' | 'debug';

const DEV_TABS: { id: DevTabId; label: string }[] = [
  { id: 'nav', label: 'Nav & État' },
  { id: 'stats', label: 'Labo Stats' },
  { id: 'progression', label: 'Progression' },
  { id: 'debug', label: 'Debug' },
];

export function DevMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DevTabId>('nav');
  const [invincible, setInvincible] = useState(isDevInvincible);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === '`' || (event.key === 'd' && event.ctrlKey && event.shiftKey)) {
        event.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="pointer-events-auto fixed right-4 bottom-4 z-50 flex flex-col items-end font-sans">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[14px] font-bold tracking-widest text-amber-400 uppercase backdrop-blur-md hover:bg-amber-500/20"
        >
          DEV
        </button>
      )}

      {isOpen && (
        <div className="flex max-h-[calc(100dvh-2rem)] w-96 flex-col overflow-hidden rounded-2xl border border-amber-500/20 bg-black/85 shadow-2xl backdrop-blur-md">
          <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-4 py-3">
            <span className="text-[14px] font-bold tracking-widest text-amber-400 uppercase">
              Menu Dev
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-white/40 hover:text-white/70"
            >
              Fermer
            </button>
          </div>

          <DevMenuHeader invincible={invincible} onInvincibleChange={setInvincible} />

          <div className="flex shrink-0 gap-1 border-b border-white/8 px-3 pt-2">
            {DEV_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-t-lg px-3 py-1.5 text-[13px] font-medium tracking-wide uppercase transition ${
                  activeTab === tab.id
                    ? 'border border-b-0 border-amber-500/30 bg-amber-500/10 text-amber-300'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
            {activeTab === 'nav' && <DevNavStateTab />}
            {activeTab === 'stats' && <DevStatsLabTab />}
            {activeTab === 'progression' && <DevProgressionTab />}
            {activeTab === 'debug' && <DevDebugTab onCloseMenu={() => setIsOpen(false)} />}
          </div>

          <div className="shrink-0 border-t border-white/8 px-4 py-2">
            <p className="text-[13px] text-white/30">Raccourci : ` ou Ctrl+Shift+D</p>
          </div>
        </div>
      )}
    </div>
  );
}
