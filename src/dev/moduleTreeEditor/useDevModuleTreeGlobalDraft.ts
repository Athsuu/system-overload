import { useEffect, useState } from 'react';
import {
  DEV_MODULE_TREE_GLOBAL_DRAFT_EVENT,
  getDevModuleTreeGlobalDraft,
  type DevModuleTreeGlobalEntry,
} from './devModuleTreeGlobalDraft';

export function useDevModuleTreeGlobalDraft(): readonly DevModuleTreeGlobalEntry[] {
  const [entries, setEntries] = useState<readonly DevModuleTreeGlobalEntry[]>(() =>
    getDevModuleTreeGlobalDraft(),
  );

  useEffect(() => {
    const refresh = () => setEntries(getDevModuleTreeGlobalDraft());
    window.addEventListener(DEV_MODULE_TREE_GLOBAL_DRAFT_EVENT, refresh);
    return () => window.removeEventListener(DEV_MODULE_TREE_GLOBAL_DRAFT_EVENT, refresh);
  }, []);

  return entries;
}
