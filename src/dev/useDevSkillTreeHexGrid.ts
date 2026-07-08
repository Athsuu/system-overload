import { useEffect, useState } from 'react';
import {
  DEV_SKILL_TREE_HEX_GRID_EVENT,
  isDevSkillTreeHexGridVisible,
} from './devFlags';

export function useDevSkillTreeHexGrid(): boolean {
  const [visible, setVisible] = useState(isDevSkillTreeHexGridVisible);

  useEffect(() => {
    const sync = () => setVisible(isDevSkillTreeHexGridVisible());
    window.addEventListener(DEV_SKILL_TREE_HEX_GRID_EVENT, sync);
    return () => window.removeEventListener(DEV_SKILL_TREE_HEX_GRID_EVENT, sync);
  }, []);

  return visible;
}
