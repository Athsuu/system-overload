import { useEffect, useState } from 'react';
import {
  DEV_MODULE_TREE_HEX_GRID_EVENT,
  isDevModuleTreeHexGridVisible,
} from './devFlags';

export function useDevModuleTreeHexGrid(): boolean {
  const [visible, setVisible] = useState(isDevModuleTreeHexGridVisible);

  useEffect(() => {
    const sync = () => setVisible(isDevModuleTreeHexGridVisible());
    window.addEventListener(DEV_MODULE_TREE_HEX_GRID_EVENT, sync);
    return () => window.removeEventListener(DEV_MODULE_TREE_HEX_GRID_EVENT, sync);
  }, []);

  return visible;
}
