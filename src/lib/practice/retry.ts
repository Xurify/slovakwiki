/**
 * A missed card comes back later in the same session, as a fresh sentence for the same
 * rule. Three cards later is long enough that the answer is not still on screen, and
 * short enough that the explanation is still fresh.
 */
export const RETRY_GAP = 3;

/** Keeps a bad session from doubling in length. */
export const MAX_RETRIES = 4;

/** `queue` with `retry` placed RETRY_GAP cards after `missedIndex`, or at the end. */
export function insertRetry<T>(queue: readonly T[], missedIndex: number, retry: T): T[] {
  const at = Math.min(missedIndex + 1 + RETRY_GAP, queue.length);
  return [...queue.slice(0, at), retry, ...queue.slice(at)];
}

/**
 * Draws from `draw` until the sentence differs from the missed one, so the second try
 * tests the rule, not memory of the first answer. Falls back to the last draw.
 */
export function freshVariant<T>(
  draw: () => T,
  sentence: (item: T) => string | undefined,
  missed: T,
  attempts = 8,
): T {
  let candidate = draw();
  for (let tries = 1; tries < attempts; tries += 1) {
    if (sentence(candidate) !== sentence(missed)) return candidate;
    candidate = draw();
  }
  return candidate;
}
