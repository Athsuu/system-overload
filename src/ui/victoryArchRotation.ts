const REMAINING_KEY = 'zero-archive-victory-arch-remaining';
const GENERAL_VARIANT_INDEX = 0;
const FULL_DECK_SIZE = 2;

function allVariantIndices(): number[] {
  return Array.from({ length: FULL_DECK_SIZE }, (_, i) => i);
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
        typeof value === 'number' && value >= 0 && value < FULL_DECK_SIZE,
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

function pickFromFullDeck(): number {
  let remaining = readRemainingDeck();
  if (remaining.length === 0) {
    remaining = shuffleDeck(allVariantIndices());
  }

  const picked = remaining[0] ?? GENERAL_VARIANT_INDEX;
  writeRemainingDeck(remaining.slice(1));

  return picked;
}

/**
 * Picks a victory ARCH line.
 * Without an Anchor Fragment earned: always the general variant.
 * With first Anchor Fragment: shuffled deck of 2 (no repeat until the other was shown).
 */
export function pickVictoryArchVariantIndex(anchorEarned: boolean): number {
  if (!anchorEarned) return GENERAL_VARIANT_INDEX;
  return pickFromFullDeck();
}

export function clearVictoryArchRotation(): void {
  sessionStorage.removeItem(REMAINING_KEY);
}
