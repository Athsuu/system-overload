/** Seuil de kills pour invoquer le Breach Anchor — fixe tous cycles. */
export const BOSS_KILL_THRESHOLD = 75;

/** Midpoint ambient ARCH (~ moitié du seuil boss). */
export const HORDE_KILL_MIDPOINT = Math.floor(BOSS_KILL_THRESHOLD / 2);

export const BASE_HORDE_MAX_ALIVE = 10;
/**
 * Intervalle de base — calé pour étaler le flux sur l’arène
 * (vitesse ~70 px/s ; ~1 s entre spawns).
 */
export const BASE_HORDE_SPAWN_INTERVAL_MS = 1000;
/** Plancher même avec Flux de menace max — évite le mur de spawn. */
export const MIN_HORDE_SPAWN_INTERVAL_MS = 500;

/**
 * Micro-décalage entre spawns (ms) — évite le ressenti « paquet synchronisé ».
 * Appliqué en plus de l’intervalle de base (aléatoire 0…cette valeur).
 */
export const SPAWN_STAGGER_EXTRA_MS = 120;

/**
 * Spawn hors-arène : distance hors du padding en multiples du rayon hex.
 * Assez pour voir l’ennemi entrer ; pas trop loin pour garder le tempo.
 */
export const SPAWN_OUTSET_HEX_MULT = 1.25;
/** Variation outset (×) — entrée visuelle légèrement désynchronisée. */
export const SPAWN_OUTSET_JITTER_MIN = 0.82;
export const SPAWN_OUTSET_JITTER_MAX = 1.35;
/** Point de sortie légèrement à l’intérieur du padding (fuite / fin de trajet). */
export const SPAWN_EXIT_INSET_HEX_MULT = 0.35;
