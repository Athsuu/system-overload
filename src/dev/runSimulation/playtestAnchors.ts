import type { UpgradeLevels } from '../../store/upgradeCatalog';
import type { PlaytestMeltdownAnchor } from './types';

/** Build full max utilisé lors du playtest juillet 2026. */
export const PLAYTEST_FULL_MAX_UPGRADES: UpgradeLevels = {
  node0Boot: 1,
  purgeStrike: 10,
  purgeCadence: 10,
  purgeReach: 10,
  threadCoolant: 10,
  killBreachRelief: 10,
  meltdownThreshold: 10,
};

/**
 * Repères collectés en jeu (mort surtout par breach passive).
 * - ×1 : fin manche 5
 * - ×2 : début manche 5
 */
export const PLAYTEST_MELTDOWN_ANCHORS: PlaytestMeltdownAnchor[] = [
  {
    id: 'full-max-x1-end-w5',
    label: 'Full max · vitesse ×1 · fin manche 5',
    upgrades: PLAYTEST_FULL_MAX_UPGRADES,
    timeScale: 1,
    waveIndex: 5,
    waveProgress: 1,
    notes: 'Playtest juillet 2026 — breach passive dominante.',
  },
  {
    id: 'full-max-x2-start-w5',
    label: 'Full max · vitesse ×2 · début manche 5',
    upgrades: PLAYTEST_FULL_MAX_UPGRADES,
    timeScale: 2,
    waveIndex: 5,
    waveProgress: 0,
    notes: 'Playtest juillet 2026 — même build, menu dev ×2.',
  },
];
