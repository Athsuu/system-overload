import { useEffect, useState } from 'react';
import { isDevInvincible } from './devActions';
import { forceStopDevAutoplayRun } from './devAutoplayGuard';
import { DevButton } from './DevButton';
import { DevDebugTab } from './DevDebugTab';
import { DevMenuHeader } from './DevMenuHeader';
import { DevNavStateTab } from './DevNavStateTab';
import { DevModuleTreeTab } from './moduleTreeEditor/DevModuleTreeTab';
import { DevPlaytestTab } from './DevPlaytestTab';
import { DevProgressionTab } from './DevProgressionTab';
import { DevStatsLabTab } from './DevStatsLabTab';
import { DEV_TABS, type DevTabId } from './devTabTypes';
import { DevTabBar } from './devUi';

export function DevMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DevTabId>('nav');
  const [invincible, setInvincible] = useState(isDevInvincible);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'x' && event.ctrlKey && event.shiftKey) {
        event.preventDefault();
        forceStopDevAutoplayRun();
        return;
      }
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
            <DevButton onClick={() => setIsOpen(false)}>Fermer</DevButton>
          </div>

          <DevMenuHeader
            invincible={invincible}
            measureFps={isOpen}
            onInvincibleChange={setInvincible}
          />

          <DevTabBar tabs={DEV_TABS} activeTab={activeTab} onSelect={setActiveTab} />

          <div className="so-dev-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
            {activeTab === 'nav' && <DevNavStateTab />}
            {activeTab === 'stats' && <DevStatsLabTab />}
            {activeTab === 'progression' && <DevProgressionTab />}
            {activeTab === 'playtest' && <DevPlaytestTab />}
            {activeTab === 'moduletree' && <DevModuleTreeTab />}
            {activeTab === 'debug' && <DevDebugTab onCloseMenu={() => setIsOpen(false)} />}
          </div>

          <div className="shrink-0 border-t border-white/8 px-4 py-2">
            <p className="text-[13px] leading-relaxed text-white/35">
              Raccourcis : <span className="text-white/50">`</span> ou Ctrl+Shift+D · arrêt robot
              Ctrl+Shift+X
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
