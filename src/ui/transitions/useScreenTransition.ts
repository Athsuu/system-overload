import { useCallback } from 'react';
import {
  useTransitionStore,
  type ArenaToHubReason,
} from '../../store/useTransitionStore';
import { launchScreenTransition } from './launchScreenTransition';

export function useScreenTransition() {
  const isTransitioning = useTransitionStore((state) => state.isBlocking);
  const active = useTransitionStore((state) => state.active);

  const launchHubToArena = useCallback((cycle?: number) => {
    void launchScreenTransition('hubToArena', { cycle });
  }, []);

  const launchArenaToHub = useCallback((reason: ArenaToHubReason) => {
    void launchScreenTransition('arenaToHub', { reason });
  }, []);

  return {
    active,
    isTransitioning,
    launchHubToArena,
    launchArenaToHub,
  };
}
