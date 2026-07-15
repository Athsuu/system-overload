import { useEffect, useState } from 'react';
import {
  DEV_MODULE_TREE_DRAFT_EVENT,
  getDevModuleTreeDraft,
  type DevModuleTreeDraftEntry,
} from './devModuleTreeDraft';

export function useDevModuleTreeDraft(): readonly DevModuleTreeDraftEntry[] {
  const [drafts, setDrafts] = useState<readonly DevModuleTreeDraftEntry[]>(() =>
    getDevModuleTreeDraft(),
  );

  useEffect(() => {
    const refresh = () => setDrafts(getDevModuleTreeDraft());
    window.addEventListener(DEV_MODULE_TREE_DRAFT_EVENT, refresh);
    return () => window.removeEventListener(DEV_MODULE_TREE_DRAFT_EVENT, refresh);
  }, []);

  return drafts;
}
