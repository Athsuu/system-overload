/**
 * Canonical spotlight tutorial layout — validated in-game.
 * Tune card positions here; do not scatter magic numbers in layout logic.
 */

export const SPOTLIGHT_VIEWPORT_MARGIN = 16;
export const SPOTLIGHT_CARD_GAP = 20;
export const SPOTLIGHT_CARD_MAX_WIDTH = 300;
export const SPOTLIGHT_CARD_ESTIMATED_HEIGHT = 300;

/** Subtle dim on non-focus areas — lit zone stays native brightness. */
export const SPOTLIGHT_DIM_COLOR = 'rgba(0, 0, 0, 0.58)';

/** Warm lift inside the spotlight hole. */
export const SPOTLIGHT_LIFT_CENTER = 'rgba(255, 140, 80, 0.12)';
export const SPOTLIGHT_LIFT_MID = 'rgba(255, 77, 0, 0.06)';

/** HUD quadrant heuristics for auto placement (run-shards, overclock, purge-zone). */
export const PLACEMENT_RIGHT_THRESHOLD = 0.55;
export const PLACEMENT_LEFT_THRESHOLD = 0.45;
export const PLACEMENT_TOP_THRESHOLD = 0.4;
export const PLACEMENT_BOTTOM_THRESHOLD = 0.55;

/**
 * Overload step — card centered horizontally, below Node-0 HUD area, spotlight on bottom bar.
 * Validated offset: 115 px below viewport ratio baseline.
 */
export const OVERLOAD_CARD_TOP_VIEWPORT_RATIO = 0.52;
export const OVERLOAD_CARD_TOP_OFFSET_PX = 115;

/** Start Run tutorial card — nudge validated in-game (3 cm up, 3 cm left from base beside-button slot). */
const CM_TO_PX = 96 / 2.54;
export const START_RUN_CARD_OFFSET_LEFT_PX = Math.round(3 * CM_TO_PX);
export const START_RUN_CARD_OFFSET_TOP_PX = Math.round(3 * CM_TO_PX);

/** Module tree intro — spotlight ellipse size on the hex grid (viewport center). */
export const MODULE_TREE_SPOTLIGHT_SIZE = 720;
