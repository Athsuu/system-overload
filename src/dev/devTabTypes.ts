export type DevTabId = 'nav' | 'stats' | 'progression' | 'playtest' | 'moduletree' | 'debug';

export const DEV_TABS: { id: DevTabId; label: string }[] = [
  { id: 'nav', label: 'Nav' },
  { id: 'stats', label: 'Stats' },
  { id: 'progression', label: 'Progression' },
  { id: 'playtest', label: 'Robot' },
  { id: 'moduletree', label: 'Arbre' },
  { id: 'debug', label: 'Debug' },
];
