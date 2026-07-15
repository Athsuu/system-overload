import { useEffect, useState } from 'react';
import {
  DEV_MODULE_TREE_EDITOR_EVENT,
  getDevModuleTreeEditorState,
  type DevModuleTreeEditorState,
} from './devModuleTreeEditor';

export function useDevModuleTreeEditor(): DevModuleTreeEditorState {
  const [state, setState] = useState<DevModuleTreeEditorState>(() => getDevModuleTreeEditorState());

  useEffect(() => {
    const refresh = () => setState(getDevModuleTreeEditorState());
    window.addEventListener(DEV_MODULE_TREE_EDITOR_EVENT, refresh);
    return () => window.removeEventListener(DEV_MODULE_TREE_EDITOR_EVENT, refresh);
  }, []);

  return state;
}
