const REMAINING_KEY = 'zero-archive-meltdown-arch-remaining';
const LEGACY_LAST_INDEX_KEY = 'zero-archive-meltdown-arch-last-index';
const VARIANT_COUNT = 3;

function allVariantIndices(): number[] {
  return Array.from({ length: VARIANT_COUNT }, (_, i) => i);
}

function shuffleDeck(indices: number[]): number[] {
  const deck = [...indices];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function readRemainingDeck(): number[] {
  const raw = sessionStorage.getItem(REMAINING_KEY);
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const indices = parsed.filter(
      (value): value is number =>
        typeof value === 'number' && value >= 0 && value < VARIANT_COUNT,
    );
    const unique = [...new Set(indices)];
    return unique.length > 0 ? unique : [];
  } catch {
    return [];
  }
}

function writeRemainingDeck(remaining: number[]): void {
  sessionStorage.setItem(REMAINING_KEY, JSON.stringify(remaining));
}

/**
 * Picks a meltdown ARCH line from a shuffled deck of 3.
 * Each variant appears once per cycle (no repeat until the other two were shown).
 * When the deck is empty, it is reshuffled — order is random every cycle.
 */
export function pickMeltdownArchVariantIndex(): number {
  sessionStorage.removeItem(LEGACY_LAST_INDEX_KEY);

  let remaining = readRemainingDeck();
  if (remaining.length === 0) {
    remaining = shuffleDeck(allVariantIndices());
  }

  const picked = remaining[0] ?? 0;
  writeRemainingDeck(remaining.slice(1));

  return picked;
}

export function clearMeltdownArchRotation(): void {
  sessionStorage.removeItem(REMAINING_KEY);
  sessionStorage.removeItem(LEGACY_LAST_INDEX_KEY);
}
